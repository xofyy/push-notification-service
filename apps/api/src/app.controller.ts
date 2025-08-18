import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  async getHealth() {
    return await this.appService.getHealth();
  }

  @Get()
  getInfo() {
    return this.appService.getInfo();
  }
}
