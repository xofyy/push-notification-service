import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RetryService } from './retry.service';
import { ErrorClassifierService } from './error-classifier.service';

@Module({
  imports: [ConfigModule],
  providers: [RetryService, ErrorClassifierService],
  exports: [RetryService, ErrorClassifierService],
})
export class ErrorHandlingModule {}
