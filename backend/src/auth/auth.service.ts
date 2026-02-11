/*
 * File: auth.service.ts
 * Purpose: Maneja la lógica de autenticación (validación de usuario, login, registro, generación de tokens).
 * Dependencies: PrismaService, JwtService, bcrypt
 * Domain: Autenticación
 */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) { }


    /**
     * Valida las credenciales de un usuario.
     * @param email Correo electrónico del usuario.
     * @param pass Contraseña sin encriptar.
     * @returns El usuario sin la contraseña si es válido, null en caso contrario.
     */
    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (user && user.password && (await bcrypt.compare(pass, user.password))) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }


    /**
     * Registra un nuevo usuario en el sistema.
     * @param registerDto DTO con la información de registro.
     * @returns El usuario creado sin la contraseña.
     */
    async register(registerDto: RegisterDto) {
        const hashedPassword = await bcrypt.hash(registerDto.password, 10);

        // Ensure role is valid or default
        const role = registerDto.role || 'producer';

        const user = await this.prisma.user.create({
            data: {
                email: registerDto.email,
                name: registerDto.name,
                password: hashedPassword,
                tenantId: registerDto.tenantId,
                role: role,
            },
        });
        const { password, ...result } = user;
        return result;
    }


    /**
     * Realiza el proceso de login y genera un token JWT.
     * @param loginDto DTO con las credenciales de acceso.
     * @returns Objeto con el access_token y la información del usuario.
     */
    async login(loginDto: LoginDto) {
        const user = await this.validateUser(loginDto.email, loginDto.password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = { email: user.email, sub: user.id, role: user.role, tenantId: user.tenantId };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                tenantId: user.tenantId
            }
        };
    }
}
