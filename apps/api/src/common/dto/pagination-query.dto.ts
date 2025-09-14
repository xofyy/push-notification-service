import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationQueryDto {
  @ApiPropertyOptional({ example: 20, description: 'Page size (max 100)' })
  limit?: number;

  @ApiPropertyOptional({ example: 0, description: 'Offset for pagination' })
  offset?: number;

  @ApiPropertyOptional({ example: 'createdAt' })
  sortBy?: string;

  @ApiPropertyOptional({ enum: ['asc', 'desc'], example: 'desc' })
  sortOrder?: 'asc' | 'desc';
}

