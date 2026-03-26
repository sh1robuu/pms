import { Controller, Get, Post, Put, Param, Body, Query, UseGuards } from '@nestjs/common';
import { GuestsService } from './guests.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('guests')
@UseGuards(JwtAuthGuard)
export class GuestsController {
    constructor(private guestsService: GuestsService) { }

    @Get()
    findAll(@Query('search') search?: string, @Query('vipOnly') vipOnly?: string) {
        return this.guestsService.findAll({ search, vipOnly: vipOnly === 'true' });
    }

    @Get(':id')
    findById(@Param('id') id: string) {
        return this.guestsService.findById(id);
    }

    @Post()
    create(@Body() body: { firstName: string; lastName: string; email?: string; phone?: string; idNumber?: string; vipStatus?: boolean; notes?: string }) {
        return this.guestsService.create(body);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() body: any) {
        return this.guestsService.update(id, body);
    }
}
