import { Model } from 'mongoose';
import { Project, ProjectDocument, ProjectStatus } from './schemas/project.schema';
export declare class ProjectsService {
    private projectModel;
    constructor(projectModel: Model<ProjectDocument>);
    create(createProjectDto: any, userId: string): Promise<Project>;
    findAllByUserId(userId: string): Promise<Project[]>;
    findMyEvaluations(userId: string): Promise<Project[]>;
    findAllByConvocatoria(convocatoriaId: string): Promise<Project[]>;
    assignEvaluators(projectId: string, evaluatorIds: string[]): Promise<Project>;
    submitEvaluation(projectId: string, evaluatorId: string, result: {
        scores: Record<string, number>;
        criterionComments?: Record<string, string>;
        comments: string;
        status: string;
    }): Promise<Project>;
    resolveProject(projectId: string, status: ProjectStatus, resolutionComments: string, userId: string): Promise<Project>;
    findOne(id: string): Promise<Project>;
    update(id: string, updateData: any, userId: string): Promise<Project>;
    remove(id: string, userId: string): Promise<void>;
}
