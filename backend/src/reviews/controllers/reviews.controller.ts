import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ReviewService } from '../services/reviews.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('tenants/:tenantId/reviews')
export class ReviewController {
    constructor(private readonly reviewService: ReviewService) { }

    @Get('product/:productId')
    async getProductReviews(
        @Param('tenantId') tenantId: string,
        @Param('productId') productId: string
    ) {
        return this.reviewService.getProductReviews(tenantId, productId);
    }

    @Get('producer/:producerId')
    async getProducerReviews(
        @Param('tenantId') tenantId: string,
        @Param('producerId') producerId: string
    ) {
        return this.reviewService.getProducerReviews(tenantId, producerId);
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    async create(
        @Param('tenantId') tenantId: string,
        @Body() data: any,
        @Request() req: any
    ) {
        return this.reviewService.createReview(tenantId, req.user.userId, data);
    }
}
