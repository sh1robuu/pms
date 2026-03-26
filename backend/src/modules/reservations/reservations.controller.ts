import { Controller, Get, Post, Put, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('reservations')
@UseGuards(JwtAuthGuard)
export class ReservationsController {
    constructor(private reservationsService: ReservationsService) { }

    @Get()
    findAll(@Query('status') status?: string, @Query('guestId') guestId?: string) {
        return this.reservationsService.findAll({ status, guestId });
    }

    @Get('arrivals')
    getArrivals(@Query('date') date?: string) {
        return this.reservationsService.getArrivals(date);
    }

    @Get('departures')
    getDepartures(@Query('date') date?: string) {
        return this.reservationsService.getDepartures(date);
    }

    @Get(':id')
    findById(@Param('id') id: string) {
        return this.reservationsService.findById(id);
    }

    @Post()
    create(@Body() body: any, @CurrentUser() user: any) {
        return this.reservationsService.create(body, user.id);
    }

    @Post(':id/assign-room')
    assignRoom(
        @Param('id') id: string,
        @Body() body: { roomId: string },
        @CurrentUser() user: any,
    ) {
        return this.reservationsService.assignRoom(id, body.roomId, user.id);
    }

    @Post(':id/check-in')
    checkIn(@Param('id') id: string, @CurrentUser() user: any) {
        return this.reservationsService.checkIn(id, user.id);
    }

    @Post(':id/check-out')
    checkOut(@Param('id') id: string, @CurrentUser() user: any) {
        return this.reservationsService.checkOut(id, user.id);
    }

    @Post(':id/cancel')
    cancel(@Param('id') id: string, @CurrentUser() user: any) {
        return this.reservationsService.cancel(id, user.id);
    }
}
