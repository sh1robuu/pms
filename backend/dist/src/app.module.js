"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const guests_module_1 = require("./modules/guests/guests.module");
const rooms_module_1 = require("./modules/rooms/rooms.module");
const reservations_module_1 = require("./modules/reservations/reservations.module");
const keys_module_1 = require("./modules/keys/keys.module");
const validation_module_1 = require("./modules/validation/validation.module");
const incidents_module_1 = require("./modules/incidents/incidents.module");
const alerts_module_1 = require("./modules/alerts/alerts.module");
const dashboard_module_1 = require("./modules/dashboard/dashboard.module");
const audit_module_1 = require("./modules/audit/audit.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            audit_module_1.AuditModule,
            validation_module_1.ValidationModule,
            alerts_module_1.AlertsModule,
            incidents_module_1.IncidentsModule,
            users_module_1.UsersModule,
            guests_module_1.GuestsModule,
            rooms_module_1.RoomsModule,
            reservations_module_1.ReservationsModule,
            keys_module_1.KeysModule,
            dashboard_module_1.DashboardModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map