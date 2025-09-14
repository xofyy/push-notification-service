import { IsString, IsObject, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RenderTemplateDto {
  @ApiProperty({ description: 'Template ID or name to render' })
  @IsString()
  @IsNotEmpty()
  template!: string;

  @ApiProperty({
    description: 'Variables to substitute in template',
    type: Object,
    example: {
      userName: 'John Doe',
      action: 'login',
      timestamp: '2025-01-20T10:00:00Z',
    },
  })
  @IsObject()
  variables!: Record<string, any>;

  @ApiPropertyOptional({ description: 'Preview mode - do not save statistics' })
  @IsOptional()
  preview?: boolean;
}

export class ValidateTemplateDto {
  @ApiProperty({ description: 'Template title to validate' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ description: 'Template body to validate' })
  @IsString()
  @IsNotEmpty()
  body!: string;

  @ApiPropertyOptional({ description: 'Template image URL to validate' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'Template data to validate',
    type: Object,
  })
  @IsOptional()
  @IsObject()
  data?: Record<string, any>;

  @ApiProperty({
    description: 'Test variables for validation',
    type: Object,
    example: {
      userName: 'John Doe',
      action: 'test_action',
    },
  })
  @IsObject()
  testVariables!: Record<string, any>;
}
