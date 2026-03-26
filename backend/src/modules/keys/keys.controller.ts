import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { KeysService } from './keys.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('keys')
@UseGuards(JwtAuthGuard)
export class KeysController {
    constructor(private keysService: KeysService) { }

    @Get()
    findAll(@Query('status') status?: string, @Query('limit') limit?: string) {
        return this.keysService.findAll({ status, limit: limit ? parseInt(limit, 10) : undefined });
    }

    @Get('reservation/:reservationId')
    findByReservation(@Param('reservationId') reservationId: string) {
        return this.keysService.findByReservation(reservationId);
    }

    @Post('issue')
    issue(
        @Body() body: { reservationId: string; roomId: string; guestId: string },
        @CurrentUser() user: any,
    ) {
        return this.keysService.issue(body, user.id);
    }

    @Post(':id/revoke')
    revoke(@Param('id') id: string, @CurrentUser() user: any) {
        return this.keysService.revoke(id, user.id);
    }
}
