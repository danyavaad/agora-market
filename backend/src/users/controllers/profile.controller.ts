/*
 * File: profile.controller.ts
 * Purpose: Endpoints para gestión del perfil de usuario (ubicación, datos personales).
 * Dependencies: AuthService (o UsersService si se extrae)
 */

import { Controller, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PrismaService } from '../../prisma.service';

@Controller('users/profile')
export class ProfileController {
    constructor(private prisma: PrismaService) { }

    @UseGuards(JwtAuthGuard)
    @Patch()
    async updateProfile(
        @Request() req: any,
        @Body() body: { latitude?: number; longitude?: number; address?: string }
    ) {
        const userId = req.user.userId; // JWT strategy maps payload.sub to userId
        const { latitude, longitude, address } = body;

        return this.prisma.user.update({
            where: { id: userId },
            data: {
                latitude,
                longitude,
                address
            }
        });
    }
}
