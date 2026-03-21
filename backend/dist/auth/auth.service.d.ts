import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private usersService;
    private jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    validateUser(email: string, pass: string): Promise<any>;
    login(user: any): Promise<{
        access_token: string;
        user: {
            id: any;
            name: any;
            email: any;
            role: any;
            identificationNumber: any;
            facultad: any;
            programa: any;
            mincienciasCategory: any;
            researchAreas: any;
            biography: any;
            birthDate: any;
            mesVinculacion: any;
            anoVinculacion: any;
            tipoContrato: any;
            cvlacUrl: any;
        };
    }>;
    register(createUserDto: any): Promise<{
        access_token: string;
        user: {
            id: any;
            name: any;
            email: any;
            role: any;
            identificationNumber: any;
            facultad: any;
            programa: any;
            mincienciasCategory: any;
            researchAreas: any;
            biography: any;
            birthDate: any;
            mesVinculacion: any;
            anoVinculacion: any;
            tipoContrato: any;
            cvlacUrl: any;
        };
    }>;
}
