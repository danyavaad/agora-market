import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class ChatService {
    constructor(private prisma: PrismaService) { }

    async sendMessage(tenantId: string, senderId: string, data: any) {
        return this.prisma.chatMessage.create({
            data: {
                tenantId,
                senderId,
                receiverId: data.receiverId,
                content: data.content,
            }
        });
    }

    async getConversation(tenantId: string, userId: string, otherId: string) {
        return this.prisma.chatMessage.findMany({
            where: {
                tenantId,
                OR: [
                    { senderId: userId, receiverId: otherId },
                    { senderId: otherId, receiverId: userId }
                ]
            },
            orderBy: { createdAt: 'asc' }
        });
    }

    async getMyConversations(tenantId: string, userId: string) {
        // Simple distinct receiver/sender logic
        const messages = await this.prisma.chatMessage.findMany({
            where: {
                tenantId,
                OR: [{ senderId: userId }, { receiverId: userId }]
            },
            include: {
                sender: { select: { id: true, name: true } },
                receiver: { select: { id: true, name: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Group by participant
        const conversations = new Map();
        for (const m of messages) {
            const partner = m.senderId === userId ? m.receiver : m.sender;
            if (!conversations.has(partner.id)) {
                conversations.set(partner.id, {
                    partner,
                    lastMessage: m.content,
                    createdAt: m.createdAt
                });
            }
        }
        return Array.from(conversations.values());
    }
}
