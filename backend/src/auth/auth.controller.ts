/*
 * File: auth.controller.ts
 * Purpose: Expone los endpoints de autenticación (registro, login).
 * Dependencies: AuthService
 * Domain: Autenticación
 */
import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @HttpCode(HttpStatus.OK)
    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        console.log(`Login attempt for email: ${loginDto.email}`);
        return this.authService.login(loginDto);
    }
}
