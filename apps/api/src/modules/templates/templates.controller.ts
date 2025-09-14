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
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { TemplatesService } from './templates.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import {
  RenderTemplateDto,
  ValidateTemplateDto,
} from './dto/render-template.dto';
import {
  RequireApiKey,
  CurrentProject,
} from '../../common/decorators/auth.decorator';
import {
  MediumFrequencyRateLimit,
  HighFrequencyRateLimit,
} from '../../common/decorators/rate-limit.decorator';
import { Project } from '../projects/schemas/project.schema';
import { ApiPaginatedResponse } from '../../common/dto/paginated-response.decorator';
import { Template } from './schemas/template.schema';
import { ErrorResponseDto } from '../../common/dto/error-response.dto';

@ApiTags('Templates')
@Controller('projects/:projectId/templates')
@RequireApiKey()
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

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

  @Post()
  @ApiOperation({ summary: 'Create a new notification template' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiResponse({ status: 201, description: 'Template created successfully' })
  @ApiResponse({
    status: 409,
    description: 'Template with same name already exists',
  })
  create(
    @Param('projectId') projectId: string,
    @Body() createTemplateDto: CreateTemplateDto,
    @CurrentProject() project: Project,
  ) {
    this.validateProjectAccess(projectId, project);
    return this.templatesService.create(projectId, createTemplateDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all templates for a project' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'inactive'] })
  @ApiQuery({
    name: 'language',
    required: false,
    description: 'Filter by language',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Limit number of results',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Offset for pagination',
  })
  @ApiResponse({ status: 200, description: 'Templates retrieved successfully' })
  @MediumFrequencyRateLimit() // 300 requests per minute for template listing
  @ApiPaginatedResponse(Template as any)
  findAll(
    @Param('projectId') projectId: string,
    @CurrentProject() project: Project,
    @Query('status') status?: 'active' | 'inactive',
    @Query('language') language?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    this.validateProjectAccess(projectId, project);
    return this.templatesService.findAll(projectId, {
      status,
      language,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    });
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get template usage statistics' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  getStatistics(
    @Param('projectId') projectId: string,
    @CurrentProject() project: Project,
  ) {
    this.validateProjectAccess(projectId, project);
    return this.templatesService.getStatistics(projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific template by ID' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiParam({ name: 'id', description: 'Template ID' })
  @ApiResponse({ status: 200, description: 'Template retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Template not found', type: ErrorResponseDto })
  findOne(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @CurrentProject() project: Project,
  ) {
    this.validateProjectAccess(projectId, project);
    return this.templatesService.findOne(projectId, id);
  }

  @Get('name/:name')
  @ApiOperation({ summary: 'Get a specific template by name' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiParam({ name: 'name', description: 'Template name' })
  @ApiResponse({ status: 200, description: 'Template retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Template not found', type: ErrorResponseDto })
  findByName(
    @Param('projectId') projectId: string,
    @Param('name') name: string,
    @CurrentProject() project: Project,
  ) {
    this.validateProjectAccess(projectId, project);
    return this.templatesService.findByName(projectId, name);
  }

  @Post('render')
  @ApiOperation({ summary: 'Render a template with variables' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiResponse({ status: 200, description: 'Template rendered successfully' })
  @ApiResponse({ status: 400, description: 'Template validation failed' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  @ApiResponse({ status: 404, description: 'Template not found', type: ErrorResponseDto })
  @HttpCode(HttpStatus.OK)
  @HighFrequencyRateLimit() // 100 requests per minute for template rendering
  render(
    @Param('projectId') projectId: string,
    @Body() renderTemplateDto: RenderTemplateDto,
    @CurrentProject() project: Project,
  ) {
    this.validateProjectAccess(projectId, project);
    return this.templatesService.render(projectId, renderTemplateDto);
  }

  @Post('validate')
  @ApiOperation({ summary: 'Validate template syntax and variables' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiResponse({ status: 200, description: 'Template validated successfully' })
  @HttpCode(HttpStatus.OK)
  validate(
    @Param('projectId') projectId: string,
    @Body() validateTemplateDto: ValidateTemplateDto,
    @CurrentProject() project: Project,
  ) {
    this.validateProjectAccess(projectId, project);
    return this.templatesService.validate(projectId, validateTemplateDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a template' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiParam({ name: 'id', description: 'Template ID' })
  @ApiResponse({ status: 200, description: 'Template updated successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  @ApiResponse({
    status: 409,
    description: 'Template with same name already exists',
  })
  update(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Body() updateTemplateDto: UpdateTemplateDto,
    @CurrentProject() project: Project,
  ) {
    this.validateProjectAccess(projectId, project);
    return this.templatesService.update(projectId, id, updateTemplateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a template' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiParam({ name: 'id', description: 'Template ID' })
  @ApiResponse({ status: 200, description: 'Template deleted successfully' })
  @ApiResponse({ status: 404, description: 'Template not found', type: ErrorResponseDto })
  @HttpCode(HttpStatus.OK)
  remove(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @CurrentProject() project: Project,
  ) {
    this.validateProjectAccess(projectId, project);
    return this.templatesService.remove(projectId, id);
  }
}
