import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project, ProjectDocument, ProjectStatus } from './schemas/project.schema';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>
  ) {}

  async create(createProjectDto: any, userId: string): Promise<Project> {
    const createdProject = new this.projectModel({
      ...createProjectDto,
      investigadorPrincipal: userId,
    });
    return createdProject.save();
  }

  async findAllByUserId(userId: string): Promise<Project[]> {
    return this.projectModel.find({ investigadorPrincipal: userId }).populate('convocatoria', 'title year _id rubricId').exec();
  }

  async findMyEvaluations(userId: string): Promise<Project[]> {
    return this.projectModel.find({ "evaluations.evaluator": userId })
      .populate('investigadorPrincipal', 'name email identificationNumber')
      .populate({
        path: 'convocatoria',
        select: 'title year number rubricId dynamicFields',
        populate: {
           path: 'rubricId',
           model: 'Rubric'
        }
      })
      .exec();
  }

  async findAllByConvocatoria(convocatoriaId: string): Promise<Project[]> {
    return this.projectModel.find({ convocatoria: convocatoriaId })
        .populate('investigadorPrincipal', 'name email identificationNumber facultad programa')
        .populate('group', 'name')
        .populate('evaluations.evaluator', 'name email role')
        .exec();
  }

  async assignEvaluators(projectId: string, evaluatorIds: string[]): Promise<Project> {
    const project = await this.projectModel.findById(projectId).exec();
    if (!project) throw new NotFoundException('Proyecto no encontrado');

    const existingEvalIds = project.evaluations?.map(e => e.evaluator.toString()) || [];
    const newEvals = evaluatorIds
       .filter(id => !existingEvalIds.includes(id))
       .map(id => ({ evaluator: id as any, status: 'pendiente', scores: {}, comments: '', totalScore: 0 }));
       
    if (newEvals.length > 0) {
      if(!project.evaluations) project.evaluations = [];
      project.evaluations.push(...newEvals);
      await project.save();
    }
    
    return this.projectModel.findById(projectId)
      .populate('investigadorPrincipal', 'name email identificationNumber')
      .populate('evaluations.evaluator', 'name email role')
      .exec() as any;
  }

  async submitEvaluation(projectId: string, evaluatorId: string, result: { scores: Record<string, number>, comments: string, status: string }): Promise<Project> {
    const project = await this.projectModel.findById(projectId).exec();
    if (!project) throw new NotFoundException('Proyecto no encontrado');

    if (!project.evaluations) project.evaluations = [];
    const evalIndex = project.evaluations.findIndex(e => e.evaluator.toString() === evaluatorId);
    if(evalIndex === -1) throw new NotFoundException('No estás asignado como evaluador a este proyecto');

    const totalScore = Object.values(result.scores).reduce((a, b) => a + Number(b), 0);
    project.evaluations[evalIndex].scores = result.scores;
    project.evaluations[evalIndex].comments = result.comments;
    project.evaluations[evalIndex].totalScore = totalScore;
    project.evaluations[evalIndex].status = result.status || 'evaluado';

    project.markModified('evaluations');
    return project.save();
  }

  async resolveProject(projectId: string, status: ProjectStatus, resolutionComments: string, userId: string): Promise<Project> {
    const project = await this.projectModel.findById(projectId).exec();
    if (!project) throw new NotFoundException('Proyecto no encontrado');

    project.status = status;
    if (resolutionComments) {
      project.resolutionComments = resolutionComments;
    }
    
    return project.save();
  }

  async findOne(id: string): Promise<Project> {
    const project = await this.projectModel.findById(id).populate('convocatoria').exec();
    if (!project) throw new NotFoundException('Proyecto no encontrado');
    return project;
  }

  async update(id: string, updateData: any, userId: string): Promise<Project> {
    const project = await this.projectModel.findOneAndUpdate(
      { _id: id, investigadorPrincipal: userId },
      updateData,
      { new: true }
    ).exec();
    if (!project) throw new NotFoundException('Proyecto no encontrado o no tienes permiso');
    return project;
  }
}
