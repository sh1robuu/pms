import { Controller, Get, Post, Put, Param, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
    constructor(private usersService: UsersService) { }

    @Get()
    @Roles('ADMIN', 'MANAGER')
    findAll() {
        return this.usersService.findAll();
    }

    @Get(':id')
    findById(@Param('id') id: string) {
        return this.usersService.findById(id);
    }

    @Post()
    @Roles('ADMIN')
    create(@Body() body: { email: string; name: string; password: string; role: string }) {
        return this.usersService.create(body);
    }

    @Put(':id')
    @Roles('ADMIN')
    update(@Param('id') id: string, @Body() body: any) {
        return this.usersService.update(id, body);
    }
}
