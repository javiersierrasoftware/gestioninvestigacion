import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ConvocatoriasService } from './convocatorias.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('convocatorias')
export class ConvocatoriasController {
  constructor(private readonly convocatoriasService: ConvocatoriasService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.DIVISION_INVESTIGACION) // Only admin and division can create
  create(@Body() createDto: any) {
    return this.convocatoriasService.create(createDto);
  }

  @Get()
  // Public - no guard
  findAll() {
    return this.convocatoriasService.findAll();
  }

  @Get(':id')
  // Public - no guard
  findOne(@Param('id') id: string) {
    return this.convocatoriasService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.DIVISION_INVESTIGACION)
  update(@Param('id') id: string, @Body() updateDto: any) {
    return this.convocatoriasService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.DIVISION_INVESTIGACION)
  remove(@Param('id') id: string) {
    return this.convocatoriasService.remove(id);
  }
}
