/*
 * File: create-order.dto.ts
 * Purpose: Validate order creation payload (The Basket).
 */
import { IsNotEmpty, IsArray, ValidateNested, IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderItemDto {
    @IsNotEmpty()
    @IsString()
    productId: string;

    @IsOptional()
    @IsNumber()
    quantityKg?: number;

    @IsOptional()
    @IsNumber()
    units?: number;
}

export class CreateOrderDto {
    @IsNotEmpty()
    @IsDateString()
    week: string; // ISO Date for the Monday of the week

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateOrderItemDto)
    items: CreateOrderItemDto[];

    @IsOptional()
    @IsNumber()
    deliveryDistanceKm?: number;
}
