import { ProjectsService } from './projects.service';
export declare class ProjectsController {
    private readonly projectsService;
    constructor(projectsService: ProjectsService);
    create(createProjectDto: any, req: any): Promise<import("./schemas/project.schema").Project>;
    findMyProjects(req: any): Promise<import("./schemas/project.schema").Project[]>;
    findMyEvaluations(req: any): Promise<import("./schemas/project.schema").Project[]>;
    findByConvocatoria(convocatoriaId: string): Promise<import("./schemas/project.schema").Project[]>;
    assignEvaluators(projectId: string, evaluatorIds: string[]): Promise<import("./schemas/project.schema").Project>;
    submitEvaluation(projectId: string, body: {
        scores: Record<string, number>;
        comments: string;
        status: string;
    }, req: any): Promise<import("./schemas/project.schema").Project>;
    resolveProject(projectId: string, body: {
        status: string;
        resolutionComments: string;
    }, req: any): Promise<import("./schemas/project.schema").Project>;
    findOne(id: string): Promise<import("./schemas/project.schema").Project>;
    update(id: string, updateProjectDto: any, req: any): Promise<import("./schemas/project.schema").Project>;
}
