import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Request } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create(@Body() createProjectDto: any, @Request() req: any) {
    // req.user contains the decoded JWT injected by Passport
    return this.projectsService.create(createProjectDto, req.user.userId);
  }

  @Get('my-projects')
  findMyProjects(@Request() req: any) {
    return this.projectsService.findAllByUserId(req.user.userId);
  }

  @Get('evaluations/me')
  findMyEvaluations(@Request() req: any) {
    return this.projectsService.findMyEvaluations(req.user.userId);
  }

  @Get('convocatoria/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.DIVISION_INVESTIGACION)
  findByConvocatoria(@Param('id') convocatoriaId: string) {
    return this.projectsService.findAllByConvocatoria(convocatoriaId);
  }

  @Post(':id/evaluators')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.DIVISION_INVESTIGACION)
  assignEvaluators(@Param('id') projectId: string, @Body('evaluatorIds') evaluatorIds: string[]) {
    return this.projectsService.assignEvaluators(projectId, evaluatorIds);
  }

  @Post(':id/evaluate')
  submitEvaluation(@Param('id') projectId: string, @Body() body: { scores: Record<string, number>, comments: string, status: string }, @Request() req: any) {
    return this.projectsService.submitEvaluation(projectId, req.user.userId, body);
  }

  @Patch(':id/resolve')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.DIVISION_INVESTIGACION)
  resolveProject(@Param('id') projectId: string, @Body() body: { status: string, resolutionComments: string }, @Request() req: any) {
    return this.projectsService.resolveProject(projectId, body.status as any, body.resolutionComments, req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProjectDto: any, @Request() req: any) {
    return this.projectsService.update(id, updateProjectDto, req.user.userId);
  }
}
