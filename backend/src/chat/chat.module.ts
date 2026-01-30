import { Module } from '@nestjs/common';
import { ChatService } from './services/chat.service';
import { ChatController } from './controllers/chat.controller';
import { PrismaService } from '../prisma.service';

@Module({
    controllers: [ChatController],
    providers: [ChatService, PrismaService],
})
export class ChatModule { }
