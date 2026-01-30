/*
 * File: update-rotation.dto.ts
 * Purpose: DTO for validating rotation update requests.
 * Dependencies: class-validator
 */

import { IsArray, IsString } from 'class-validator';

export class UpdateRotationDto {
    @IsArray()
    @IsString({ each: true })
    producerRotation: string[];
}
