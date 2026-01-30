import { Module } from '@nestjs/common';
import { ReviewService } from './services/reviews.service';
import { ReviewController } from './controllers/reviews.controller';
import { PrismaService } from '../prisma.service';

@Module({
    controllers: [ReviewController],
    providers: [ReviewService, PrismaService],
})
export class ReviewModule { }
