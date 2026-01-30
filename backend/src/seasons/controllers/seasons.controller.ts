/*
 * File: seasons.controller.ts
 * Purpose: REST API endpoints for Seasons management.
 * Dependencies: SeasonsService, CreateSeasonDto
 */

import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Request } from '@nestjs/common';
import { SeasonsService } from '../services/seasons.service';
import { CreateSeasonDto } from '../dto/create-season.dto';
import { UpdateRotationDto } from '../dto/update-rotation.dto';
import { CreatePriorityDto } from '../dto/create-priority.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('tenants/:tenantId/seasons')
export class SeasonsController {
    constructor(private readonly seasonsService: SeasonsService) { }

    @Post()
    create(@Param('tenantId') tenantId: string, @Body() createSeasonDto: CreateSeasonDto) {
        return this.seasonsService.create(tenantId, createSeasonDto);
    }

    @Get()
    findAll(@Param('tenantId') tenantId: string) {
        return this.seasonsService.findAll(tenantId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.seasonsService.findOne(id);
    }

    @Put(':id/rotation')
    updateRotation(@Param('id') id: string, @Body() updateRotationDto: UpdateRotationDto) {
        return this.seasonsService.updateRotation(id, updateRotationDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.seasonsService.delete(id);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/priorities')
    setPriority(
        @Param('tenantId') tenantId: string,
        @Param('id') seasonId: string,
        @Body() createPriorityDto: CreatePriorityDto,
        @Request() req: any,
    ) {
        return this.seasonsService.setProducerPriority(
            seasonId,
            req.user.userId,
            createPriorityDto.productId,
            createPriorityDto.priorityOrder,
            tenantId
        );
    }

    @Get(':id/priorities')
    getSeasonPriorities(@Param('id') seasonId: string) {
        return this.seasonsService.getAllPrioritiesForSeason(seasonId);
    }

    @Get(':id/priorities/:producerId')
    getProducerPriorities(
        @Param('id') seasonId: string,
        @Param('producerId') producerId: string
    ) {
        return this.seasonsService.getProducerPriorities(seasonId, producerId);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/resolve')
    async resolveConflicts(
        @Param('tenantId') tenantId: string,
        @Param('id') seasonId: string,
    ) {
        // TODO: Add Admin Guard (only admins should trigger resolution?)
        const allocations = await this.seasonsService.resolveConflicts(seasonId, tenantId);
        return {
            message: 'Conflict resolution complete',
            allocations
        };
    }

    @Get(':id/allocations')
    getAllocations(@Param('id') seasonId: string) {
        return this.seasonsService.getAllocations(seasonId);
    }
}
