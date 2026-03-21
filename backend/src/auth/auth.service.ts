import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && await bcrypt.compare(pass, user.passwordHash)) {
      const { passwordHash, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user._id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        identificationNumber: user.identificationNumber,
        facultad: user.facultad,
        programa: user.programa,
        mincienciasCategory: user.mincienciasCategory,
        researchAreas: user.researchAreas,
        biography: user.biography,
        birthDate: user.birthDate,
        mesVinculacion: user.mesVinculacion,
        anoVinculacion: user.anoVinculacion,
        tipoContrato: user.tipoContrato,
        cvlacUrl: user.cvlacUrl
      }
    };
  }

  async register(createUserDto: any) {
    const user = await this.usersService.create(createUserDto);
    return this.login(user);
  }
}
