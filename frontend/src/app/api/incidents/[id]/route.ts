import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const authUser = requireAuth(req);
    if (authUser instanceof NextResponse) return authUser;

    const { id } = await params;
    const { status, ownerId } = await req.json();

    const data: Record<string, unknown> = {};
    if (status) data.status = status;
    if (status === 'RESOLVED') data.resolvedAt = new Date();
    if (ownerId) data.ownerId = ownerId;

    const incident = await prisma.incident.update({
        where: { id },
        data,
        include: {
            room: { select: { id: true, roomNumber: true } },
            reservation: { select: { id: true, confirmationNumber: true } },
        },
    });

    await prisma.auditLog.create({
        data: { action: `INCIDENT_${status || 'UPDATED'}`, entityType: 'Incident', entityId: id, userId: authUser.sub },
    });

    return NextResponse.json(incident);
}
