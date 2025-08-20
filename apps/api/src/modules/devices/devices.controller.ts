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
  Req,
  Put,
} from '@nestjs/common';
import type { Request } from 'express';
import { DevicesService } from './devices.service';
import { RegisterDeviceDto } from './dto/register-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { SegmentQuery } from './dto/segment-query.dto';
import { Platform } from './schemas/device.schema';

@Controller('projects/:projectId/devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(
    @Param('projectId') projectId: string,
    @Body() registerDeviceDto: RegisterDeviceDto,
    @Req() request: Request,
  ) {
    return this.devicesService.registerEnhanced(projectId, registerDeviceDto, {
      autoDetectPlatform: true,
      validateToken: true,
      userAgent: request.headers['user-agent'],
    });
  }

  @Post('register/basic')
  @HttpCode(HttpStatus.CREATED)
  registerBasic(
    @Param('projectId') projectId: string,
    @Body() registerDeviceDto: RegisterDeviceDto,
  ) {
    return this.devicesService.register(projectId, registerDeviceDto);
  }

  @Post('validate-token')
  @HttpCode(HttpStatus.OK)
  validateToken(
    @Body() body: { token: string; platform?: Platform },
    @Req() request: Request,
  ) {
    return this.devicesService.validateToken(body.token, body.platform, {
      userAgent: request.headers['user-agent'],
    });
  }

  @Post('validate-tokens-batch')
  @HttpCode(HttpStatus.OK)
  validateTokensBatch(
    @Body() body: { tokens: Array<{ token: string; platform?: Platform }> },
    @Req() request: Request,
  ) {
    return this.devicesService.validateTokensBatch(body.tokens, {
      userAgent: request.headers['user-agent'],
    });
  }

  @Post('cleanup-tokens')
  @HttpCode(HttpStatus.OK)
  cleanupTokens(
    @Param('projectId') projectId: string,
    @Query('dryRun') dryRun?: string,
  ) {
    return this.devicesService.cleanupInvalidTokens(
      projectId,
      dryRun !== 'false',
    );
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  refreshToken(
    @Param('projectId') projectId: string,
    @Body() body: { oldToken: string; newToken: string },
    @Req() request: Request,
  ) {
    return this.devicesService.refreshToken(
      projectId,
      body.oldToken,
      body.newToken,
      {
        validateToken: true,
        autoDetectPlatform: true,
        userAgent: request.headers['user-agent'],
      },
    );
  }

  @Patch(':id/token')
  updateToken(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Body() body: { token: string },
    @Req() request: Request,
  ) {
    return this.devicesService.updateToken(projectId, id, body.token, {
      validateToken: true,
      autoDetectPlatform: true,
      userAgent: request.headers['user-agent'],
    });
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

  @Get('tags')
  getProjectTags(@Param('projectId') projectId: string) {
    return this.devicesService.getProjectTags(projectId);
  }

  @Get('tags/stats')
  getTagStats(@Param('projectId') projectId: string) {
    return this.devicesService.getTagStats(projectId);
  }

  @Get('properties/stats')
  getPropertyStats(@Param('projectId') projectId: string) {
    return this.devicesService.getPropertyStats(projectId);
  }

  @Post('segment/query')
  @HttpCode(HttpStatus.OK)
  queryDevicesBySegment(
    @Param('projectId') projectId: string,
    @Body() segmentQuery: SegmentQuery,
  ) {
    return this.devicesService.queryDevicesBySegment(projectId, segmentQuery);
  }

  @Post('segment/count')
  @HttpCode(HttpStatus.OK)
  countDevicesBySegment(
    @Param('projectId') projectId: string,
    @Body() segmentQuery: SegmentQuery,
  ) {
    return this.devicesService.countDevicesBySegment(projectId, segmentQuery);
  }

  @Post('segment/tokens')
  @HttpCode(HttpStatus.OK)
  getTokensBySegment(
    @Param('projectId') projectId: string,
    @Body() segmentQuery: SegmentQuery,
  ) {
    return this.devicesService.getDeviceTokensBySegment(projectId, segmentQuery);
  }

  @Post('segment/test')
  @HttpCode(HttpStatus.OK)
  testSegmentQuery(
    @Param('projectId') projectId: string,
    @Body() segmentQuery: SegmentQuery,
  ) {
    return this.devicesService.testSegmentQuery(projectId, segmentQuery);
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

  @Post(':id/tags')
  addTags(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Body() body: { tags: string[] },
  ) {
    return this.devicesService.addTags(projectId, id, body.tags);
  }

  @Delete(':id/tags')
  removeTags(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Body() body: { tags: string[] },
  ) {
    return this.devicesService.removeTags(projectId, id, body.tags);
  }

  @Put(':id/properties')
  setProperties(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Body() body: { properties: Record<string, any> },
  ) {
    return this.devicesService.setProperties(projectId, id, body.properties);
  }

  @Patch(':id/properties')
  updateProperties(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Body() body: { properties: Record<string, any> },
  ) {
    return this.devicesService.updateProperties(projectId, id, body.properties);
  }

  @Delete(':id/properties')
  removeProperties(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Body() body: { propertyKeys: string[] },
  ) {
    return this.devicesService.removeProperties(projectId, id, body.propertyKeys);
  }
}
