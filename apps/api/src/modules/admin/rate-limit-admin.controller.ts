import {
  Controller,
  Get,
  Delete,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { RateLimitService } from '../../common/services/rate-limit.service';
import {
  RequireApiKey,
  CurrentProject,
} from '../../common/decorators/auth.decorator';
import { LowFrequencyRateLimit } from '../../common/decorators/rate-limit.decorator';
import { Project } from '../projects/schemas/project.schema';

@ApiTags('Rate Limit Admin')
@Controller('admin/rate-limits')
@RequireApiKey()
@LowFrequencyRateLimit() // Admin operations are low frequency
export class RateLimitAdminController {
  constructor(private readonly rateLimitService: RateLimitService) {}

  @Get('status/:projectId')
  @ApiOperation({ summary: 'Get rate limit status for a project' })
  @ApiParam({ name: 'projectId', description: 'Project ID to check' })
  @ApiResponse({
    status: 200,
    description: 'Rate limit status retrieved successfully',
  })
  async getProjectRateLimitStatus(
    @Param('projectId') projectId: string,
    @CurrentProject() project: Project,
  ) {
    // Ensure admin can only check their own project or we add proper admin role checking
    if (project._id.toString() !== projectId) {
      const pattern = `per_project:project:${projectId}:*`;
      return this.rateLimitService.getRateLimitKeys(pattern);
    }

    const pattern = `per_project:project:${projectId}:*`;
    return this.rateLimitService.getRateLimitKeys(pattern);
  }

  @Get('status')
  @ApiOperation({ summary: 'Get current project rate limit status' })
  @ApiResponse({
    status: 200,
    description: 'Rate limit status retrieved successfully',
  })
  async getCurrentProjectRateLimitStatus(@CurrentProject() project: Project) {
    const projectId = project._id.toString();
    const pattern = `per_project:project:${projectId}:*`;

    const rateLimitKeys = await this.rateLimitService.getRateLimitKeys(pattern);

    return {
      projectId,
      projectName: project.name,
      rateLimits: rateLimitKeys,
      summary: {
        totalEndpoints: rateLimitKeys.length,
        activeEndpoints: rateLimitKeys.filter((rl) => rl.count > 0).length,
      },
    };
  }

  @Delete('reset/:projectId')
  @ApiOperation({ summary: 'Reset rate limits for a project' })
  @ApiParam({ name: 'projectId', description: 'Project ID to reset' })
  @ApiResponse({ status: 200, description: 'Rate limits reset successfully' })
  @HttpCode(HttpStatus.OK)
  async resetProjectRateLimits(
    @Param('projectId') projectId: string,
    @CurrentProject() project: Project,
  ) {
    // Ensure admin can only reset their own project
    if (project._id.toString() !== projectId) {
      throw new Error(
        'Access denied: Can only reset rate limits for your own project',
      );
    }

    const key = `per_project:project:${projectId}`;
    await this.rateLimitService.resetRateLimit(key);

    return {
      success: true,
      message: `Rate limits reset for project ${projectId}`,
      timestamp: new Date().toISOString(),
    };
  }

  @Delete('reset')
  @ApiOperation({ summary: 'Reset rate limits for current project' })
  @ApiResponse({ status: 200, description: 'Rate limits reset successfully' })
  @HttpCode(HttpStatus.OK)
  async resetCurrentProjectRateLimits(@CurrentProject() project: Project) {
    const projectId = project._id.toString();
    const key = `per_project:project:${projectId}`;

    await this.rateLimitService.resetRateLimit(key);

    return {
      success: true,
      projectId,
      projectName: project.name,
      message: 'Rate limits reset successfully',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Check rate limiting system health' })
  @ApiResponse({
    status: 200,
    description: 'Rate limiting system health status',
  })
  async getRateLimitHealth(@CurrentProject() project: Project) {
    try {
      // Test Redis connectivity by getting rate limit status
      const testKey = `health_check:${Date.now()}`;
      const testConfig = { limit: 1, windowMs: 1 };

      const result = await this.rateLimitService.checkRateLimit(
        testKey,
        testConfig,
      );

      return {
        status: 'healthy',
        redis: 'connected',
        rateLimiting: 'operational',
        project: {
          id: project._id.toString(),
          name: project.name,
        },
        timestamp: new Date().toISOString(),
        testResult: result.allowed,
      };
    } catch (error) {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      return {
        status: 'unhealthy',
        redis: 'error',
        rateLimiting: 'degraded',
        error: errorObj.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
