import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ReservationStatus, RoomStatus, IncidentStatus } from '../../shared/enums';

@Injectable()
export class DashboardService {
    constructor(private prisma: PrismaService) { }

    async getStats() {
        const today = new Date();
        const startOfDay = new Date(today);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);

        const [
            arrivalsToday,
            departuresToday,
            inHouseGuests,
            vipArrivals,
            roomConflicts,
            openIncidents,
            recentKeys,
            unreadAlerts,
            rooms,
            totalReservations,
        ] = await Promise.all([
            // Arrivals today
            this.prisma.reservation.count({
                where: {
                    arrivalDate: { gte: startOfDay, lte: endOfDay },
                    status: { in: [ReservationStatus.RESERVED, ReservationStatus.CHECKED_IN] },
                },
            }),
            // Departures today
            this.prisma.reservation.count({
                where: {
                    departureDate: { gte: startOfDay, lte: endOfDay },
                    status: ReservationStatus.CHECKED_IN,
                },
            }),
            // In-house guests
            this.prisma.reservation.count({
                where: { status: ReservationStatus.CHECKED_IN },
            }),
            // VIP arrivals today
            this.prisma.reservation.count({
                where: {
                    arrivalDate: { gte: startOfDay, lte: endOfDay },
                    isVip: true,
                    status: { in: [ReservationStatus.RESERVED, ReservationStatus.CHECKED_IN] },
                },
            }),
            // Room conflicts
            this.prisma.room.count({
                where: { status: RoomStatus.CONFLICT },
            }),
            // Open incidents
            this.prisma.incident.count({
                where: { status: { in: [IncidentStatus.OPEN, IncidentStatus.INVESTIGATING] } },
            }),
            // Recent key events (today)
            this.prisma.key.count({
                where: { issuedAt: { gte: startOfDay } },
            }),
            // Unread alerts
            this.prisma.alert.count({
                where: { isRead: false },
            }),
            // Room status summary
            this.prisma.room.groupBy({
                by: ['status'],
                _count: true,
            }),
            // Total active reservations
            this.prisma.reservation.count({
                where: { status: { in: [ReservationStatus.RESERVED, ReservationStatus.CHECKED_IN] } },
            }),
        ]);

        // Unready arrivals
        const unreadyArrivals = await this.prisma.reservation.count({
            where: {
                arrivalDate: { gte: startOfDay, lte: endOfDay },
                status: ReservationStatus.RESERVED,
                OR: [
                    { assignedRoomId: null },
                    { assignedRoom: { status: { not: RoomStatus.VACANT_CLEAN } } },
                ],
            },
        });

        const outOfOrderRooms = await this.prisma.room.count({
            where: { status: RoomStatus.OUT_OF_ORDER },
        });

        const roomSummary: Record<string, number> = {};
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
}
