import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const user = requireAuth(req);
    if (user instanceof NextResponse) return user;

    const { id } = await params;
    const guest = await prisma.guest.findUnique({
        where: { id },
        include: {
            reservations: {
                include: {
                    assignedRoom: { select: { roomNumber: true, roomType: true } },
                    keys: { select: { id: true, keyCode: true, status: true, issuedAt: true } },
                },
                orderBy: { arrivalDate: 'desc' },
            },
        },
    });
    if (!guest) return NextResponse.json({ message: 'Guest not found' }, { status: 404 });
    return NextResponse.json(guest);
}
