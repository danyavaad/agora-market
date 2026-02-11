/*
 * File: chat.service.ts
 * Purpose: Gestión de mensajes de chat entre usuarios.
 * Dependencies: PrismaService
 * Domain: Comunicación
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class ChatService {
    constructor(private prisma: PrismaService) { }


    /**
     * Envía un mensaje de chat entre dos usuarios.
     * @param tenantId ID del tenant.
     * @param senderId ID del remitente.
     * @param data Datos del mensaje (receiverId, content).
     * @returns El mensaje creado.
     */
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

        const conversations = new Map();
        for (const m of messages) {
            const partner = m.senderId === userId ? m.receiver : m.sender;

            if (!conversations.has(partner.id)) {
                conversations.set(partner.id, {
                    partner,
                    lastMessage: m.content,
                    createdAt: m.createdAt,
                    unreadCount: 0
                });
            }

            // Increment unread count if the user is the receiver and message is unread
            if (m.receiverId === userId && !m.isRead) {
                conversations.get(partner.id).unreadCount++;
            }
        }
        return Array.from(conversations.values());
    }

    async getUnreadTotal(tenantId: string, userId: string) {
        return this.prisma.chatMessage.count({
            where: {
                tenantId,
                receiverId: userId,
                isRead: false
            }
        });
    }

    async markAsRead(tenantId: string, userId: string, partnerId: string) {
        return this.prisma.chatMessage.updateMany({
            where: {
                tenantId,
                senderId: partnerId,
                receiverId: userId,
                isRead: false
            },
            data: { isRead: true }
        });
    }
}
