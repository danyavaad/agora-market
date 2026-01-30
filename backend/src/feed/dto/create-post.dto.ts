import { IsString, IsOptional, IsEnum } from 'class-validator';

export enum EventType {
    planting = 'planting',
    frost = 'frost',
    pest = 'pest',
    harvest = 'harvest',
    other = 'other'
}

export class CreatePostDto {
    @IsOptional()
    @IsString()
    message?: string;

    @IsOptional()
    @IsString()
    photoUrl?: string;

    @IsOptional()
    @IsEnum(EventType)
    eventType?: EventType;

    @IsOptional()
    @IsString()
    productId?: string;
}
