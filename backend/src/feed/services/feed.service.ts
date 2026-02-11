/*
 * File: feed.service.ts
 * Purpose: Gestión de publicaciones en el muro de la huerta.
 * Dependencies: PrismaService
 * Domain: Comunidad
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreatePostDto } from '../dto/create-post.dto';

@Injectable()
export class FeedService {
    constructor(private prisma: PrismaService) { }

    async createPost(tenantId: string, producerId: string, createPostDto: CreatePostDto) {
        return this.prisma.feedPost.create({
            data: {
                tenantId,
                producerId,
                ...createPostDto,
            },
            include: {
                producer: {
                    select: { name: true }
                },
                product: {
                    select: { name: true }
                }
            }
        });
    }

    async findAll(tenantId: string) {
        return this.prisma.feedPost.findMany({
            where: { tenantId },
            include: {
                producer: {
                    select: { name: true }
                },
                product: {
                    select: { name: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
}
