import { Request } from 'express';
import { Project } from '../../modules/projects/schemas/project.schema';

export interface AuthenticatedRequest extends Request {
  project: Project;
}
