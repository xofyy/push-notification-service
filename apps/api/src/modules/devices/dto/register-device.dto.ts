import {
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  IsObject,
  MinLength,
} from 'class-validator';
import { Platform } from '../schemas/device.schema';

export class RegisterDeviceDto {
  @IsString()
  @MinLength(1)
  token!: string;

  @IsOptional()
  @IsEnum(Platform)
  platform?: Platform;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  topics?: string[];

  @IsOptional()
  @IsObject()
  properties?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  metadata?: {
    language?: string;
    country?: string;
    timezone?: string;
    appVersion?: string;
    deviceModel?: string;
    osVersion?: string;
  };
}
