import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { DevicesService } from './devices.service';
import { RegisterDeviceDto } from './dto/register-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { Platform } from './schemas/device.schema';

@Controller('projects/:projectId/devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(
    @Param('projectId') projectId: string,
    @Body() registerDeviceDto: RegisterDeviceDto,
  ) {
    return this.devicesService.register(projectId, registerDeviceDto);
  }

  @Get()
  findAll(
    @Param('projectId') projectId: string,
    @Query('platform') platform?: Platform,
    @Query('userId') userId?: string,
    @Query('tags') tags?: string,
    @Query('topics') topics?: string,
    @Query('isActive') isActive?: string,
  ) {
    const filters: any = {};
    
    if (platform) filters.platform = platform;
    if (userId) filters.userId = userId;
    if (isActive !== undefined) filters.isActive = isActive === 'true';
    if (tags) filters.tags = tags.split(',');
    if (topics) filters.topics = topics.split(',');

    return this.devicesService.findByProject(projectId, filters);
  }

  @Get('stats')
  getStats(@Param('projectId') projectId: string) {
    return this.devicesService.getStats(projectId);
  }

  @Get(':id')
  findOne(@Param('projectId') projectId: string, @Param('id') id: string) {
    return this.devicesService.findOne(projectId, id);
  }

  @Patch(':id')
  update(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Body() updateDeviceDto: UpdateDeviceDto,
  ) {
    return this.devicesService.update(projectId, id, updateDeviceDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('projectId') projectId: string, @Param('id') id: string) {
    return this.devicesService.remove(projectId, id);
  }

  @Post(':id/topics/:topic')
  addToTopic(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Param('topic') topic: string,
  ) {
    return this.devicesService.addToTopic(projectId, id, topic);
  }

  @Delete(':id/topics/:topic')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeFromTopic(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Param('topic') topic: string,
  ) {
    return this.devicesService.removeFromTopic(projectId, id, topic);
  }
}