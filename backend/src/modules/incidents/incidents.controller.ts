import { Controller, Get, Post, Put, Param, Body, Query, UseGuards } from '@nestjs/common';
import { IncidentsService } from './incidents.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('incidents')
@UseGuards(JwtAuthGuard)
export class IncidentsController {
    constructor(private incidentsService: IncidentsService) { }

    @Get()
    findAll(
        @Query('status') status?: string,
        @Query('severity') severity?: string,
        @Query('type') type?: string,
        @Query('limit') limit?: string,
    ) {
        return this.incidentsService.findAll({
            status, severity, type,
            limit: limit ? parseInt(limit, 10) : undefined,
        });
    }

    @Get('stats')
    getStats() {
        return this.incidentsService.getStats();
    }

    @Get(':id')
    findById(@Param('id') id: string) {
        return this.incidentsService.findById(id);
    }

    @Put(':id/status')
    updateStatus(@Param('id') id: string, @Body() body: { status: string; ownerId?: string }) {
        return this.incidentsService.updateStatus(id, body.status, body.ownerId);
    }

    @Put(':id/assign')
    assignOwner(@Param('id') id: string, @Body() body: { ownerId: string }) {
        return this.incidentsService.assignOwner(id, body.ownerId);
    }
}
