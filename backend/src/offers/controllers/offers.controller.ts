/*
 * File: offers.controller.ts
 * Purpose: REST API endpoints for Offers management.
 * Dependencies: OffersService, CreateOfferDto
 */

import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { OffersService } from '../services/offers.service';
import { CreateOfferDto } from '../dto/create-offer.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('tenants/:tenantId/offers')
export class OffersController {
    constructor(private readonly offersService: OffersService) { }

    @UseGuards(JwtAuthGuard)
    @Post()
    async create(
        @Param('tenantId') tenantId: string,
        @Body() createOfferDto: CreateOfferDto,
        @Request() req: any
    ) {
        // Authenticated producer creates offer for themselves
        return this.offersService.createOrUpdate(tenantId, req.user.userId, createOfferDto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('my-offers')
    async findMyOffers(
        @Param('tenantId') tenantId: string,
        @Request() req: any
    ) {
        return this.offersService.findAllByProducer(tenantId, req.user.userId);
    }

    // Public or Protected? Consumers need to see offers?
    // Probably protected or public depending on business rules.
    @Get()
    async findAll(
        @Param('tenantId') tenantId: string,
        @Query('week') week: string
    ) {
        if (week) {
            return this.offersService.findAllByWeek(tenantId, new Date(week));
        }
        return [];
    }

    @UseGuards(JwtAuthGuard)
    @Post('validate')
    async validateHarvest(
        @Param('tenantId') tenantId: string,
        @Body('week') week: string,
        @Request() req: any
    ) {
        return this.offersService.validateHarvest(tenantId, req.user.userId, week);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    async remove(
        @Param('tenantId') tenantId: string,
        @Param('id') id: string,
        @Request() req: any
    ) {
        return this.offersService.remove(tenantId, req.user.userId, id);
    }

    @UseGuards(JwtAuthGuard)
    @Get('count')
    async getCount(
        @Param('tenantId') tenantId: string,
        @Query('week') week: string,
        @Request() req: any
    ) {
        return this.offersService.getActiveOfferCount(tenantId, req.user.userId, week);
    }
}
