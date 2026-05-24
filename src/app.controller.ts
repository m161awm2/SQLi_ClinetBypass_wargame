import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('api/login')
  @HttpCode(200)
  login(@Body() body: { username?: string; password?: string }) {
    return this.appService.login(body.username, body.password);
  }

  @Post('api/flag')
  @HttpCode(200)
  getFlag(@Body() body: { currentCount?: number; role?: string }) {
    return this.appService.getFlag(body.currentCount, body.role);
  }
}
