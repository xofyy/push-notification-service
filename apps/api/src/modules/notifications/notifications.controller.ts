import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { SendNotificationDto } from './dto/send-notification.dto';
import {
  NotificationStatus,
  NotificationType,
} from './schemas/notification.schema';

@Controller('projects/:projectId/notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('send')
  @HttpCode(HttpStatus.CREATED)
  send(
    @Param('projectId') projectId: string,
    @Body() sendNotificationDto: SendNotificationDto,
  ) {
    return this.notificationsService.send(projectId, sendNotificationDto);
  }

  @Get()
  findAll(
    @Param('projectId') projectId: string,
    @Query('status') status?: NotificationStatus,
    @Query('type') type?: NotificationType,
    @Query('limit') limit?: string,
    @Query('skip') skip?: string,
  ) {
    const filters: any = {};

    if (status) filters.status = status;
    if (type) filters.type = type;
    if (limit) filters.limit = parseInt(limit, 10);
    if (skip) filters.skip = parseInt(skip, 10);

    return this.notificationsService.findByProject(projectId, filters);
  }

  @Get('stats')
  getStats(
    @Param('projectId') projectId: string,
    @Query('days') days?: string,
  ) {
    const daysNumber = days ? parseInt(days, 10) : 30;
    return this.notificationsService.getStats(projectId, daysNumber);
  }

  @Get(':id')
  findOne(@Param('projectId') projectId: string, @Param('id') id: string) {
    return this.notificationsService.findOne(projectId, id);
  }

  @Patch(':id/cancel')
  cancel(@Param('projectId') projectId: string, @Param('id') id: string) {
    return this.notificationsService.cancel(projectId, id);
  }
}
