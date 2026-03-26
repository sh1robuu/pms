import { PrismaService } from '../../prisma/prisma.service';
export declare class AuditService {
    private prisma;
    constructor(prisma: PrismaService);
    log(params: {
        action: string;
        entityType: string;
        entityId: string;
        userId: string;
        details?: Record<string, any>;
    }): Promise<{
        id: string;
        createdAt: Date;
        action: string;
        entityType: string;
        entityId: string;
        details: string | null;
        ipAddress: string | null;
        userId: string;
    }>;
    findAll(query: {
        entityType?: string;
        entityId?: string;
        userId?: string;
        limit?: number;
    }): Promise<({
        user: {
            id: string;
            email: string;
            name: string;
            role: string;
        };
    } & {
        id: string;
        createdAt: Date;
        action: string;
        entityType: string;
        entityId: string;
        details: string | null;
        ipAddress: string | null;
        userId: string;
    })[]>;
}
