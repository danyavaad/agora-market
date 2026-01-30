import { Controller, Get, Post, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { ChatService } from '../services/chat.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('tenants/:tenantId/chat')
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    @UseGuards(JwtAuthGuard)
    @Get('conversations')
    async getMyConversations(
        @Param('tenantId') tenantId: string,
        @Request() req: any
    ) {
        return this.chatService.getMyConversations(tenantId, req.user.userId);
    }

    @UseGuards(JwtAuthGuard)
    @Get('conversation/:partnerId')
    async getConversation(
        @Param('tenantId') tenantId: string,
        @Param('partnerId') partnerId: string,
        @Request() req: any
    ) {
        return this.chatService.getConversation(tenantId, req.user.userId, partnerId);
    }

    @UseGuards(JwtAuthGuard)
    @Post('send')
    async send(
        @Param('tenantId') tenantId: string,
        @Body() data: any,
        @Request() req: any
    ) {
        return this.chatService.sendMessage(tenantId, req.user.userId, data);
    }
}
