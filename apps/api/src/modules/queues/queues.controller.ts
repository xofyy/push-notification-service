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
  ForbiddenException,
} from '@nestjs/common';
import { QueuesService, QueueJobDto } from './queues.service';
import {
  RequireApiKey,
  CurrentProject,
} from '../../common/decorators/auth.decorator';
import {
  MediumFrequencyRateLimit,
  LowFrequencyRateLimit,
} from '../../common/decorators/rate-limit.decorator';
import { Project } from '../projects/schemas/project.schema';

@Controller('projects/:projectId/queues')
@RequireApiKey()
export class QueuesController {
  constructor(private readonly queuesService: QueuesService) {}

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

  @Post('jobs')
  @HttpCode(HttpStatus.CREATED)
  @MediumFrequencyRateLimit() // 300 requests per minute for job creation
  addJob(
    @Param('projectId') projectId: string,
    @Body() jobDto: Omit<QueueJobDto, 'projectId'>,
    @CurrentProject() project: Project,
  ) {
    this.validateProjectAccess(projectId, project);
    return this.queuesService.addJob({ ...jobDto, projectId });
  }

  @Get('jobs/:queueName/:jobId/status')
  getJobStatus(
    @Param('projectId') projectId: string,
    @Param('queueName') queueName: string,
    @Param('jobId') jobId: string,
    @CurrentProject() project: Project,
  ) {
    this.validateProjectAccess(projectId, project);
    return this.queuesService.getJobStatus(queueName, jobId);
  }

  @Delete('jobs/:queueName/:jobId')
  @HttpCode(HttpStatus.OK)
  cancelJob(
    @Param('projectId') projectId: string,
    @Param('queueName') queueName: string,
    @Param('jobId') jobId: string,
    @CurrentProject() project: Project,
  ) {
    this.validateProjectAccess(projectId, project);
    return this.queuesService.cancelJob(queueName, jobId);
  }

  @Get('stats')
  @LowFrequencyRateLimit() // 1000 requests per hour for stats
  getQueueStats(
    @Param('projectId') projectId: string,
    @CurrentProject() project: Project,
    @Query('queue') queueName?: string,
  ) {
    this.validateProjectAccess(projectId, project);
    return this.queuesService.getQueueStats(queueName);
  }

  @Post(':queueName/pause')
  @HttpCode(HttpStatus.OK)
  pauseQueue(
    @Param('projectId') projectId: string,
    @Param('queueName') queueName: string,
    @CurrentProject() project: Project,
  ) {
    this.validateProjectAccess(projectId, project);
    return this.queuesService.pauseQueue(queueName);
  }

  @Post(':queueName/resume')
  @HttpCode(HttpStatus.OK)
  resumeQueue(
    @Param('projectId') projectId: string,
    @Param('queueName') queueName: string,
    @CurrentProject() project: Project,
  ) {
    this.validateProjectAccess(projectId, project);
    return this.queuesService.resumeQueue(queueName);
  }

  @Get('health')
  getHealthStatus(
    @Param('projectId') projectId: string,
    @CurrentProject() project: Project,
  ) {
    this.validateProjectAccess(projectId, project);
    return this.queuesService.getHealthStatus();
  }
}

@Controller('queues')
@RequireApiKey()
export class GlobalQueuesController {
  constructor(private readonly queuesService: QueuesService) {}

  @Get('stats')
  getAllQueueStats(
    @Query('queue') queueName?: string,
    @CurrentProject() project?: Project,
  ) {
    // Global stats - no project validation needed as it's system-wide
    return this.queuesService.getQueueStats(queueName);
  }

  @Get('health')
  getGlobalHealthStatus(@CurrentProject() project?: Project) {
    // Global health check - no project validation needed
    return this.queuesService.getHealthStatus();
  }

  @Post(':queueName/pause')
  @HttpCode(HttpStatus.OK)
  pauseGlobalQueue(
    @Param('queueName') queueName: string,
    @CurrentProject() project?: Project,
  ) {
    // Global queue control - requires authentication but no project validation
    return this.queuesService.pauseQueue(queueName);
  }

  @Post(':queueName/resume')
  @HttpCode(HttpStatus.OK)
  resumeGlobalQueue(
    @Param('queueName') queueName: string,
    @CurrentProject() project?: Project,
  ) {
    // Global queue control - requires authentication but no project validation
    return this.queuesService.resumeQueue(queueName);
  }
}
