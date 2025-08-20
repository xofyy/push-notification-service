import {
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  IsObject,
  ValidateNested,
  IsNumber,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Platform } from '../schemas/device.schema';

export enum SegmentOperator {
  AND = 'and',
  OR = 'or',
}

export enum PropertyOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'not_contains',
  IN = 'in',
  NOT_IN = 'not_in',
  EXISTS = 'exists',
  NOT_EXISTS = 'not_exists',
}

export class PropertyFilter {
  @IsString()
  property: string;

  @IsEnum(PropertyOperator)
  operator: PropertyOperator;

  @IsOptional()
  value?: any;
}

export class TagFilter {
  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @IsOptional()
  @IsEnum(SegmentOperator)
  operator?: SegmentOperator = SegmentOperator.OR;
}

export class PlatformFilter {
  @IsArray()
  @IsEnum(Platform, { each: true })
  platforms: Platform[];
}

export class ActivityFilter {
  @IsOptional()
  @IsNumber()
  lastActiveWithinDays?: number;

  @IsOptional()
  @IsNumber()
  minNotificationsSent?: number;

  @IsOptional()
  @IsNumber()
  maxNotificationsSent?: number;

  @IsOptional()
  @IsNumber()
  minNotificationsOpened?: number;
}

export class SegmentQuery {
  @IsOptional()
  @IsEnum(SegmentOperator)
  operator?: SegmentOperator = SegmentOperator.AND;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PropertyFilter)
  properties?: PropertyFilter[];

  @IsOptional()
  @ValidateNested()
  @Type(() => TagFilter)
  tags?: TagFilter;

  @IsOptional()
  @ValidateNested()
  @Type(() => PlatformFilter)
  platforms?: PlatformFilter;

  @IsOptional()
  @ValidateNested()
  @Type(() => ActivityFilter)
  activity?: ActivityFilter;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  topics?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  userIds?: string[];

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsNumber()
  skip?: number;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}