/*
 * File: auth.module.ts
 * Purpose: Encapsulates authentication logic
 * Dependencies: NestJS, Passport, JWT
 * Domain: Authentication
 */
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy, jwtConstants } from './strategies/jwt.strategy';

@Module({
    imports: [

        PassportModule,
        JwtModule.register({
            secret: jwtConstants.secret,
            signOptions: { expiresIn: '60m' },
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy],
    exports: [AuthService],
})
export class AuthModule { }
