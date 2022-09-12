import { Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WsResponse,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Observable } from 'rxjs';
import { Socket } from 'socket.io';
import { inspect } from 'util';

@WebSocketGateway({ cors: true })
export class PositionGateway implements OnGatewayConnection, OnGatewayDisconnect {
  // @WebSocketServer()
  // server: Server;

  private connectedClients = []

  constructor() {}

  handleDisconnect(client: any) {
    Logger.log("Client disconnected " + client.id)

    this.connectedClients.map((c, index) => {
      if (c.socketId === client.id) {
        return index
      }
    }).forEach(i => {
      this.connectedClients[i] = null
    });

    this.connectedClients = this.connectedClients.filter(c => c !== null)
  }
  
  handleConnection(client: any, ...args: any[]) {
    Logger.log("Client connected " + client.id);

    const userId = client.handshake.query.userId;

    if (userId && userId !== '() ') {
      const objToAdd = {
        userId: userId,
        socketId: client.id,
        socket: client
      }
      this.connectedClients.push(objToAdd);
    }
  }

  @OnEvent('ws.position')
  handleNewPositionEvent(data) {
    Logger.log('new emitted position')
    Logger.log(inspect(data))
    Logger.log(inspect(this.connectedClients))
    if (data.userId) {
      try {
        this.connectedClients.forEach(client => {
          if (client.userId === data.userId) {
            Logger.log(`Position emitted for ${data.userId} on socket ${client.socketId}`)
            client.socket.emit('positions', data.record)
          }
        })
      } catch (e) {
        Logger.log(e)
      }
    }
  }

  @SubscribeMessage('positions')
  receiveUpdate(
    @MessageBody() data: any,
    @ConnectedSocket() socket: Socket,
  ): Observable<WsResponse<number>> {
    Logger.log(data);

    

    // socket.broadcast.emit('positions', data);
    // return data
    return data;
  }
}
