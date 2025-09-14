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
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiSecurity,
  ApiHeader,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { DevicesService } from './devices.service';
import { RegisterDeviceDto } from './dto/register-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { SegmentQuery } from './dto/segment-query.dto';
import { Platform } from './schemas/device.schema';
import {
  RequireApiKey,
  CurrentProject,
} from '../../common/decorators/auth.decorator';
import {
  HighFrequencyRateLimit,
  MediumFrequencyRateLimit,
  StrictRateLimit,
} from '../../common/decorators/rate-limit.decorator';
import { Project } from '../projects/schemas/project.schema';

@ApiTags('Devices')
@Controller('projects/:projectId/devices')
@RequireApiKey()
@ApiSecurity('ApiKeyAuth')
@ApiHeader({
  name: 'X-API-Key',
  description: 'API Key for authentication',
  required: true,
})
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  /**
   * Validates that the projectId parameter matches the authenticated project
   * @param projectId - Project ID from URL parameter
   * @param project - Authenticated project from API key
   */
  private validateProjectAccess(projectId: string, project: Project): void {
    if (project._id.toString() !== projectId) {
      throw new ForbiddenException('Access denied to this project');
    }
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @HighFrequencyRateLimit() // 100 requests per minute for device registration
  @ApiOperation({
    summary: 'Register device',
    description: `
      Registers a new device for push notifications with enhanced validation.
      Automatically detects platform and validates device tokens.
      Rate limited to 100 requests per minute.
    `,
  })
  @ApiParam({
    name: 'projectId',
    description: 'Project ID',
    example: '64f1a2b3c4d5e6f7a8b9c0d1',
  })
  @ApiResponse({
    status: 201,
    description: 'Device registered successfully',
    schema: {
      example: {
        _id: '64f1a2b3c4d5e6f7a8b9c0d3',
        projectId: '64f1a2b3c4d5e6f7a8b9c0d1',
        token: 'fcm_token_here_1234567890',
        platform: 'android',
        userId: 'user123',
        isActive: true,
        tags: ['premium', 'beta-tester'],
        properties: {
          appVersion: '1.2.3',
          deviceModel: 'Pixel 7',
          osVersion: '13',
        },
        lastSeen: '2023-12-07T16:45:00.000Z',
        createdAt: '2023-12-07T16:45:00.000Z',
        updatedAt: '2023-12-07T16:45:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid device data or token',
    schema: {
      example: {
        statusCode: 400,
        message: 'Invalid FCM token format',
        error: 'Bad Request',
      },
    },
  })
  register(
    @Param('projectId') projectId: string,
    @Body() registerDeviceDto: RegisterDeviceDto,
    @Req() request: Request,
    @CurrentProject() project: Project,
  ) {
    this.validateProjectAccess(projectId, project);
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
    @CurrentProject() project: Project,
  ) {
    this.validateProjectAccess(projectId, project);
    return this.devicesService.register(projectId, registerDeviceDto);
  }

  @Post('validate-token')
  @HttpCode(HttpStatus.OK)
  @StrictRateLimit() // 10 requests per minute for token validation
  @ApiOperation({
    summary: 'Validate device token',
    description: `
      Validates a device token for a specific platform.
      Checks token format and verifies with the respective push service.
      Rate limited to 10 requests per minute due to external API calls.
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Token validation result',
    schema: {
      example: {
        valid: true,
        platform: 'android',
        tokenType: 'fcm',
        lastValidated: '2023-12-07T16:50:00.000Z',
        metadata: {
          appId: 'com.example.app',
          projectId: 'firebase-project-123',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid token format',
  })
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
  @StrictRateLimit() // 10 requests per minute for batch validation
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
    @CurrentProject() project: Project,
    @Query('dryRun') dryRun?: string,
  ) {
    this.validateProjectAccess(projectId, project);
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
    @CurrentProject() project: Project,
    @Query('platform') platform?: Platform,
    @Query('userId') userId?: string,
    @Query('tags') tags?: string,
    @Query('topics') topics?: string,
    @Query('isActive') isActive?: string,
  ) {
    this.validateProjectAccess(projectId, project);
    const filters: any = {};

    if (platform) filters.platform = platform;
    if (userId) filters.userId = userId;
    if (isActive !== undefined) filters.isActive = isActive === 'true';
    if (tags) filters.tags = tags.split(',');
    if (topics) filters.topics = topics.split(',');

    return this.devicesService.findByProject(projectId, filters);
  }

  @Get('stats')
  getStats(
    @Param('projectId') projectId: string,
    @CurrentProject() project: Project,
  ) {
    this.validateProjectAccess(projectId, project);
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
    @CurrentProject() project: Project,
    @Body() segmentQuery: SegmentQuery,
  ) {
    this.validateProjectAccess(projectId, project);
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
    return this.devicesService.getDeviceTokensBySegment(
      projectId,
      segmentQuery,
    );
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
  findOne(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @CurrentProject() project: Project,
  ) {
    this.validateProjectAccess(projectId, project);
    return this.devicesService.findOne(projectId, id);
  }

  @Patch(':id')
  update(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Body() updateDeviceDto: UpdateDeviceDto,
    @CurrentProject() project: Project,
  ) {
    this.validateProjectAccess(projectId, project);
    return this.devicesService.update(projectId, id, updateDeviceDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @CurrentProject() project: Project,
  ) {
    this.validateProjectAccess(projectId, project);
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
    return this.devicesService.removeProperties(
      projectId,
      id,
      body.propertyKeys,
    );
  }
}
