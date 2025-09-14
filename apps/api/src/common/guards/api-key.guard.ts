import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ProjectsService } from '../../modules/projects/projects.service';
import { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';
import { IS_PUBLIC_KEY } from '../decorators/auth.decorator';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  private readonly logger = new Logger(ApiKeyGuard.name);

  constructor(
    private readonly projectsService: ProjectsService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Allow explicitly public routes
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    // Extract API key from X-API-Key header
    const apiKey = request.headers['x-api-key'] as string;

    if (!apiKey) {
      this.logger.warn('Missing API key in request headers');
      throw new UnauthorizedException(
        'API key is required. Please provide X-API-Key header.',
      );
    }

    try {
      // Use existing ProjectsService to validate API key
      const project = await this.projectsService.findByApiKey(apiKey);

      // Attach the authenticated project to the request
      request.project = project;

      this.logger.debug(
        `API key validated for project: ${project.name} (${project._id})`,
      );

      return true;
    } catch (error) {
      this.logger.warn(
        `Invalid API key provided: ${apiKey.substring(0, 8)}...`,
      );
      throw new UnauthorizedException('Invalid API key provided.');
    }
  }
}
