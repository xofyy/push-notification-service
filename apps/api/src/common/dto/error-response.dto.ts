import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode!: number;

  @ApiProperty({ example: 'Bad Request' })
  error!: string;

  @ApiProperty({ example: 'Validation failed' })
  message!: string | string[];

  @ApiProperty({ example: '2025-01-01T10:00:00.000Z' })
  timestamp!: string;

  @ApiProperty({ example: '/api/v1/projects/123/notifications/send' })
  path!: string;

  @ApiProperty({ required: false })
  code?: string;
}

