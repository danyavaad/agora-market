import { Module } from '@nestjs/common';
import { FeedService } from './services/feed.service';
import { FeedController } from './controllers/feed.controller';
import { PrismaService } from '../prisma.service';

@Module({
    controllers: [FeedController],
    providers: [FeedService, PrismaService],
})
export class FeedModule { }
