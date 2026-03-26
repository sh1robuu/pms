import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth, getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
    const user = requireAuth(req);
    if (user instanceof NextResponse) return user;

    const url = req.nextUrl;
    const status = url.searchParams.get('status');
    const guestId = url.searchParams.get('guestId');

    // Check for arrivals/departures via query param
    const view = url.searchParams.get('view');
    const date = url.searchParams.get('date');

    if (view === 'arrivals') {
        const targetDate = date ? new Date(date) : new Date();
        const startOfDay = new Date(targetDate); startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(targetDate); endOfDay.setHours(23, 59, 59, 999);
        const arrivals = await prisma.reservation.findMany({
            where: { arrivalDate: { gte: startOfDay, lte: endOfDay }, status: { in: ['RESERVED', 'CHECKED_IN'] } },
            include: {
                guest: { select: { id: true, firstName: true, lastName: true, vipStatus: true } },
                assignedRoom: { select: { id: true, roomNumber: true, roomType: true, status: true, housekeepingStatus: true } },
            },
            orderBy: { arrivalDate: 'asc' },
        });
        return NextResponse.json(arrivals);
    }

    if (view === 'departures') {
        const targetDate = date ? new Date(date) : new Date();
        const startOfDay = new Date(targetDate); startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(targetDate); endOfDay.setHours(23, 59, 59, 999);
        const departures = await prisma.reservation.findMany({
            where: { departureDate: { gte: startOfDay, lte: endOfDay }, status: 'CHECKED_IN' },
            include: {
                guest: { select: { id: true, firstName: true, lastName: true, vipStatus: true } },
                assignedRoom: { select: { id: true, roomNumber: true, roomType: true } },
            },
            orderBy: { departureDate: 'asc' },
        });
        return NextResponse.json(departures);
    }

    const reservations = await prisma.reservation.findMany({
        where: {
            ...(status && { status }),
            ...(guestId && { guestId }),
        },
        include: {
            guest: { select: { id: true, firstName: true, lastName: true, vipStatus: true, email: true, phone: true } },
            assignedRoom: { select: { id: true, roomNumber: true, roomType: true, floor: true, status: true, housekeepingStatus: true } },
        },
        orderBy: { arrivalDate: 'asc' },
    });
    return NextResponse.json(reservations);
}

export async function POST(req: NextRequest) {
    const authUser = requireAuth(req);
    if (authUser instanceof NextResponse) return authUser;

    const body = await req.json();
    const confirmationNumber = `RES-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    const reservation = await prisma.reservation.create({
        data: {
            confirmationNumber,
            guestId: body.guestId,
            arrivalDate: new Date(body.arrivalDate),
            departureDate: new Date(body.departureDate),
            isVip: body.isVip || false,
            isConnecting: body.isConnecting || false,
            connectingGroupId: body.connectingGroupId,
            notes: body.notes,
        },
        include: { guest: true, assignedRoom: true },
    });

    // Audit log
    await prisma.auditLog.create({
        data: { action: 'RESERVATION_CREATED', entityType: 'Reservation', entityId: reservation.id, userId: authUser.sub, details: JSON.stringify({ confirmationNumber }) },
    });

    return NextResponse.json(reservation);
}
