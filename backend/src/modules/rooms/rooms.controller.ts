import { Controller, Get, Put, Param, Body, Query, UseGuards } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('rooms')
@UseGuards(JwtAuthGuard)
export class RoomsController {
    constructor(private roomsService: RoomsService) { }

    @Get()
    findAll(
        @Query('floor') floor?: string,
        @Query('status') status?: string,
        @Query('type') type?: string,
    ) {
        return this.roomsService.findAll({
            floor: floor ? parseInt(floor, 10) : undefined,
            status,
            type,
        });
    }

    @Get('board')
    getBoard() {
        return this.roomsService.getBoardData();
    }

    @Get('available')
    getAvailable(
        @Query('arrivalDate') arrivalDate: string,
        @Query('departureDate') departureDate: string,
        @Query('roomType') roomType?: string,
    ) {
        return this.roomsService.getAvailableRooms(
            new Date(arrivalDate),
            new Date(departureDate),
            roomType,
        );
    }

    @Get(':id')
    findById(@Param('id') id: string) {
        return this.roomsService.findById(id);
    }

    @Put(':id/status')
    updateStatus(
        @Param('id') id: string,
        @Body() body: { status: string; reason?: string },
        @CurrentUser() user: any,
    ) {
        return this.roomsService.updateStatus(id, body.status, user.id, body.reason);
    }

    @Put(':id/housekeeping')
    updateHousekeeping(
        @Param('id') id: string,
        @Body() body: { status: string },
        @CurrentUser() user: any,
    ) {
        return this.roomsService.updateHousekeeping(id, body.status, user.id);
    }
}
