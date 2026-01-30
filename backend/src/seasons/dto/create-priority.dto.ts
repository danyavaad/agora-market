/*
 * File: create-priority.dto.ts
 * Purpose: DTO for validating producer priority submission.
 * Dependencies: class-validator
 */

import { IsString, IsNotEmpty, IsInt, Min } from 'class-validator';

export class CreatePriorityDto {
    @IsString()
    @IsNotEmpty()
    productId: string;

    @IsInt()
    @Min(1)
    priorityOrder: number;
}
