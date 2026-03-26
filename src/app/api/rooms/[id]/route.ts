import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const authUser = requireAuth(req);
    if (authUser instanceof NextResponse) return authUser;

    const { id } = await params;
    const { status, housekeepingStatus, reason } = await req.json();

    const data: Record<string, unknown> = {};
    if (status) data.status = status;
    if (status === 'OUT_OF_ORDER' && reason) data.outOfOrderReason = reason;
    if (status === 'VACANT_CLEAN') {
        data.outOfOrderReason = null;
        data.housekeepingStatus = 'CLEAN';
    }
    if (housekeepingStatus) {
        data.housekeepingStatus = housekeepingStatus;
        if (housekeepingStatus === 'CLEAN') data.status = 'VACANT_CLEAN';
        if (housekeepingStatus === 'INSPECTED') data.inspectedAt = new Date();
    }

    const room = await prisma.room.update({
        where: { id },
        data,
        include: { currentOccupant: { select: { firstName: true, lastName: true } } },
    });

    await prisma.auditLog.create({
        data: { action: housekeepingStatus ? 'HOUSEKEEPING_UPDATE' : 'ROOM_STATUS_UPDATE', entityType: 'Room', entityId: id, userId: authUser.sub, details: JSON.stringify({ status, housekeepingStatus }) },
    });

    return NextResponse.json(room);
}
