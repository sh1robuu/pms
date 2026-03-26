import { AuditService } from './audit.service';
export declare class AuditController {
    private auditService;
    constructor(auditService: AuditService);
    findAll(entityType?: string, entityId?: string, userId?: string, limit?: string): Promise<({
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
