import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { RubricsService } from './rubrics.service';
import { CreateRubricDto } from './dto/create-rubric.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('rubrics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RubricsController {
  constructor(private readonly rubricsService: RubricsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.DIVISION_INVESTIGACION)
  create(@Body() createRubricDto: CreateRubricDto) {
    return this.rubricsService.create(createRubricDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.DIVISION_INVESTIGACION, UserRole.DOCENTE) // Evaluadores also will need but for now Docente/Admin
  findAll() {
    return this.rubricsService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.DIVISION_INVESTIGACION, UserRole.DOCENTE)
  findOne(@Param('id') id: string) {
    return this.rubricsService.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.DIVISION_INVESTIGACION)
  update(@Param('id') id: string, @Body() updateRubricDto: Partial<CreateRubricDto>) {
    return this.rubricsService.update(id, updateRubricDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.DIVISION_INVESTIGACION)
  delete(@Param('id') id: string) {
    return this.rubricsService.delete(id);
  }
}
