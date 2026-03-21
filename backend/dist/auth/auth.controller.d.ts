import { AuthService } from './auth.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(loginDto: any): Promise<{
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
