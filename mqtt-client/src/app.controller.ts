import { Controller, Get, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(@Inject('MQTT_SERVICE') private client: ClientProxy) {}

  @Get("device")
  async getPositions() {
    const deviceStatus = {
      imei: "0123456789",
      ip: "128.0.0.1",
      inputs: 1,
      outputs: 0,
      led: 0,
      button: 0,
    }
    return this.client.send("device/status", JSON.stringify(deviceStatus))
  }
}
