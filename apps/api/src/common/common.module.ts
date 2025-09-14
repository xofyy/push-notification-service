import { Global, Module } from '@nestjs/common';
import { RateLimitService } from './services/rate-limit.service';
import { RateLimitGuard } from './guards/rate-limit.guard';
import { ProjectsModule } from '../modules/projects/projects.module';

@Global()
@Module({
  imports: [ProjectsModule],
  providers: [RateLimitService, RateLimitGuard],
  exports: [RateLimitService, RateLimitGuard, ProjectsModule],
})
export class CommonModule {}
