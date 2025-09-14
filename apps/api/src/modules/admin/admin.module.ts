import { Module } from '@nestjs/common';
import { RateLimitAdminController } from './rate-limit-admin.controller';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [ProjectsModule],
  controllers: [RateLimitAdminController],
})
export class AdminModule {}
