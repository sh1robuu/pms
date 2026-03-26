import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
    constructor(private dashboardService: DashboardService) { }

    @Get('stats')
    getStats() {
        return this.dashboardService.getStats();
    }

    @Get('activity')
    getRecentActivity(@Query('limit') limit?: string) {
        return this.dashboardService.getRecentActivity(limit ? parseInt(limit, 10) : undefined);
    }
}
