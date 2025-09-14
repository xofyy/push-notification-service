import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { WebhooksService } from './webhooks.service';
import { RequireApiKey, CurrentProject } from '../../common/decorators/auth.decorator';
import { Project } from '../projects/schemas/project.schema';
import { ApiQuery } from '@nestjs/swagger';

@ApiTags('Webhooks')
@Controller('projects/:projectId/webhooks')
@RequireApiKey()
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  private ensure(projectId: string, project: Project) {
    if (project._id.toString() !== projectId) {
      throw new Error('Access denied to this project');
    }
  }

  @Get()
  @ApiOperation({ summary: 'List project webhooks' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  list(@Param('projectId') projectId: string, @CurrentProject() project: Project) {
    this.ensure(projectId, project);
    return this.webhooksService.list(projectId);
  }

  @Post()
  @ApiOperation({ summary: 'Add a project webhook' })
  @HttpCode(HttpStatus.CREATED)
  add(
    @Param('projectId') projectId: string,
    @Body() body: { url: string; events: string[] },
    @CurrentProject() project: Project,
  ) {
    this.ensure(projectId, project);
    return this.webhooksService.add(projectId, body);
  }

  @Post(':index')
  @ApiOperation({ summary: 'Update a webhook by index' })
  update(
    @Param('projectId') projectId: string,
    @Param('index') index: string,
    @Body() body: { url?: string; events?: string[] },
    @CurrentProject() project: Project,
  ) {
    this.ensure(projectId, project);
    return this.webhooksService.update(projectId, parseInt(index, 10), body);
  }

  @Delete(':index')
  @ApiOperation({ summary: 'Remove a webhook by index' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('projectId') projectId: string,
    @Param('index') index: string,
    @CurrentProject() project: Project,
  ) {
    this.ensure(projectId, project);
    await this.webhooksService.remove(projectId, parseInt(index, 10));
    return { success: true };
  }

  @Post('secret/rotate')
  @ApiOperation({ summary: 'Rotate webhook signing secret' })
  rotateSecret(@Param('projectId') projectId: string, @CurrentProject() project: Project) {
    this.ensure(projectId, project);
    return this.webhooksService.rotateSecret(projectId);
  }

  @Get('deliveries')
  @ApiOperation({ summary: 'List webhook delivery logs (paginated)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'offset', required: false, type: Number, example: 0 })
  listDeliveries(
    @Param('projectId') projectId: string,
    @CurrentProject() project: Project,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    this.ensure(projectId, project);
    return this.webhooksService.listDeliveries(
      projectId,
      limit ? parseInt(limit, 10) : 20,
      offset ? parseInt(offset, 10) : 0,
    );
  }
}
