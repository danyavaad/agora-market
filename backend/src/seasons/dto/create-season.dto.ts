/*
 * File: create-season.dto.ts
 * Purpose: DTO for validating season creation requests.
 * Dependencies: class-validator
 */

import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsDateString } from 'class-validator';

export class CreateSeasonDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsDateString()
    @IsNotEmpty()
    startDate: string;

    @IsDateString()
    @IsOptional()
    endDate?: string;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
