/*
 * File: create-offer.dto.ts
 * Purpose: Validate offer creation/update payload.
 */
import { IsNotEmpty, IsNumber, IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateOfferDto {
    @IsNotEmpty()
    @IsString()
    productId: string;

    @IsNotEmpty()
    @IsDateString()
    week: string; // ISO Date string for the Monday of the week

    @IsOptional()
    @IsNumber()
    availableQuantityKg?: number;

    @IsOptional()
    @IsNumber()
    availableUnits?: number;

    @IsOptional()
    @IsNumber()
    pricePerKg?: number;

    @IsOptional()
    @IsNumber()
    pricePerUnit?: number;

    @IsOptional()
    @IsString()
    photoUrl?: string;
}
