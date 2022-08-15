import { Module } from '@nestjs/common';
import { WebSocketClient } from './client';

@Module({
  providers: [WebSocketClient],
  exports: [WebSocketClient],
})
export class WebSocketModule {}
