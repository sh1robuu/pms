import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
    const user = requireAuth(req);
    if (user instanceof NextResponse) return user;

    const url = req.nextUrl;
    const status = url.searchParams.get('status');
    const reservationId = url.searchParams.get('reservationId');
    const limit = parseInt(url.searchParams.get('limit') || '100');

    const keys = await prisma.key.findMany({
        where: {
            ...(status && { status }),
            ...(reservationId && { reservationId }),
        },
        include: {
            guest: { select: { id: true, firstName: true, lastName: true } },
            room: { select: { id: true, roomNumber: true } },
            reservation: { select: { id: true, confirmationNumber: true } },
            issuedBy: { select: { id: true, name: true } },
            revokedBy: { select: { id: true, name: true } },
        },
        orderBy: { issuedAt: 'desc' },
        take: limit,
    });
    return NextResponse.json(keys);
}

export async function POST(req: NextRequest) {
    const authUser = requireAuth(req);
    if (authUser instanceof NextResponse) return authUser;

    const { reservationId, roomId, guestId } = await req.json();

    // Validate reservation
    const reservation = await prisma.reservation.findUnique({ where: { id: reservationId }, include: { assignedRoom: true } });
    if (!reservation) return NextResponse.json({ message: 'Reservation not found' }, { status: 404 });

    if (reservation.status !== 'CHECKED_IN') {
        return NextResponse.json({
            message: 'Key issuance blocked',
            validation: { valid: false, errors: [{ code: 'NOT_CHECKED_IN', message: 'Guest is not checked in', severity: 'CRITICAL' }], warnings: [] },
        }, { status: 400 });
    }

    if (reservation.assignedRoomId !== roomId) {
        // Auto-create incident for room mismatch
        await prisma.incident.create({
            data: {
                type: 'KEY_MISMATCH', severity: 'HIGH', roomId, reservationId, guestId,
                rootCause: 'KEY_ROOM_MISMATCH', description: `Key issuance blocked: room does not match reservation assignment`,
                status: 'OPEN',
            },
        });
        return NextResponse.json({
            message: 'Key issuance blocked',
            validation: { valid: false, errors: [{ code: 'ROOM_MISMATCH', message: 'Room does not match reservation assignment', severity: 'CRITICAL' }], warnings: [] },
        }, { status: 400 });
    }

    const keyCode = `KEY-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    const key = await prisma.key.create({
        data: { reservationId, roomId, guestId, issuedById: authUser.sub, keyCode, status: 'ACTIVE' },
        include: {
            guest: { select: { id: true, firstName: true, lastName: true } },
            room: { select: { id: true, roomNumber: true } },
            reservation: { select: { id: true, confirmationNumber: true } },
            issuedBy: { select: { id: true, name: true } },
        },
    });

    await prisma.auditLog.create({
        data: { action: 'KEY_ISSUED', entityType: 'Key', entityId: key.id, userId: authUser.sub, details: JSON.stringify({ keyCode, roomId, guestId }) },
    });

    return NextResponse.json({ key, validation: { valid: true, errors: [], warnings: [] } });
}
