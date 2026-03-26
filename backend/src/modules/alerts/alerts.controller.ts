import { Controller, Get, Put, Param, Body, Query, UseGuards } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('alerts')
@UseGuards(JwtAuthGuard)
export class AlertsController {
    constructor(private alertsService: AlertsService) { }

    @Get()
    findAll(
        @Query('isRead') isRead?: string,
        @Query('severity') severity?: string,
        @Query('limit') limit?: string,
    ) {
        return this.alertsService.findAll({
            isRead: isRead !== undefined ? isRead === 'true' : undefined,
            severity,
            limit: limit ? parseInt(limit, 10) : undefined,
        });
    }

    @Get('unread-count')
    getUnreadCount() {
        return this.alertsService.getUnreadCount();
    }

    @Put(':id/read')
    markAsRead(@Param('id') id: string) {
        return this.alertsService.markAsRead(id);
    }

    @Put('read-all')
    markAllAsRead() {
        return this.alertsService.markAllAsRead();
    }
}
