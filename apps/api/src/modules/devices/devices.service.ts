import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Device, DeviceDocument, Platform } from './schemas/device.schema';
import { RegisterDeviceDto } from './dto/register-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { 
  SegmentQuery, 
  PropertyOperator, 
  SegmentOperator 
} from './dto/segment-query.dto';

@Injectable()
export class DevicesService {
  private readonly logger = new Logger(DevicesService.name);

  constructor(
    @InjectModel(Device.name) private deviceModel: Model<DeviceDocument>,
  ) {}

  /**
   * Detect platform from device token
   */
  private detectPlatformFromToken(token: string): Platform | null {
    // FCM tokens are typically 152+ characters and start with specific patterns
    if (token.length >= 140 && /^[a-zA-Z0-9_-]+:[a-zA-Z0-9_-]+$/.test(token)) {
      return Platform.ANDROID;
    }
    
    // APNs tokens are typically 64 characters (hex) for production
    // or longer for sandbox, and contain only hex characters
    if (/^[a-f0-9]{64}$/i.test(token) || (/^[a-f0-9]{8,}$/i.test(token) && token.length >= 64)) {
      return Platform.IOS;
    }

    // Web Push subscriptions contain endpoint URLs
    try {
      const parsed = JSON.parse(token);
      if (parsed.endpoint && parsed.keys && parsed.keys.p256dh && parsed.keys.auth) {
        return Platform.WEB;
      }
    } catch {
      // Not a JSON subscription object
    }

    // If token contains URL patterns common in web push
    if (token.includes('fcm.googleapis.com') || token.includes('mozilla.com') || 
        token.includes('windows.com') || token.includes('vapid')) {
      return Platform.WEB;
    }

    return null;
  }

  /**
   * Validate token format for the specified platform
   */
  private validateTokenForPlatform(token: string, platform: Platform): boolean {
    switch (platform) {
      case Platform.ANDROID:
        // FCM token validation: should be 152+ chars with specific format
        return token.length >= 140 && /^[a-zA-Z0-9_-]+:[a-zA-Z0-9_-]+$/.test(token);
      
      case Platform.IOS:
        // APNs token validation: 64+ hex characters
        return /^[a-f0-9]{64,}$/i.test(token);
      
      case Platform.WEB:
        // Web Push subscription validation
        try {
          const parsed = JSON.parse(token);
          return !!(parsed.endpoint && parsed.keys && parsed.keys.p256dh && parsed.keys.auth);
        } catch {
          // Check if it's a simple endpoint URL
          return token.startsWith('https://') && (
            token.includes('fcm.googleapis.com') ||
            token.includes('mozilla.com') ||
            token.includes('windows.com')
          );
        }
      
      default:
        return false;
    }
  }

  /**
   * Enhanced device registration with platform detection and token validation
   */
  async registerEnhanced(
    projectId: string,
    registerDeviceDto: RegisterDeviceDto,
    options: {
      autoDetectPlatform?: boolean;
      validateToken?: boolean;
      userAgent?: string;
    } = {},
  ): Promise<Device> {
    const { autoDetectPlatform = true, validateToken = true, userAgent } = options;
    let { platform, token } = registerDeviceDto;

    // Auto-detect platform if not provided or if autoDetectPlatform is enabled
    if (!platform || autoDetectPlatform) {
      const detectedPlatform = this.detectPlatformFromToken(token);
      
      if (detectedPlatform) {
        if (platform && platform !== detectedPlatform) {
          this.logger.warn(
            `Platform mismatch: provided ${platform}, detected ${detectedPlatform} for token ${token.slice(0, 20)}...`,
          );
        }
        platform = detectedPlatform;
      } else if (!platform) {
        // Try to detect from user agent if available
        platform = this.detectPlatformFromUserAgent(userAgent) || Platform.WEB;
        
        if (!platform) {
          throw new BadRequestException(
            'Cannot detect platform from token. Please specify platform explicitly.',
          );
        }
      }
    }

    // Validate token format for the platform
    if (validateToken && !this.validateTokenForPlatform(token, platform)) {
      throw new BadRequestException(
        `Invalid token format for platform ${platform}`,
      );
    }

    // Use the existing register method with enhanced data
    return this.register(projectId, {
      ...registerDeviceDto,
      platform,
    });
  }

  /**
   * Detect platform from User-Agent header
   */
  private detectPlatformFromUserAgent(userAgent?: string): Platform | null {
    if (!userAgent) return null;

    const ua = userAgent.toLowerCase();
    
    // iOS detection
    if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ios')) {
      return Platform.IOS;
    }
    
    // Android detection
    if (ua.includes('android')) {
      return Platform.ANDROID;
    }
    
    // Web/Browser detection (fallback)
    if (ua.includes('mozilla') || ua.includes('webkit') || ua.includes('chrome') || ua.includes('firefox')) {
      return Platform.WEB;
    }

    return null;
  }

  /**
   * Validate token and detect platform
   */
  async validateToken(
    token: string,
    providedPlatform?: Platform,
    options: { userAgent?: string } = {},
  ): Promise<{
    valid: boolean;
    detectedPlatform: Platform | null;
    providedPlatform: Platform | null;
    platformMatch: boolean;
    tokenFormat: {
      length: number;
      type: string;
      pattern: string;
    };
    recommendations: string[];
  }> {
    const detectedPlatform = this.detectPlatformFromToken(token);
    const userAgentPlatform = this.detectPlatformFromUserAgent(options.userAgent);
    
    const result = {
      valid: false,
      detectedPlatform,
      providedPlatform: providedPlatform || null,
      platformMatch: true,
      tokenFormat: {
        length: token.length,
        type: 'unknown',
        pattern: 'unknown',
      },
      recommendations: [] as string[],
    };

    // Determine the platform to validate against
    const platformToValidate = providedPlatform || detectedPlatform;
    
    if (!platformToValidate) {
      result.recommendations.push(
        'Could not detect platform from token. Please provide platform explicitly.',
      );
      if (userAgentPlatform) {
        result.recommendations.push(
          `Based on User-Agent, this might be a ${userAgentPlatform} device.`,
        );
      }
      return result;
    }

    // Check platform consistency
    if (providedPlatform && detectedPlatform && providedPlatform !== detectedPlatform) {
      result.platformMatch = false;
      result.recommendations.push(
        `Platform mismatch: provided ${providedPlatform}, but token appears to be for ${detectedPlatform}.`,
      );
    }

    // Validate token format
    result.valid = this.validateTokenForPlatform(token, platformToValidate);

    // Set token format details
    switch (platformToValidate) {
      case Platform.ANDROID:
        result.tokenFormat.type = 'FCM';
        result.tokenFormat.pattern = 'instance_id:token_id';
        if (!result.valid) {
          result.recommendations.push(
            'FCM tokens should be 140+ characters with format: instanceId:tokenId',
          );
        }
        break;

      case Platform.IOS:
        result.tokenFormat.type = 'APNs';
        result.tokenFormat.pattern = 'hex_string';
        if (!result.valid) {
          result.recommendations.push(
            'APNs tokens should be 64+ hexadecimal characters',
          );
        }
        break;

      case Platform.WEB:
        result.tokenFormat.type = 'Web Push Subscription';
        result.tokenFormat.pattern = 'json_object_or_endpoint_url';
        if (!result.valid) {
          result.recommendations.push(
            'Web Push tokens should be JSON subscription objects or HTTPS endpoint URLs',
          );
        }
        break;
    }

    if (result.valid) {
      result.recommendations.push('Token format is valid for the detected platform.');
    }

    return result;
  }

  /**
   * Update device token with validation
   */
  async updateToken(
    projectId: string,
    deviceId: string,
    newToken: string,
    options: {
      validateToken?: boolean;
      autoDetectPlatform?: boolean;
      userAgent?: string;
    } = {},
  ): Promise<Device> {
    const { validateToken = true, autoDetectPlatform = false, userAgent } = options;

    // Find the existing device
    const existingDevice = await this.deviceModel
      .findOne({
        _id: deviceId,
        projectId: new Types.ObjectId(projectId),
      })
      .exec();

    if (!existingDevice) {
      throw new NotFoundException('Device not found');
    }

    let platform = existingDevice.platform;

    // Auto-detect platform if requested
    if (autoDetectPlatform) {
      const detectedPlatform = this.detectPlatformFromToken(newToken);
      if (detectedPlatform) {
        if (platform !== detectedPlatform) {
          this.logger.warn(
            `Platform change detected for device ${deviceId}: ${platform} -> ${detectedPlatform}`,
          );
        }
        platform = detectedPlatform;
      }
    }

    // Validate new token format
    if (validateToken && !this.validateTokenForPlatform(newToken, platform)) {
      throw new BadRequestException(
        `Invalid token format for platform ${platform}`,
      );
    }

    // Update the device with new token
    const updatedDevice = await this.deviceModel
      .findOneAndUpdate(
        {
          _id: deviceId,
          projectId: new Types.ObjectId(projectId),
        },
        {
          token: newToken,
          platform,
          lastActiveAt: new Date(),
        },
        { new: true },
      )
      .select('-__v')
      .exec();

    if (!updatedDevice) {
      throw new NotFoundException('Device not found during update');
    }

    this.logger.log(`Token updated for device ${deviceId} on platform ${platform}`);
    return updatedDevice;
  }

  /**
   * Refresh device token - finds device by old token and updates it
   */
  async refreshToken(
    projectId: string,
    oldToken: string,
    newToken: string,
    options: {
      validateToken?: boolean;
      autoDetectPlatform?: boolean;
      userAgent?: string;
    } = {},
  ): Promise<Device> {
    const { validateToken = true, autoDetectPlatform = false } = options;

    // Find device by old token
    const existingDevice = await this.deviceModel
      .findOne({
        projectId: new Types.ObjectId(projectId),
        token: oldToken,
      })
      .exec();

    if (!existingDevice) {
      throw new NotFoundException('Device with provided token not found');
    }

    return this.updateToken(projectId, (existingDevice._id as Types.ObjectId).toString(), newToken, {
      validateToken,
      autoDetectPlatform,
      userAgent: options.userAgent,
    });
  }

  /**
   * Validate multiple tokens in batch
   */
  async validateTokensBatch(
    tokens: Array<{ token: string; platform?: Platform }>,
    options: { userAgent?: string } = {},
  ): Promise<
    Array<{
      token: string;
      valid: boolean;
      detectedPlatform: Platform | null;
      error?: string;
    }>
  > {
    const results = await Promise.allSettled(
      tokens.map(async ({ token, platform }) => {
        try {
          const validation = await this.validateToken(token, platform, options);
          return {
            token: token.slice(0, 20) + '...', // Truncate for security
            valid: validation.valid,
            detectedPlatform: validation.detectedPlatform,
          };
        } catch (error) {
          return {
            token: token.slice(0, 20) + '...',
            valid: false,
            detectedPlatform: null,
            error: error.message,
          };
        }
      }),
    );

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          token: tokens[index].token.slice(0, 20) + '...',
          valid: false,
          detectedPlatform: null,
          error: result.reason.message,
        };
      }
    });
  }

  /**
   * Clean up invalid tokens
   */
  async cleanupInvalidTokens(
    projectId: string,
    dryRun: boolean = true,
  ): Promise<{
    checked: number;
    invalid: number;
    removed: number;
    devices: Array<{
      deviceId: string;
      token: string;
      platform: Platform;
      reason: string;
    }>;
  }> {
    const devices = await this.deviceModel
      .find({
        projectId: new Types.ObjectId(projectId),
        isActive: true,
      })
      .exec();

    const invalidDevices: Array<{
      deviceId: string;
      token: string;
      platform: Platform;
      reason: string;
    }> = [];

    // Check each device token
    for (const device of devices) {
      const isValid = this.validateTokenForPlatform(device.token, device.platform);
      if (!isValid) {
        invalidDevices.push({
          deviceId: (device._id as Types.ObjectId).toString(),
          token: device.token.slice(0, 20) + '...', // Truncate for security
          platform: device.platform,
          reason: 'Invalid token format',
        });
      }
    }

    let removedCount = 0;
    if (!dryRun && invalidDevices.length > 0) {
      const deviceIds = invalidDevices.map(d => d.deviceId);
      const deleteResult = await this.deviceModel
        .updateMany(
          {
            _id: { $in: deviceIds },
            projectId: new Types.ObjectId(projectId),
          },
          {
            isActive: false,
            lastActiveAt: new Date(),
          },
        )
        .exec();

      removedCount = deleteResult.modifiedCount;
      this.logger.log(
        `Cleaned up ${removedCount} invalid tokens for project ${projectId}`,
      );
    }

    return {
      checked: devices.length,
      invalid: invalidDevices.length,
      removed: removedCount,
      devices: invalidDevices,
    };
  }

  /**
   * Add tags to a device
   */
  async addTags(
    projectId: string,
    deviceId: string,
    tags: string[],
  ): Promise<Device> {
    const device = await this.deviceModel
      .findOneAndUpdate(
        {
          _id: deviceId,
          projectId: new Types.ObjectId(projectId),
        },
        {
          $addToSet: { tags: { $each: tags } },
          lastActiveAt: new Date(),
        },
        { new: true },
      )
      .select('-__v')
      .exec();

    if (!device) {
      throw new NotFoundException('Device not found');
    }

    this.logger.log(`Added tags [${tags.join(', ')}] to device ${deviceId}`);
    return device;
  }

  /**
   * Remove tags from a device
   */
  async removeTags(
    projectId: string,
    deviceId: string,
    tags: string[],
  ): Promise<Device> {
    const device = await this.deviceModel
      .findOneAndUpdate(
        {
          _id: deviceId,
          projectId: new Types.ObjectId(projectId),
        },
        {
          $pull: { tags: { $in: tags } },
          lastActiveAt: new Date(),
        },
        { new: true },
      )
      .select('-__v')
      .exec();

    if (!device) {
      throw new NotFoundException('Device not found');
    }

    this.logger.log(`Removed tags [${tags.join(', ')}] from device ${deviceId}`);
    return device;
  }

  /**
   * Set custom properties for a device
   */
  async setProperties(
    projectId: string,
    deviceId: string,
    properties: Record<string, any>,
  ): Promise<Device> {
    const device = await this.deviceModel
      .findOneAndUpdate(
        {
          _id: deviceId,
          projectId: new Types.ObjectId(projectId),
        },
        {
          properties,
          lastActiveAt: new Date(),
        },
        { new: true },
      )
      .select('-__v')
      .exec();

    if (!device) {
      throw new NotFoundException('Device not found');
    }

    this.logger.log(`Updated properties for device ${deviceId}`);
    return device;
  }

  /**
   * Update specific properties (merge with existing)
   */
  async updateProperties(
    projectId: string,
    deviceId: string,
    properties: Record<string, any>,
  ): Promise<Device> {
    const updateFields: any = {
      lastActiveAt: new Date(),
    };

    // Build update operations for nested properties
    Object.keys(properties).forEach((key) => {
      updateFields[`properties.${key}`] = properties[key];
    });

    const device = await this.deviceModel
      .findOneAndUpdate(
        {
          _id: deviceId,
          projectId: new Types.ObjectId(projectId),
        },
        updateFields,
        { new: true },
      )
      .select('-__v')
      .exec();

    if (!device) {
      throw new NotFoundException('Device not found');
    }

    this.logger.log(`Merged properties for device ${deviceId}`);
    return device;
  }

  /**
   * Remove specific properties
   */
  async removeProperties(
    projectId: string,
    deviceId: string,
    propertyKeys: string[],
  ): Promise<Device> {
    const unsetFields: Record<string, ''> = {};
    propertyKeys.forEach((key) => {
      unsetFields[`properties.${key}`] = '';
    });

    const device = await this.deviceModel
      .findOneAndUpdate(
        {
          _id: deviceId,
          projectId: new Types.ObjectId(projectId),
        },
        {
          $unset: unsetFields,
          $set: { lastActiveAt: new Date() },
        },
        { new: true },
      )
      .select('-__v')
      .exec();

    if (!device) {
      throw new NotFoundException('Device not found');
    }

    this.logger.log(`Removed properties [${propertyKeys.join(', ')}] from device ${deviceId}`);
    return device;
  }

  /**
   * Get all unique tags for a project
   */
  async getProjectTags(projectId: string): Promise<string[]> {
    const result = await this.deviceModel
      .aggregate([
        { $match: { projectId: new Types.ObjectId(projectId) } },
        { $unwind: '$tags' },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
        { $sort: { count: -1, _id: 1 } },
        { $project: { _id: 0, tag: '$_id', count: 1 } },
      ])
      .exec();

    return result.map((item) => item.tag);
  }

  /**
   * Get tag statistics for a project
   */
  async getTagStats(projectId: string): Promise<Array<{ tag: string; count: number }>> {
    const result = await this.deviceModel
      .aggregate([
        { $match: { projectId: new Types.ObjectId(projectId) } },
        { $unwind: '$tags' },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
        { $sort: { count: -1, _id: 1 } },
        { $project: { _id: 0, tag: '$_id', count: 1 } },
      ])
      .exec();

    return result;
  }

  /**
   * Get property statistics for a project
   */
  async getPropertyStats(projectId: string): Promise<Record<string, any>> {
    const devices = await this.deviceModel
      .find({ projectId: new Types.ObjectId(projectId) })
      .select('properties')
      .exec();

    const propertyStats: Record<string, { count: number; values: Set<any> }> = {};

    devices.forEach((device) => {
      if (device.properties) {
        Object.keys(device.properties).forEach((key) => {
          if (!propertyStats[key]) {
            propertyStats[key] = { count: 0, values: new Set() };
          }
          propertyStats[key].count++;
          propertyStats[key].values.add(device.properties[key]);
        });
      }
    });

    // Convert Sets to arrays and limit values for response size
    const result: Record<string, any> = {};
    Object.keys(propertyStats).forEach((key) => {
      const values = Array.from(propertyStats[key].values);
      result[key] = {
        count: propertyStats[key].count,
        uniqueValues: values.length,
        sampleValues: values.slice(0, 10), // Limit to first 10 for performance
      };
    });

    return result;
  }

  /**
   * Build MongoDB query from segment query
   */
  private buildSegmentQuery(projectId: string, segment: SegmentQuery): any {
    const baseQuery: any = { 
      projectId: new Types.ObjectId(projectId) 
    };

    const conditions: any[] = [];

    // Platform filter
    if (segment.platforms?.platforms.length) {
      conditions.push({ platform: { $in: segment.platforms.platforms } });
    }

    // Tag filter
    if (segment.tags?.tags.length) {
      if (segment.tags.operator === SegmentOperator.AND) {
        conditions.push({ tags: { $all: segment.tags.tags } });
      } else {
        conditions.push({ tags: { $in: segment.tags.tags } });
      }
    }

    // Topic filter
    if (segment.topics?.length) {
      conditions.push({ topics: { $in: segment.topics } });
    }

    // User ID filter
    if (segment.userIds?.length) {
      conditions.push({ userId: { $in: segment.userIds } });
    }

    // Active status filter
    if (segment.isActive !== undefined) {
      conditions.push({ isActive: segment.isActive });
    }

    // Activity filters
    if (segment.activity) {
      if (segment.activity.lastActiveWithinDays !== undefined) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - segment.activity.lastActiveWithinDays);
        conditions.push({ lastActiveAt: { $gte: cutoffDate } });
      }

      if (segment.activity.minNotificationsSent !== undefined) {
        conditions.push({ notificationsSent: { $gte: segment.activity.minNotificationsSent } });
      }

      if (segment.activity.maxNotificationsSent !== undefined) {
        conditions.push({ notificationsSent: { $lte: segment.activity.maxNotificationsSent } });
      }

      if (segment.activity.minNotificationsOpened !== undefined) {
        conditions.push({ notificationsOpened: { $gte: segment.activity.minNotificationsOpened } });
      }
    }

    // Property filters
    if (segment.properties?.length) {
      const propertyConditions: any[] = [];

      segment.properties.forEach((prop) => {
        const fieldPath = `properties.${prop.property}`;
        let condition: any = {};

        switch (prop.operator) {
          case PropertyOperator.EQUALS:
            condition[fieldPath] = prop.value;
            break;

          case PropertyOperator.NOT_EQUALS:
            condition[fieldPath] = { $ne: prop.value };
            break;

          case PropertyOperator.GREATER_THAN:
            condition[fieldPath] = { $gt: prop.value };
            break;

          case PropertyOperator.LESS_THAN:
            condition[fieldPath] = { $lt: prop.value };
            break;

          case PropertyOperator.CONTAINS:
            if (typeof prop.value === 'string') {
              condition[fieldPath] = { $regex: prop.value, $options: 'i' };
            } else if (Array.isArray(prop.value)) {
              condition[fieldPath] = { $in: prop.value };
            }
            break;

          case PropertyOperator.NOT_CONTAINS:
            if (typeof prop.value === 'string') {
              condition[fieldPath] = { $not: { $regex: prop.value, $options: 'i' } };
            } else if (Array.isArray(prop.value)) {
              condition[fieldPath] = { $nin: prop.value };
            }
            break;

          case PropertyOperator.IN:
            condition[fieldPath] = { $in: Array.isArray(prop.value) ? prop.value : [prop.value] };
            break;

          case PropertyOperator.NOT_IN:
            condition[fieldPath] = { $nin: Array.isArray(prop.value) ? prop.value : [prop.value] };
            break;

          case PropertyOperator.EXISTS:
            condition[fieldPath] = { $exists: true, $ne: null };
            break;

          case PropertyOperator.NOT_EXISTS:
            condition[fieldPath] = { $exists: false };
            break;
        }

        propertyConditions.push(condition);
      });

      if (propertyConditions.length > 0) {
        conditions.push(
          segment.operator === SegmentOperator.OR
            ? { $or: propertyConditions }
            : { $and: propertyConditions }
        );
      }
    }

    // Combine all conditions
    if (conditions.length > 0) {
      if (segment.operator === SegmentOperator.OR) {
        baseQuery.$or = conditions;
      } else {
        baseQuery.$and = conditions;
      }
    }

    return baseQuery;
  }

  /**
   * Query devices by segment
   */
  async queryDevicesBySegment(
    projectId: string,
    segment: SegmentQuery,
  ): Promise<{
    devices: Device[];
    total: number;
    query: any;
  }> {
    const mongoQuery = this.buildSegmentQuery(projectId, segment);

    // Get total count
    const total = await this.deviceModel.countDocuments(mongoQuery).exec();

    // Build the main query
    let query = this.deviceModel.find(mongoQuery).select('-__v');

    // Apply sorting
    const sortField = segment.sortBy || 'lastActiveAt';
    const sortOrder = segment.sortOrder === 'asc' ? 1 : -1;
    query = query.sort({ [sortField]: sortOrder });

    // Apply pagination
    if (segment.skip) {
      query = query.skip(segment.skip);
    }
    if (segment.limit) {
      query = query.limit(Math.min(segment.limit, 1000)); // Cap at 1000 for performance
    }

    const devices = await query.exec();

    this.logger.log(
      `Segment query returned ${devices.length}/${total} devices for project ${projectId}`,
    );

    return {
      devices,
      total,
      query: mongoQuery, // Return the query for debugging
    };
  }

  /**
   * Count devices matching a segment
   */
  async countDevicesBySegment(
    projectId: string,
    segment: SegmentQuery,
  ): Promise<number> {
    const mongoQuery = this.buildSegmentQuery(projectId, segment);
    return this.deviceModel.countDocuments(mongoQuery).exec();
  }

  /**
   * Get device tokens matching a segment (for sending notifications)
   */
  async getDeviceTokensBySegment(
    projectId: string,
    segment: SegmentQuery,
  ): Promise<{
    tokens: Array<{ token: string; platform: Platform; userId?: string }>;
    total: number;
  }> {
    const mongoQuery = this.buildSegmentQuery(projectId, segment);

    const total = await this.deviceModel.countDocuments(mongoQuery).exec();

    let query = this.deviceModel
      .find(mongoQuery)
      .select('token platform userId')
      .sort({ lastActiveAt: -1 });

    // Apply limit for sending (usually smaller than query limit)
    if (segment.limit) {
      query = query.limit(Math.min(segment.limit, 10000)); // Cap at 10k for notifications
    }

    const devices = await query.exec();
    const tokens = devices.map((device) => ({
      token: device.token,
      platform: device.platform,
      userId: device.userId,
    }));

    return { tokens, total };
  }

  /**
   * Test a segment query (dry run)
   */
  async testSegmentQuery(
    projectId: string,
    segment: SegmentQuery,
  ): Promise<{
    estimatedCount: number;
    sampleDevices: Device[];
    query: any;
    queryExplanation: string;
  }> {
    const mongoQuery = this.buildSegmentQuery(projectId, segment);
    
    // Get estimated count
    const estimatedCount = await this.deviceModel.countDocuments(mongoQuery).exec();

    // Get sample devices (limit to 5 for preview)
    const sampleDevices = await this.deviceModel
      .find(mongoQuery)
      .select('-__v')
      .limit(5)
      .sort({ lastActiveAt: -1 })
      .exec();

    // Generate human-readable explanation
    const queryExplanation = this.generateQueryExplanation(segment);

    return {
      estimatedCount,
      sampleDevices,
      query: mongoQuery,
      queryExplanation,
    };
  }

  /**
   * Generate human-readable explanation of segment query
   */
  private generateQueryExplanation(segment: SegmentQuery): string {
    const parts: string[] = [];

    if (segment.platforms?.platforms.length) {
      parts.push(`Platform: ${segment.platforms.platforms.join(', ')}`);
    }

    if (segment.tags?.tags.length) {
      const operator = segment.tags.operator === SegmentOperator.AND ? 'all of' : 'any of';
      parts.push(`Tags: ${operator} [${segment.tags.tags.join(', ')}]`);
    }

    if (segment.topics?.length) {
      parts.push(`Topics: any of [${segment.topics.join(', ')}]`);
    }

    if (segment.isActive !== undefined) {
      parts.push(`Status: ${segment.isActive ? 'active' : 'inactive'}`);
    }

    if (segment.activity?.lastActiveWithinDays !== undefined) {
      parts.push(`Active within ${segment.activity.lastActiveWithinDays} days`);
    }

    if (segment.properties?.length) {
      const propDescriptions = segment.properties.map((prop) => {
        const op = prop.operator.replace('_', ' ');
        return `${prop.property} ${op} ${prop.value}`;
      });
      parts.push(`Properties: ${propDescriptions.join(', ')}`);
    }

    const conjunction = segment.operator === SegmentOperator.OR ? ' OR ' : ' AND ';
    return parts.length > 0 ? parts.join(conjunction) : 'All devices';
  }

  async register(
    projectId: string,
    registerDeviceDto: RegisterDeviceDto,
  ): Promise<Device> {
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

  async update(
    projectId: string,
    deviceId: string,
    updateDeviceDto: UpdateDeviceDto,
  ): Promise<Device> {
    const device = await this.deviceModel
      .findOneAndUpdate(
        {
          _id: deviceId,
          projectId: new Types.ObjectId(projectId),
        },
        {
          ...updateDeviceDto,
          lastActiveAt: new Date(),
        },
        { new: true },
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

  async addToTopic(
    projectId: string,
    deviceId: string,
    topic: string,
  ): Promise<Device> {
    const device = await this.deviceModel
      .findOneAndUpdate(
        {
          _id: deviceId,
          projectId: new Types.ObjectId(projectId),
          topics: { $ne: topic },
        },
        {
          $addToSet: { topics: topic },
          lastActiveAt: new Date(),
        },
        { new: true },
      )
      .select('-__v')
      .exec();

    if (!device) {
      throw new NotFoundException(
        'Device not found or already subscribed to topic',
      );
    }

    return device;
  }

  async removeFromTopic(
    projectId: string,
    deviceId: string,
    topic: string,
  ): Promise<Device> {
    const device = await this.deviceModel
      .findOneAndUpdate(
        {
          _id: deviceId,
          projectId: new Types.ObjectId(projectId),
        },
        {
          $pull: { topics: topic },
          lastActiveAt: new Date(),
        },
        { new: true },
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
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] },
          },
          byPlatform: {
            $push: {
              platform: '$platform',
              count: 1,
            },
          },
        },
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
                  {
                    $arrayToObject: [
                      [{ k: '$$this.platform', v: '$$this.count' }],
                    ],
                  },
                ],
              },
            },
          },
        },
      },
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
    stat:
      | 'notificationsSent'
      | 'notificationsDelivered'
      | 'notificationsOpened',
  ): Promise<void> {
    await this.deviceModel
      .findByIdAndUpdate(deviceId, {
        $inc: { [stat]: 1 },
        lastActiveAt: new Date(),
      })
      .exec();
  }
}
