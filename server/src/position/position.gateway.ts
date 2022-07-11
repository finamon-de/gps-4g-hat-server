import { Logger } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, WsResponse, ConnectedSocket } from '@nestjs/websockets';
import { Observable } from 'rxjs';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true})
export class PositionGateway {
    
    @WebSocketServer()
    server: Server

    @SubscribeMessage('positions')
    receiveUpdate(@MessageBody() data: any, @ConnectedSocket() socket: Socket): Observable<WsResponse<number>> {
        Logger.log(data)
        socket.broadcast.emit("positions", data)
        // return data
        return undefined
    }
}