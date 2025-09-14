import {
  UseGuards,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { ApiKeyGuard } from '../guards/api-key.guard';
import { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';
import { SetMetadata } from '@nestjs/common';

/**
 * Decorator to require API key authentication
 * Usage: @RequireApiKey() above controller class or method
 */
export const RequireApiKey = () => UseGuards(ApiKeyGuard);

/**
 * Decorator to inject the current authenticated project into controller methods
 * Usage: method(@CurrentProject() project: Project)
 */
export const CurrentProject = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    return request.project;
  },
);

/**
 * Mark a route or controller as public (no API key required)
 */
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
