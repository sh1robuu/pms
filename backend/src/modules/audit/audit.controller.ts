import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('audit')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditController {
    constructor(private auditService: AuditService) { }

    @Get()
    @Roles('ADMIN', 'MANAGER')
    findAll(
        @Query('entityType') entityType?: string,
        @Query('entityId') entityId?: string,
        @Query('userId') userId?: string,
        @Query('limit') limit?: string,
    ) {
        return this.auditService.findAll({
            entityType,
            entityId,
            userId,
            limit: limit ? parseInt(limit, 10) : undefined,
        });
    }
}
