import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const authUser = requireAuth(req);
    if (authUser instanceof NextResponse) return authUser;

    const { id } = await params;
    const reservation = await prisma.reservation.findUnique({ where: { id }, include: { keys: { where: { status: 'ACTIVE' } } } });
    if (!reservation) return NextResponse.json({ message: 'Not found' }, { status: 404 });
    if (reservation.status !== 'CHECKED_IN') return NextResponse.json({ message: 'Not checked in' }, { status: 400 });

    // Revoke all active keys
    await prisma.key.updateMany({ where: { reservationId: id, status: 'ACTIVE' }, data: { status: 'REVOKED', revokedAt: new Date(), revokedById: authUser.sub } });

    const updated = await prisma.reservation.update({
        where: { id },
        data: { status: 'CHECKED_OUT', checkedOutAt: new Date() },
        include: { guest: true, assignedRoom: true },
    });

    if (reservation.assignedRoomId) {
        await prisma.room.update({
            where: { id: reservation.assignedRoomId },
            data: { status: 'VACANT_DIRTY', currentOccupantId: null, housekeepingStatus: 'DIRTY' },
        });
    }

    await prisma.auditLog.create({
        data: { action: 'CHECK_OUT', entityType: 'Reservation', entityId: id, userId: authUser.sub, details: JSON.stringify({ roomId: reservation.assignedRoomId }) },
    });

    return NextResponse.json(updated);
}
