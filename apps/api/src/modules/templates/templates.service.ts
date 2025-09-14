import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Template, TemplateDocument } from './schemas/template.schema';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import {
  RenderTemplateDto,
  ValidateTemplateDto,
} from './dto/render-template.dto';

@Injectable()
export class TemplatesService {
  private readonly logger = new Logger(TemplatesService.name);

  constructor(
    @InjectModel(Template.name) private templateModel: Model<TemplateDocument>,
  ) {}

  async create(
    projectId: string,
    createTemplateDto: CreateTemplateDto,
  ): Promise<Template> {
    this.logger.log(
      `Creating template "${createTemplateDto.name}" for project ${projectId}`,
    );

    const existingTemplate = await this.templateModel.findOne({
      projectId,
      name: createTemplateDto.name,
    });

    if (existingTemplate) {
      throw new ConflictException(
        `Template with name "${createTemplateDto.name}" already exists`,
      );
    }

    const variables = this.extractVariables(
      createTemplateDto.title,
      createTemplateDto.body,
      createTemplateDto.imageUrl,
      createTemplateDto.data,
    );

    const template = new this.templateModel({
      ...createTemplateDto,
      projectId,
      variables: createTemplateDto.variables || variables,
      version: createTemplateDto.version || 1,
      statistics: {
        totalUsed: 0,
        lastUsed: null,
        successRate: 100,
      },
    });

    return template.save();
  }

  async findAll(
    projectId: string,
    options?: {
      status?: 'active' | 'inactive';
      language?: string;
      limit?: number;
      offset?: number;
    },
  ): Promise<{ templates: Template[]; total: number }> {
    const query: any = { projectId };

    if (options?.status) {
      query.status = options.status;
    }

    if (options?.language) {
      query.language = options.language;
    }

    const limit = options?.limit || 50;
    const offset = options?.offset || 0;

    const [templates, total] = await Promise.all([
      this.templateModel
        .find(query)
        .sort({ 'statistics.totalUsed': -1, createdAt: -1 })
        .limit(limit)
        .skip(offset)
        .exec(),
      this.templateModel.countDocuments(query),
    ]);

    return { templates, total };
  }

  async findOne(projectId: string, id: string): Promise<Template> {
    const template = await this.templateModel.findOne({ projectId, _id: id });

    if (!template) {
      throw new NotFoundException(`Template with ID ${id} not found`);
    }

    return template;
  }

  async findByName(projectId: string, name: string): Promise<Template> {
    const template = await this.templateModel.findOne({ projectId, name });

    if (!template) {
      throw new NotFoundException(`Template with name "${name}" not found`);
    }

    return template;
  }

  async update(
    projectId: string,
    id: string,
    updateTemplateDto: UpdateTemplateDto,
  ): Promise<Template> {
    this.logger.log(`Updating template ${id} for project ${projectId}`);

    const template = await this.findOne(projectId, id);

    if (updateTemplateDto.name && updateTemplateDto.name !== template.name) {
      const existingTemplate = await this.templateModel.findOne({
        projectId,
        name: updateTemplateDto.name,
        _id: { $ne: id },
      });

      if (existingTemplate) {
        throw new ConflictException(
          `Template with name "${updateTemplateDto.name}" already exists`,
        );
      }
    }

    const updateData: any = { ...updateTemplateDto };

    if (
      updateTemplateDto.title ||
      updateTemplateDto.body ||
      updateTemplateDto.imageUrl ||
      updateTemplateDto.data
    ) {
      const variables = this.extractVariables(
        updateTemplateDto.title || template.title,
        updateTemplateDto.body || template.body,
        updateTemplateDto.imageUrl || template.imageUrl,
        updateTemplateDto.data || template.data,
      );
      updateData.variables = updateTemplateDto.variables || variables;
    }

    const updatedTemplate = await this.templateModel.findOneAndUpdate(
      { projectId, _id: id },
      updateData,
      { new: true },
    );

    if (!updatedTemplate) {
      throw new NotFoundException(`Template with ID ${id} not found`);
    }

    return updatedTemplate;
  }

  async remove(projectId: string, id: string): Promise<void> {
    this.logger.log(`Deleting template ${id} for project ${projectId}`);

    const result = await this.templateModel.deleteOne({ projectId, _id: id });

    if (result.deletedCount === 0) {
      throw new NotFoundException(`Template with ID ${id} not found`);
    }
  }

  async render(
    projectId: string,
    renderTemplateDto: RenderTemplateDto,
  ): Promise<{
    title: string;
    body: string;
    imageUrl?: string;
    data?: Record<string, unknown>;
    variables: Record<string, unknown>;
  }> {
    this.logger.log(
      `Rendering template "${renderTemplateDto.template}" for project ${projectId}`,
    );

    let template: Template;

    if (renderTemplateDto.template.match(/^[0-9a-fA-F]{24}$/)) {
      template = await this.findOne(projectId, renderTemplateDto.template);
    } else {
      template = await this.findByName(projectId, renderTemplateDto.template);
    }

    if (template.status === 'inactive') {
      throw new BadRequestException('Cannot render inactive template');
    }

    const validationResult = this.validateVariables(
      template,
      renderTemplateDto.variables,
    );
    if (!validationResult.isValid) {
      throw new BadRequestException(
        `Template validation failed: ${validationResult.errors.join(', ')}`,
      );
    }

    const mergedVariables = {
      ...template.defaultValues,
      ...renderTemplateDto.variables,
    };

    const renderedContent = {
      title: this.substituteVariables(template.title, mergedVariables),
      body: this.substituteVariables(template.body, mergedVariables),
      imageUrl: template.imageUrl
        ? this.substituteVariables(template.imageUrl, mergedVariables)
        : undefined,
      data: template.data
        ? this.substituteObjectVariables(template.data, mergedVariables)
        : undefined,
      variables: mergedVariables,
    };

    if (!renderTemplateDto.preview) {
      await this.updateStatistics((template as any)._id.toString(), true);
    }

    return renderedContent;
  }

  async validate(
    projectId: string,
    validateTemplateDto: ValidateTemplateDto,
  ): Promise<{
    isValid: boolean;
    variables: string[];
    errors: string[];
    preview: {
      title: string;
      body: string;
      imageUrl?: string;
      data?: Record<string, unknown>;
    };
  }> {
    const variables = this.extractVariables(
      validateTemplateDto.title,
      validateTemplateDto.body,
      validateTemplateDto.imageUrl,
      validateTemplateDto.data,
    );

    const errors: string[] = [];

    try {
      const preview = {
        title: this.substituteVariables(
          validateTemplateDto.title,
          validateTemplateDto.testVariables,
        ),
        body: this.substituteVariables(
          validateTemplateDto.body,
          validateTemplateDto.testVariables,
        ),
        imageUrl: validateTemplateDto.imageUrl
          ? this.substituteVariables(
              validateTemplateDto.imageUrl,
              validateTemplateDto.testVariables,
            )
          : undefined,
        data: validateTemplateDto.data
          ? this.substituteObjectVariables(
              validateTemplateDto.data,
              validateTemplateDto.testVariables,
            )
          : undefined,
      };

      return {
        isValid: errors.length === 0,
        variables,
        errors,
        preview,
      };
    } catch (error) {
      errors.push(error.message);
      return {
        isValid: false,
        variables,
        errors,
        preview: {
          title: validateTemplateDto.title,
          body: validateTemplateDto.body,
          imageUrl: validateTemplateDto.imageUrl,
          data: validateTemplateDto.data,
        },
      };
    }
  }

  async getStatistics(projectId: string): Promise<{
    totalTemplates: number;
    activeTemplates: number;
    totalUsage: number;
    topTemplates: Array<{ name: string; usage: number; successRate: number }>;
    languageDistribution: Record<string, number>;
  }> {
    const [
      totalTemplates,
      activeTemplates,
      usageStats,
      topTemplates,
      languageStats,
    ] = await Promise.all([
      this.templateModel.countDocuments({ projectId }),
      this.templateModel.countDocuments({ projectId, status: 'active' }),
      this.templateModel.aggregate([
        { $match: { projectId } },
        {
          $group: { _id: null, totalUsage: { $sum: '$statistics.totalUsed' } },
        },
      ]),
      this.templateModel
        .find({ projectId })
        .select('name statistics')
        .sort({ 'statistics.totalUsed': -1 })
        .limit(10),
      this.templateModel.aggregate([
        { $match: { projectId } },
        { $group: { _id: '$language', count: { $sum: 1 } } },
      ]),
    ]);

    const languageDistribution: Record<string, number> = {};
    languageStats.forEach((stat) => {
      languageDistribution[stat._id || 'default'] = stat.count;
    });

    return {
      totalTemplates,
      activeTemplates,
      totalUsage: usageStats[0]?.totalUsage || 0,
      topTemplates: topTemplates.map((t) => ({
        name: t.name,
        usage: t.statistics?.totalUsed || 0,
        successRate: t.statistics?.successRate || 0,
      })),
      languageDistribution,
    };
  }

  private extractVariables(
    title: string,
    body: string,
    imageUrl?: string,
    data?: Record<string, unknown>,
  ): string[] {
    const variableSet = new Set<string>();
    const variableRegex = /\{\{(\w+)\}\}/g;

    const extractFromString = (str: string) => {
      let match;
      while ((match = variableRegex.exec(str)) !== null) {
        variableSet.add(match[1]);
      }
    };

    extractFromString(title);
    extractFromString(body);

    if (imageUrl) {
      extractFromString(imageUrl);
    }

    if (data) {
      const dataStr = JSON.stringify(data);
      extractFromString(dataStr);
    }

    return Array.from(variableSet).sort();
  }

  private substituteVariables(
    template: string,
    variables: Record<string, unknown>,
  ): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, variableName) => {
      const value = variables[variableName];
      return value !== undefined ? String(value) : match;
    });
  }

  private substituteObjectVariables(
    obj: Record<string, unknown>,
    variables: Record<string, unknown>,
  ): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        result[key] = this.substituteVariables(value, variables);
      } else if (typeof value === 'object' && value !== null) {
        result[key] = this.substituteObjectVariables(
          value as Record<string, unknown>,
          variables,
        );
      } else {
        result[key] = value;
      }
    }

    return result;
  }

  private validateVariables(
    template: Template,
    variables: Record<string, unknown>,
  ): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (template.validationRules?.required) {
      for (const requiredVar of template.validationRules.required) {
        if (
          !(requiredVar in variables) ||
          variables[requiredVar] === null ||
          variables[requiredVar] === undefined
        ) {
          errors.push(`Required variable "${requiredVar}" is missing`);
        }
      }
    }

    if (template.validationRules?.formats) {
      for (const [varName, pattern] of Object.entries(
        template.validationRules.formats,
      )) {
        const value = variables[varName];
        if (value !== undefined && typeof value === 'string') {
          const regex = new RegExp(pattern);
          if (!regex.test(value)) {
            errors.push(`Variable "${varName}" does not match required format`);
          }
        }
      }
    }

    if (template.validationRules?.ranges) {
      for (const [varName, range] of Object.entries(
        template.validationRules.ranges,
      )) {
        const value = variables[varName];
        if (value !== undefined && typeof value === 'number') {
          if (range.min !== undefined && value < range.min) {
            errors.push(
              `Variable "${varName}" is below minimum value ${range.min}`,
            );
          }
          if (range.max !== undefined && value > range.max) {
            errors.push(
              `Variable "${varName}" exceeds maximum value ${range.max}`,
            );
          }
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private async updateStatistics(
    templateId: string,
    success: boolean,
  ): Promise<void> {
    const update: any = {
      $inc: { 'statistics.totalUsed': 1 },
      $set: { 'statistics.lastUsed': new Date() },
    };

    if (success) {
      const template = await this.templateModel.findById(templateId);
      if (template) {
        const totalUsed = template.statistics?.totalUsed || 0;
        const currentSuccessRate = template.statistics?.successRate || 100;
        const newSuccessRate =
          (currentSuccessRate * totalUsed + 100) / (totalUsed + 1);
        update.$set['statistics.successRate'] =
          Math.round(newSuccessRate * 100) / 100;
      }
    }

    await this.templateModel.findByIdAndUpdate(templateId, update);
  }
}
