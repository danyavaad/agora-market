/*
 * File: login.dto.ts
 * Purpose: DTO for user login
 * Dependencies: class-validator
 * Domain: Authentication
 */
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    password: string;
}
