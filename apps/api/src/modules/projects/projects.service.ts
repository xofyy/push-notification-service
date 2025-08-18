import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project, ProjectDocument } from './schemas/project.schema';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
  ) {}

  async create(createProjectDto: CreateProjectDto): Promise<Project> {
    // Generate unique API key
    const apiKey = this.generateApiKey();
    
    try {
      const project = new this.projectModel({
        ...createProjectDto,
        apiKey,
      });
      
      return await project.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Project with this name already exists');
      }
      throw error;
    }
  }

  async findAll(): Promise<Project[]> {
    return this.projectModel
      .find()
      .select('-__v')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<Project> {
    const project = await this.projectModel
      .findById(id)
      .select('-__v')
      .exec();
      
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    
    return project;
  }

  async findByApiKey(apiKey: string): Promise<Project> {
    const project = await this.projectModel
      .findOne({ apiKey, isActive: true })
      .select('-__v')
      .exec();
      
    if (!project) {
      throw new NotFoundException('Project not found or inactive');
    }
    
    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto): Promise<Project> {
    const project = await this.projectModel
      .findByIdAndUpdate(id, updateProjectDto, { new: true })
      .select('-__v')
      .exec();
      
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    
    return project;
  }

  async remove(id: string): Promise<void> {
    const result = await this.projectModel.findByIdAndDelete(id).exec();
    
    if (!result) {
      throw new NotFoundException('Project not found');
    }
  }

  async incrementStats(projectId: string, stat: 'sent' | 'delivered' | 'failed', count = 1): Promise<void> {
    await this.projectModel
      .findByIdAndUpdate(projectId, { 
        $inc: { [`stats.${stat}`]: count } 
      })
      .exec();
  }

  async regenerateApiKey(id: string): Promise<Project> {
    const newApiKey = this.generateApiKey();
    
    const project = await this.projectModel
      .findByIdAndUpdate(id, { apiKey: newApiKey }, { new: true })
      .select('-__v')
      .exec();
      
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    
    return project;
  }

  private generateApiKey(): string {
    const prefix = 'pns';
    const randomPart = randomBytes(32).toString('hex');
    return `${prefix}_${randomPart}`;
  }
}