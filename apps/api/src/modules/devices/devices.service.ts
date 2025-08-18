import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Device, DeviceDocument, Platform } from './schemas/device.schema';
import { RegisterDeviceDto } from './dto/register-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';

@Injectable()
export class DevicesService {
  constructor(
    @InjectModel(Device.name) private deviceModel: Model<DeviceDocument>,
  ) {}

  async register(projectId: string, registerDeviceDto: RegisterDeviceDto): Promise<Device> {
    try {
      // Check if device already exists and update it
      const existingDevice = await this.deviceModel.findOne({
        projectId: new Types.ObjectId(projectId),
        token: registerDeviceDto.token,
      });

      if (existingDevice) {
        // Update existing device
        Object.assign(existingDevice, {
          ...registerDeviceDto,
          isActive: true,
          lastActiveAt: new Date(),
        });
        return await existingDevice.save();
      }

      // Create new device
      const device = new this.deviceModel({
        projectId: new Types.ObjectId(projectId),
        ...registerDeviceDto,
        lastActiveAt: new Date(),
      });
      
      return await device.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Device already registered');
      }
      throw error;
    }
  }

  async findByProject(
    projectId: string,
    filters: {
      platform?: Platform;
      userId?: string;
      tags?: string[];
      topics?: string[];
      isActive?: boolean;
    } = {},
  ): Promise<Device[]> {
    const query: any = { projectId: new Types.ObjectId(projectId) };

    if (filters.platform) query.platform = filters.platform;
    if (filters.userId) query.userId = filters.userId;
    if (filters.isActive !== undefined) query.isActive = filters.isActive;
    if (filters.tags?.length) query.tags = { $in: filters.tags };
    if (filters.topics?.length) query.topics = { $in: filters.topics };

    return this.deviceModel
      .find(query)
      .select('-__v')
      .sort({ lastActiveAt: -1 })
      .exec();
  }

  async findOne(projectId: string, deviceId: string): Promise<Device> {
    const device = await this.deviceModel
      .findOne({
        _id: deviceId,
        projectId: new Types.ObjectId(projectId),
      })
      .select('-__v')
      .exec();
      
    if (!device) {
      throw new NotFoundException('Device not found');
    }
    
    return device;
  }

  async update(projectId: string, deviceId: string, updateDeviceDto: UpdateDeviceDto): Promise<Device> {
    const device = await this.deviceModel
      .findOneAndUpdate(
        { 
          _id: deviceId, 
          projectId: new Types.ObjectId(projectId) 
        },
        { 
          ...updateDeviceDto,
          lastActiveAt: new Date(),
        },
        { new: true }
      )
      .select('-__v')
      .exec();
      
    if (!device) {
      throw new NotFoundException('Device not found');
    }
    
    return device;
  }

  async remove(projectId: string, deviceId: string): Promise<void> {
    const result = await this.deviceModel
      .findOneAndDelete({
        _id: deviceId,
        projectId: new Types.ObjectId(projectId),
      })
      .exec();
    
    if (!result) {
      throw new NotFoundException('Device not found');
    }
  }

  async addToTopic(projectId: string, deviceId: string, topic: string): Promise<Device> {
    const device = await this.deviceModel
      .findOneAndUpdate(
        { 
          _id: deviceId, 
          projectId: new Types.ObjectId(projectId),
          topics: { $ne: topic }
        },
        { 
          $addToSet: { topics: topic },
          lastActiveAt: new Date(),
        },
        { new: true }
      )
      .select('-__v')
      .exec();
      
    if (!device) {
      throw new NotFoundException('Device not found or already subscribed to topic');
    }
    
    return device;
  }

  async removeFromTopic(projectId: string, deviceId: string, topic: string): Promise<Device> {
    const device = await this.deviceModel
      .findOneAndUpdate(
        { 
          _id: deviceId, 
          projectId: new Types.ObjectId(projectId) 
        },
        { 
          $pull: { topics: topic },
          lastActiveAt: new Date(),
        },
        { new: true }
      )
      .select('-__v')
      .exec();
      
    if (!device) {
      throw new NotFoundException('Device not found');
    }
    
    return device;
  }

  async getStats(projectId: string): Promise<any> {
    const stats = await this.deviceModel.aggregate([
      { $match: { projectId: new Types.ObjectId(projectId) } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { 
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } 
          },
          byPlatform: {
            $push: {
              platform: '$platform',
              count: 1
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          total: 1,
          active: 1,
          platforms: {
            $reduce: {
              input: '$byPlatform',
              initialValue: {},
              in: {
                $mergeObjects: [
                  '$$value',
                  { $arrayToObject: [[{ k: '$$this.platform', v: '$$this.count' }]] }
                ]
              }
            }
          }
        }
      }
    ]);

    return stats[0] || { total: 0, active: 0, platforms: {} };
  }

  async updateActivity(deviceId: string): Promise<void> {
    await this.deviceModel
      .findByIdAndUpdate(deviceId, { lastActiveAt: new Date() })
      .exec();
  }

  async incrementNotificationStats(
    deviceId: string,
    stat: 'notificationsSent' | 'notificationsDelivered' | 'notificationsOpened',
  ): Promise<void> {
    await this.deviceModel
      .findByIdAndUpdate(deviceId, { 
        $inc: { [stat]: 1 },
        lastActiveAt: new Date(),
      })
      .exec();
  }
}