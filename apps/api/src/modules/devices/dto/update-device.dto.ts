import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsBoolean } from 'class-validator';
import { RegisterDeviceDto } from './register-device.dto';

export class UpdateDeviceDto extends PartialType(RegisterDeviceDto) {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}