import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateTemplateDto } from './create-template.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateTemplateDto extends PartialType(CreateTemplateDto) {
  @ApiPropertyOptional({ description: 'Updated by user ID' })
  @IsOptional()
  @IsString()
  updatedBy?: string;
}