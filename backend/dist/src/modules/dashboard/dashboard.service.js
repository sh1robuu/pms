"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const enums_1 = require("../../shared/enums");
let DashboardService = class DashboardService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getStats() {
        const today = new Date();
        const startOfDay = new Date(today);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);
        const [arrivalsToday, departuresToday, inHouseGuests, vipArrivals, roomConflicts, openIncidents, recentKeys, unreadAlerts, rooms, totalReservations,] = await Promise.all([
            this.prisma.reservation.count({
                where: {
                    arrivalDate: { gte: startOfDay, lte: endOfDay },
                    status: { in: [enums_1.ReservationStatus.RESERVED, enums_1.ReservationStatus.CHECKED_IN] },
                },
            }),
            this.prisma.reservation.count({
                where: {
                    departureDate: { gte: startOfDay, lte: endOfDay },
                    status: enums_1.ReservationStatus.CHECKED_IN,
                },
            }),
            this.prisma.reservation.count({
                where: { status: enums_1.ReservationStatus.CHECKED_IN },
            }),
            this.prisma.reservation.count({
                where: {
                    arrivalDate: { gte: startOfDay, lte: endOfDay },
                    isVip: true,
                    status: { in: [enums_1.ReservationStatus.RESERVED, enums_1.ReservationStatus.CHECKED_IN] },
                },
            }),
            this.prisma.room.count({
                where: { status: enums_1.RoomStatus.CONFLICT },
            }),
            this.prisma.incident.count({
                where: { status: { in: [enums_1.IncidentStatus.OPEN, enums_1.IncidentStatus.INVESTIGATING] } },
            }),
            this.prisma.key.count({
                where: { issuedAt: { gte: startOfDay } },
            }),
            this.prisma.alert.count({
                where: { isRead: false },
            }),
            this.prisma.room.groupBy({
                by: ['status'],
                _count: true,
            }),
            this.prisma.reservation.count({
                where: { status: { in: [enums_1.ReservationStatus.RESERVED, enums_1.ReservationStatus.CHECKED_IN] } },
            }),
        ]);
        const unreadyArrivals = await this.prisma.reservation.count({
            where: {
                arrivalDate: { gte: startOfDay, lte: endOfDay },
                status: enums_1.ReservationStatus.RESERVED,
                OR: [
                    { assignedRoomId: null },
                    { assignedRoom: { status: { not: enums_1.RoomStatus.VACANT_CLEAN } } },
                ],
            },
        });
        const outOfOrderRooms = await this.prisma.room.count({
            where: { status: enums_1.RoomStatus.OUT_OF_ORDER },
        });
        const roomSummary = {};
        rooms.forEach((r) => { roomSummary[r.status] = r._count; });
        return {
            arrivalsToday,
            departuresToday,
            inHouseGuests,
            vipArrivals,
            roomConflicts,
            openIncidents,
            recentKeys,
            unreadAlerts,
            unreadyArrivals,
            outOfOrderRooms,
            totalReservations,
            roomSummary,
        };
    }
    async getRecentActivity(limit = 20) {
        const [recentAudit, recentAlerts] = await Promise.all([
            this.prisma.auditLog.findMany({
                include: { user: { select: { name: true } } },
                orderBy: { createdAt: 'desc' },
                take: limit,
            }),
            this.prisma.alert.findMany({
                include: {
                    room: { select: { roomNumber: true } },
                    reservation: { select: { confirmationNumber: true } },
                },
                orderBy: { createdAt: 'desc' },
                take: limit,
            }),
        ]);
        return { recentAudit, recentAlerts };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map