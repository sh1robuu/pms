import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
    const user = requireAuth(req);
    if (user instanceof NextResponse) return user;

    const url = req.nextUrl;
    const view = url.searchParams.get('view');
    const status = url.searchParams.get('status');
    const roomType = url.searchParams.get('roomType');

    // Board view - rooms grouped by floor
    if (view === 'board') {
        const rooms = await prisma.room.findMany({
            include: {
                currentOccupant: { select: { id: true, firstName: true, lastName: true, vipStatus: true } },
                assignedReservations: {
                    where: { status: { in: ['RESERVED', 'CHECKED_IN'] } },
                    include: { guest: { select: { id: true, firstName: true, lastName: true, vipStatus: true } } },
                    take: 1,
                },
            },
            orderBy: [{ floor: 'asc' }, { roomNumber: 'asc' }],
        });

        const floors: Record<number, typeof rooms> = {};
        let vacantClean = 0, vacantDirty = 0, occupied = 0, outOfOrder = 0, conflict = 0;

        rooms.forEach((room) => {
            if (!floors[room.floor]) floors[room.floor] = [];
            floors[room.floor].push(room);
            if (room.status === 'VACANT_CLEAN') vacantClean++;
            else if (room.status === 'VACANT_DIRTY') vacantDirty++;
            else if (room.status === 'OCCUPIED') occupied++;
            else if (room.status === 'OUT_OF_ORDER') outOfOrder++;
            else if (room.status === 'CONFLICT') conflict++;
        });

        return NextResponse.json({
            floors, totalRooms: rooms.length,
            summary: { total: rooms.length, vacantClean, vacantDirty, occupied, outOfOrder, conflict },
        });
    }

    // Available rooms
    if (view === 'available') {
        const arrivalDate = url.searchParams.get('arrivalDate');
        const departureDate = url.searchParams.get('departureDate');
        if (!arrivalDate || !departureDate) return NextResponse.json({ message: 'Dates required' }, { status: 400 });

        const rooms = await prisma.room.findMany({
            where: {
                status: 'VACANT_CLEAN',
                ...(roomType && { roomType }),
                assignedReservations: {
                    none: {
                        status: { in: ['RESERVED', 'CHECKED_IN'] },
                        arrivalDate: { lte: new Date(departureDate) },
                        departureDate: { gte: new Date(arrivalDate) },
                    },
                },
            },
            orderBy: { roomNumber: 'asc' },
        });
        return NextResponse.json(rooms);
    }

    // Flat list
    const rooms = await prisma.room.findMany({
        where: {
            ...(status && { status }),
            ...(roomType && { roomType }),
        },
        include: {
            currentOccupant: { select: { id: true, firstName: true, lastName: true, vipStatus: true } },
        },
        orderBy: { roomNumber: 'asc' },
    });
    return NextResponse.json(rooms);
}
