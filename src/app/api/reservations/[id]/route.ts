import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const user = requireAuth(req);
    if (user instanceof NextResponse) return user;

    const { id } = await params;
    const reservation = await prisma.reservation.findUnique({
        where: { id },
        include: {
            guest: true,
            assignedRoom: { include: { connectingRoom: true } },
            keys: { include: { issuedBy: { select: { id: true, name: true } }, revokedBy: { select: { id: true, name: true } } }, orderBy: { issuedAt: 'desc' } },
            incidents: { orderBy: { createdAt: 'desc' } },
            alerts: { orderBy: { createdAt: 'desc' } },
        },
    });
    if (!reservation) return NextResponse.json({ message: 'Not found' }, { status: 404 });
    return NextResponse.json(reservation);
}
