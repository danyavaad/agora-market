/*
 * File: register.dto.ts
 * Purpose: DTO for user registration
 */
import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { Role } from '@prisma/client';

export class RegisterDto {
    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    password: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsOptional()
    @IsEnum(Role)
    role?: Role; // Default to producer or consumer?

    @IsString()
    @IsNotEmpty()
    tenantId: string; // For now, explicit tenantId
}
