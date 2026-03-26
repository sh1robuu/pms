import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
    const user = requireAuth(req);
    if (user instanceof NextResponse) return user;

    const today = new Date();
    const startOfDay = new Date(today); startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today); endOfDay.setHours(23, 59, 59, 999);

    const [
        arrivalsToday, departuresToday, inHouseGuests, vipArrivals,
        roomConflicts, openIncidents, recentKeys, unreadAlerts,
        rooms, totalReservations, unreadyArrivals, outOfOrderRooms,
    ] = await Promise.all([
        prisma.reservation.count({ where: { arrivalDate: { gte: startOfDay, lte: endOfDay }, status: { in: ['RESERVED', 'CHECKED_IN'] } } }),
        prisma.reservation.count({ where: { departureDate: { gte: startOfDay, lte: endOfDay }, status: 'CHECKED_IN' } }),
        prisma.reservation.count({ where: { status: 'CHECKED_IN' } }),
        prisma.reservation.count({ where: { arrivalDate: { gte: startOfDay, lte: endOfDay }, isVip: true, status: { in: ['RESERVED', 'CHECKED_IN'] } } }),
        prisma.room.count({ where: { status: 'CONFLICT' } }),
        prisma.incident.count({ where: { status: { in: ['OPEN', 'INVESTIGATING'] } } }),
        prisma.key.count({ where: { issuedAt: { gte: startOfDay } } }),
        prisma.alert.count({ where: { isRead: false } }),
        prisma.room.groupBy({ by: ['status'], _count: true }),
        prisma.reservation.count({ where: { status: { in: ['RESERVED', 'CHECKED_IN'] } } }),
        prisma.reservation.count({
            where: {
                arrivalDate: { gte: startOfDay, lte: endOfDay },
                status: 'RESERVED',
                OR: [{ assignedRoomId: null }, { assignedRoom: { status: { not: 'VACANT_CLEAN' } } }],
            },
        }),
        prisma.room.count({ where: { status: 'OUT_OF_ORDER' } }),
    ]);

    const roomSummary: Record<string, number> = {};
    rooms.forEach((r) => { roomSummary[r.status] = r._count; });

    return NextResponse.json({
        arrivalsToday, departuresToday, inHouseGuests, vipArrivals,
        roomConflicts, openIncidents, recentKeys, unreadAlerts,
        unreadyArrivals, outOfOrderRooms, totalReservations, roomSummary,
    });
}
