import { Controller, Get, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(@Inject('MQTT_SERVICE') private client: ClientProxy) {}

  @Get("device")
  async getDevice() {
    const deviceStatus = {
      imei: "0123456789",
      ip: "128.0.0.1",
      inputs: 1,
      outputs: 0,
      led: 0,
      button: 0,
    }
    return this.client.send("device/status", deviceStatus)
  }

  @Get("position")
  async getPosition() {
    const position = {
      imei: "866349041749536",
      latitude: 51.2291589,
      longitude: 6.7160651,
      utc: new Date().getTime()
    }
    return this.client.send(`gps/coordinates/${position.imei}`, position)
  }
}
