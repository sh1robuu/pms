import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const authUser = requireAuth(req);
    if (authUser instanceof NextResponse) return authUser;

    const { id } = await params;
    const reservation = await prisma.reservation.findUnique({ where: { id }, include: { assignedRoom: true } });
    if (!reservation) return NextResponse.json({ message: 'Not found' }, { status: 404 });

    if (!reservation.assignedRoomId) {
        return NextResponse.json({
            message: 'Check-in validation failed',
            validation: { valid: false, errors: [{ code: 'NO_ROOM', message: 'No room assigned to this reservation', severity: 'CRITICAL' }], warnings: [] },
        }, { status: 400 });
    }

    if (reservation.assignedRoom && reservation.assignedRoom.status !== 'VACANT_CLEAN') {
        return NextResponse.json({
            message: 'Check-in validation failed',
            validation: { valid: false, errors: [{ code: 'ROOM_NOT_READY', message: `Room ${reservation.assignedRoom.roomNumber} is ${reservation.assignedRoom.status.replace(/_/g, ' ')}`, severity: 'HIGH' }], warnings: [] },
        }, { status: 400 });
    }

    const updated = await prisma.reservation.update({
        where: { id },
        data: { status: 'CHECKED_IN', checkedInAt: new Date() },
        include: { guest: true, assignedRoom: true },
    });

    await prisma.room.update({
        where: { id: reservation.assignedRoomId },
        data: { status: 'OCCUPIED', currentOccupantId: reservation.guestId },
    });

    await prisma.auditLog.create({
        data: { action: 'CHECK_IN', entityType: 'Reservation', entityId: id, userId: authUser.sub, details: JSON.stringify({ roomId: reservation.assignedRoomId }) },
    });

    return NextResponse.json({ reservation: updated, validation: { valid: true, errors: [], warnings: [] } });
}
