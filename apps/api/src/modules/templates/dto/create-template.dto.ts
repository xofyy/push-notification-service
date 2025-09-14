import {
  IsString,
  IsOptional,
  IsObject,
  IsArray,
  IsIn,
  IsNotEmpty,
  MaxLength,
  IsNumber,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTemplateDto {
  @ApiProperty({ description: 'Template name', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional({ description: 'Template description', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ description: 'Notification title template', maxLength: 200 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @ApiProperty({ description: 'Notification body template', maxLength: 1000 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  body!: string;

  @ApiPropertyOptional({ description: 'Image URL template' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'Custom data template', type: Object })
  @IsOptional()
  @IsObject()
  data?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Template variables', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  variables?: string[];

  @ApiPropertyOptional({
    description: 'Template status',
    enum: ['active', 'inactive'],
  })
  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: 'active' | 'inactive';

  @ApiPropertyOptional({ description: 'Default variable values', type: Object })
  @IsOptional()
  @IsObject()
  defaultValues?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Template language', example: 'en' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  language?: string;

  @ApiPropertyOptional({
    description: 'Validation rules for variables',
    type: Object,
    example: {
      required: ['userName', 'action'],
      formats: { email: '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$' },
      ranges: { age: { min: 0, max: 120 } },
    },
  })
  @IsOptional()
  @IsObject()
  validationRules?: {
    required?: string[];
    formats?: Record<string, string>;
    ranges?: Record<string, { min?: number; max?: number }>;
  };

  @ApiPropertyOptional({ description: 'Template version', default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  version?: number;

  @ApiPropertyOptional({ description: 'Created by user ID' })
  @IsOptional()
  @IsString()
  createdBy?: string;
}
