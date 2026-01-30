/*
 * File: src/common/guards/tenant.guard.ts
 * Purpose: Global Guard to enforce 'x-tenant-id' header presence and validity.
 * Dependencies: PrismaService
 * Domain: Cross-Cutting (Multitenancy)
 */
import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class TenantGuard implements CanActivate {
    constructor(private readonly prisma: PrismaService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        // Skip for auth routes (Login/Register) and tenant discovery
        if (request.url.startsWith('/auth') || request.url.startsWith('/tenants')) {
            return true;
        }

        const headers = request.headers;
        const tenantId = headers['x-tenant-id'];

        if (!tenantId) {
            throw new BadRequestException('Header "x-tenant-id" is missing.');
        }

        // Verify tenant exists in DB
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId as string },
        });

        if (!tenant) {
            throw new UnauthorizedException(`Tenant ID "${tenantId}" not found.`);
        }

        // Attach tenant to request object for easy access in controllers
        request['tenant'] = tenant;
        return true;
    }
}
