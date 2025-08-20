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
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { TemplatesService } from './templates.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { RenderTemplateDto, ValidateTemplateDto } from './dto/render-template.dto';

@ApiTags('Templates')
@Controller('projects/:projectId/templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new notification template' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiResponse({ status: 201, description: 'Template created successfully' })
  @ApiResponse({ status: 409, description: 'Template with same name already exists' })
  create(
    @Param('projectId') projectId: string,
    @Body() createTemplateDto: CreateTemplateDto,
  ) {
    return this.templatesService.create(projectId, createTemplateDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all templates for a project' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'inactive'] })
  @ApiQuery({ name: 'language', required: false, description: 'Filter by language' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limit number of results' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Offset for pagination' })
  @ApiResponse({ status: 200, description: 'Templates retrieved successfully' })
  findAll(
    @Param('projectId') projectId: string,
    @Query('status') status?: 'active' | 'inactive',
    @Query('language') language?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
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
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  getStatistics(@Param('projectId') projectId: string) {
    return this.templatesService.getStatistics(projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific template by ID' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiParam({ name: 'id', description: 'Template ID' })
  @ApiResponse({ status: 200, description: 'Template retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  findOne(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
  ) {
    return this.templatesService.findOne(projectId, id);
  }

  @Get('name/:name')
  @ApiOperation({ summary: 'Get a specific template by name' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiParam({ name: 'name', description: 'Template name' })
  @ApiResponse({ status: 200, description: 'Template retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  findByName(
    @Param('projectId') projectId: string,
    @Param('name') name: string,
  ) {
    return this.templatesService.findByName(projectId, name);
  }

  @Post('render')
  @ApiOperation({ summary: 'Render a template with variables' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiResponse({ status: 200, description: 'Template rendered successfully' })
  @ApiResponse({ status: 400, description: 'Template validation failed' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  @HttpCode(HttpStatus.OK)
  render(
    @Param('projectId') projectId: string,
    @Body() renderTemplateDto: RenderTemplateDto,
  ) {
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
  ) {
    return this.templatesService.validate(projectId, validateTemplateDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a template' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiParam({ name: 'id', description: 'Template ID' })
  @ApiResponse({ status: 200, description: 'Template updated successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  @ApiResponse({ status: 409, description: 'Template with same name already exists' })
  update(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Body() updateTemplateDto: UpdateTemplateDto,
  ) {
    return this.templatesService.update(projectId, id, updateTemplateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a template' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiParam({ name: 'id', description: 'Template ID' })
  @ApiResponse({ status: 200, description: 'Template deleted successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  @HttpCode(HttpStatus.OK)
  remove(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
  ) {
    return this.templatesService.remove(projectId, id);
  }
}