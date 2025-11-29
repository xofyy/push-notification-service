import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  ForbiddenException,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiSecurity,
  ApiBearerAuth,
  ApiHeader,
  ApiBody,
} from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { RequireApiKey, CurrentProject, Public } from '../../common/decorators/auth.decorator';
import { Project } from './schemas/project.schema';
import { ErrorResponseDto } from '../../common/dto/error-response.dto';

@ApiTags('Projects')
@Controller('projects')
@RequireApiKey()
@ApiSecurity('ApiKeyAuth')
@ApiHeader({
  name: 'X-API-Key',
  description: 'API Key for authentication',
  required: true,
  example: 'your-project-api-key-here',
})
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) { }

  @Post()
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    operationId: 'Projects_Create',
    summary: 'Create a new project',
    description:
      'Creates a new push notification project with auto-generated API key and configuration.',
  })
  @ApiBody({
    description: 'Project payload',
    schema: {
      example: {
        name: 'My Mobile App',
        description: 'Push notifications for my mobile application',
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Project created successfully',
    schema: {
      example: {
        _id: '64f1a2b3c4d5e6f7a8b9c0d1',
        name: 'My Mobile App',
        description: 'Push notifications for my mobile application',
        apiKey: 'pns_1234567890abcdef',
        settings: {
          fcm: { enabled: true },
          apns: { enabled: false },
          webPush: { enabled: true },
        },
        createdAt: '2023-12-07T10:00:00.000Z',
        updatedAt: '2023-12-07T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
    type: ErrorResponseDto,
  })
  create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(createProjectDto);
  }

  @Get()
  @ApiOperation({
    operationId: 'Projects_GetCurrent',
    summary: 'Get authenticated project',
    description: 'Returns the project associated with the provided API key.',
  })
  @ApiResponse({
    status: 200,
    description: 'Project retrieved successfully',
    schema: {
      example: [
        {
          _id: '64f1a2b3c4d5e6f7a8b9c0d1',
          name: 'My Mobile App',
          description: 'Push notifications for my mobile application',
          settings: {
            fcm: { enabled: true, serviceAccountKey: '[REDACTED]' },
            apns: { enabled: false },
            webPush: { enabled: true },
          },
          stats: {
            totalDevices: 1250,
            totalNotifications: 5420,
            deliveryRate: 0.954,
          },
          createdAt: '2023-12-07T10:00:00.000Z',
          updatedAt: '2023-12-07T15:30:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or missing API key',
    type: ErrorResponseDto,
  })
  findAll(@CurrentProject() project: Project, @Req() req: any) {
    if (req.isAdmin) {
      return this.projectsService.findAll();
    }
    // Return only the authenticated project for security
    return [project];
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get project by ID',
    description:
      'Retrieves a specific project by ID. Users can only access their own project.',
  })
  @ApiParam({
    name: 'id',
    description: 'Project ID',
    example: '64f1a2b3c4d5e6f7a8b9c0d1',
  })
  @ApiResponse({
    status: 200,
    description: 'Project found and returned',
  })
  @ApiResponse({
    status: 403,
    description: 'Access denied - can only access own project',
    schema: {
      example: {
        statusCode: 403,
        message: 'Access denied to this project',
        error: 'Forbidden',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Project not found',
  })
  findOne(@Param('id') id: string, @CurrentProject() project: Project, @Req() req: any) {
    if (req.isAdmin) {
      return this.projectsService.findOne(id);
    }
    // Ensure user can only access their own project
    if (project._id.toString() !== id) {
      throw new ForbiddenException('Access denied to this project');
    }
    return project;
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update project',
    description:
      'Updates project settings and configuration. Users can only update their own project.',
  })
  @ApiParam({
    name: 'id',
    description: 'Project ID to update',
    example: '64f1a2b3c4d5e6f7a8b9c0d1',
  })
  @ApiResponse({
    status: 200,
    description: 'Project updated successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Access denied - can only update own project',
  })
  @ApiResponse({
    status: 404,
    description: 'Project not found',
  })
  update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @CurrentProject() project: Project,
    @Req() req: any,
  ) {
    if (req.isAdmin) {
      return this.projectsService.update(id, updateProjectDto);
    }
    // Ensure user can only update their own project
    if (project._id.toString() !== id) {
      throw new ForbiddenException('Access denied to this project');
    }
    return this.projectsService.update(id, updateProjectDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete project',
    description:
      'Permanently deletes a project and all associated data. This action cannot be undone.',
  })
  @ApiParam({
    name: 'id',
    description: 'Project ID to delete',
    example: '64f1a2b3c4d5e6f7a8b9c0d1',
  })
  @ApiResponse({
    status: 204,
    description: 'Project deleted successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Access denied - can only delete own project',
  })
  @ApiResponse({
    status: 404,
    description: 'Project not found',
  })
  remove(@Param('id') id: string, @CurrentProject() project: Project, @Req() req: any) {
    if (req.isAdmin) {
      return this.projectsService.remove(id);
    }
    // Ensure user can only delete their own project
    if (project._id.toString() !== id) {
      throw new ForbiddenException('Access denied to this project');
    }
    return this.projectsService.remove(id);
  }

  @Post(':id/regenerate-api-key')
  @ApiOperation({
    operationId: 'Projects_RotateApiKey',
    summary: 'Regenerate API key',
    description:
      'Generates a new API key for the project. The old API key will become invalid immediately.',
  })
  @ApiParam({
    name: 'id',
    description: 'Project ID',
    example: '64f1a2b3c4d5e6f7a8b9c0d1',
  })
  @ApiResponse({
    status: 200,
    description: 'API key regenerated successfully',
    schema: {
      example: {
        _id: '64f1a2b3c4d5e6f7a8b9c0d1',
        name: 'My Mobile App',
        apiKey: 'pns_new1234567890abcdef',
        message:
          'API key regenerated successfully. Please update your applications with the new key.',
        regeneratedAt: '2023-12-07T16:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Access denied - can only regenerate API key for own project',
    type: ErrorResponseDto,
  })
  regenerateApiKey(
    @Param('id') id: string,
    @CurrentProject() project: Project,
    @Req() req: any,
  ) {
    if (req.isAdmin) {
      return this.projectsService.regenerateApiKey(id);
    }
    // Ensure user can only regenerate API key for their own project
    if (project._id.toString() !== id) {
      throw new ForbiddenException('Access denied to this project');
    }
    return this.projectsService.regenerateApiKey(id);
  }
}
