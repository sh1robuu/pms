import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditService {
    constructor(private prisma: PrismaService) { }

    async log(params: {
        action: string;
        entityType: string;
        entityId: string;
        userId: string;
        details?: Record<string, any>;
    }) {
        return this.prisma.auditLog.create({
            data: {
                action: params.action,
                entityType: params.entityType,
                entityId: params.entityId,
                userId: params.userId,
                details: params.details ? JSON.stringify(params.details) : null,
            },
        });
    }

    async findAll(query: { entityType?: string; entityId?: string; userId?: string; limit?: number }) {
        return this.prisma.auditLog.findMany({
            where: {
                ...(query.entityType && { entityType: query.entityType }),
                ...(query.entityId && { entityId: query.entityId }),
                ...(query.userId && { userId: query.userId }),
            },
            include: { user: { select: { id: true, name: true, email: true, role: true } } },
            orderBy: { createdAt: 'desc' },
            take: query.limit || 50,
        });
    }
}
