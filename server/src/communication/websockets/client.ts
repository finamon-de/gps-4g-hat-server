import { Injectable, Logger } from '@nestjs/common';
import { io, Socket } from 'socket.io-client';

@Injectable()
export class WebSocketClient {
  socket: Socket;

  constructor() {
    this.socket = io(`http://localhost:${process.env.API_PORT}`);
    if (this.socket) {
      this.init();
    } else {
      throw new Error('WebSocket client cannot be initialized');
    }
  }

  init() {
    this.socket.on('connect', () => {
      Logger.log(`WebSocket client connected (${this.socket.id})`);
    });
  }
}
