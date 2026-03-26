import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const authUser = requireAuth(req);
    if (authUser instanceof NextResponse) return authUser;

    const { id } = await params;
    const { roomId } = await req.json();

    // Validate room exists and is clean
    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room) return NextResponse.json({ message: 'Room not found' }, { status: 404 });
    if (room.status !== 'VACANT_CLEAN') {
        return NextResponse.json({
            message: 'Room assignment validation failed',
            validation: { valid: false, errors: [{ code: 'ROOM_NOT_READY', message: `Room ${room.roomNumber} is ${room.status.replace(/_/g, ' ')} - must be VACANT CLEAN`, severity: 'HIGH' }], warnings: [] },
        }, { status: 400 });
    }

    // Check for occupancy conflict
    const conflict = await prisma.reservation.findFirst({
        where: { assignedRoomId: roomId, status: 'CHECKED_IN', id: { not: id } },
    });
    if (conflict) {
        return NextResponse.json({
            message: 'Room assignment validation failed',
            validation: { valid: false, errors: [{ code: 'OCCUPANCY_CONFLICT', message: `Room ${room.roomNumber} is occupied by another reservation`, severity: 'CRITICAL' }], warnings: [] },
        }, { status: 400 });
    }

    const reservation = await prisma.reservation.update({
        where: { id },
        data: { assignedRoomId: roomId },
        include: { guest: true, assignedRoom: true },
    });

    await prisma.auditLog.create({
        data: { action: 'ROOM_ASSIGNED', entityType: 'Reservation', entityId: id, userId: authUser.sub, details: JSON.stringify({ roomId, roomNumber: room.roomNumber }) },
    });

    return NextResponse.json({ reservation, validation: { valid: true, errors: [], warnings: [] } });
}
