import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { GuestsModule } from './modules/guests/guests.module';
import { RoomsModule } from './modules/rooms/rooms.module';
import { ReservationsModule } from './modules/reservations/reservations.module';
import { KeysModule } from './modules/keys/keys.module';
import { ValidationModule } from './modules/validation/validation.module';
import { IncidentsModule } from './modules/incidents/incidents.module';
import { AlertsModule } from './modules/alerts/alerts.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { AuditModule } from './modules/audit/audit.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    AuditModule,
    ValidationModule,
    AlertsModule,
    IncidentsModule,
    UsersModule,
    GuestsModule,
    RoomsModule,
    ReservationsModule,
    KeysModule,
    DashboardModule,
  ],
})
export class AppModule { }
