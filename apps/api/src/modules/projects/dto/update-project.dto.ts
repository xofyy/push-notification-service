import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsBoolean, IsString } from 'class-validator';
import { CreateProjectDto } from './create-project.dto';
import { WebhookDto } from './webhook.dto';

export class UpdateProjectDto extends PartialType(CreateProjectDto) {
  @IsOptional()
  @IsBoolean()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  webhooks?: WebhookDto[];

  @IsOptional()
  @IsString()
  webhookSecret?: string;
}
