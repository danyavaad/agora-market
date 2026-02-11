/*
 * File: users.module.ts
 * Purpose: Módulo para gestión de usuarios y perfiles.
 * Dependencies: PrismaModule
 * Domain: Users
 */

import { Module } from '@nestjs/common';
import { ProfileController } from './controllers/profile.controller';
import { PrismaModule } from '../prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [ProfileController],
    providers: [],
    exports: []
})
export class UsersModule { }
