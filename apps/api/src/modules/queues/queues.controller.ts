import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { QueuesService, QueueJobDto } from './queues.service';

@Controller('projects/:projectId/queues')
export class QueuesController {
  constructor(private readonly queuesService: QueuesService) {}

  @Post('jobs')
  @HttpCode(HttpStatus.CREATED)
  addJob(
    @Param('projectId') projectId: string,
    @Body() jobDto: Omit<QueueJobDto, 'projectId'>,
  ) {
    return this.queuesService.addJob({ ...jobDto, projectId });
  }

  @Get('jobs/:queueName/:jobId/status')
  getJobStatus(
    @Param('queueName') queueName: string,
    @Param('jobId') jobId: string,
  ) {
    return this.queuesService.getJobStatus(queueName, jobId);
  }

  @Delete('jobs/:queueName/:jobId')
  @HttpCode(HttpStatus.OK)
  cancelJob(
    @Param('queueName') queueName: string,
    @Param('jobId') jobId: string,
  ) {
    return this.queuesService.cancelJob(queueName, jobId);
  }

  @Get('stats')
  getQueueStats(@Query('queue') queueName?: string) {
    return this.queuesService.getQueueStats(queueName);
  }

  @Post(':queueName/pause')
  @HttpCode(HttpStatus.OK)
  pauseQueue(@Param('queueName') queueName: string) {
    return this.queuesService.pauseQueue(queueName);
  }

  @Post(':queueName/resume')
  @HttpCode(HttpStatus.OK)
  resumeQueue(@Param('queueName') queueName: string) {
    return this.queuesService.resumeQueue(queueName);
  }

  @Get('health')
  getHealthStatus() {
    return this.queuesService.getHealthStatus();
  }
}

@Controller('queues')
export class GlobalQueuesController {
  constructor(private readonly queuesService: QueuesService) {}

  @Get('stats')
  getAllQueueStats(@Query('queue') queueName?: string) {
    return this.queuesService.getQueueStats(queueName);
  }

  @Get('health')
  getGlobalHealthStatus() {
    return this.queuesService.getHealthStatus();
  }

  @Post(':queueName/pause')
  @HttpCode(HttpStatus.OK)
  pauseGlobalQueue(@Param('queueName') queueName: string) {
    return this.queuesService.pauseQueue(queueName);
  }

  @Post(':queueName/resume')
  @HttpCode(HttpStatus.OK)
  resumeGlobalQueue(@Param('queueName') queueName: string) {
    return this.queuesService.resumeQueue(queueName);
  }
}