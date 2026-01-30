import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { FeedService } from '../services/feed.service';
import { CreatePostDto } from '../dto/create-post.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('tenants/:tenantId/feed')
export class FeedController {
    constructor(private readonly feedService: FeedService) { }

    @Get()
    async findAll(@Param('tenantId') tenantId: string) {
        return this.feedService.findAll(tenantId);
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    async create(
        @Param('tenantId') tenantId: string,
        @Body() createPostDto: CreatePostDto,
        @Request() req: any
    ) {
        return this.feedService.createPost(tenantId, req.user.userId, createPostDto);
    }
}
