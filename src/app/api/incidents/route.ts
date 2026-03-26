import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
    const user = requireAuth(req);
    if (user instanceof NextResponse) return user;

    const url = req.nextUrl;
    const view = url.searchParams.get('view');
    const status = url.searchParams.get('status');

    if (view === 'stats') {
        const [open, investigating, total, resolved] = await Promise.all([
            prisma.incident.count({ where: { status: 'OPEN' } }),
            prisma.incident.count({ where: { status: 'INVESTIGATING' } }),
            prisma.incident.count(),
            prisma.incident.count({ where: { status: 'RESOLVED' } }),
        ]);
        return NextResponse.json({ open, investigating, total, resolved });
    }

    const incidents = await prisma.incident.findMany({
        where: { ...(status && { status }) },
        include: {
            room: { select: { id: true, roomNumber: true } },
            reservation: { select: { id: true, confirmationNumber: true } },
            guest: { select: { id: true, firstName: true, lastName: true } },
            owner: { select: { id: true, name: true } },
        },
        orderBy: [{ severity: 'desc' }, { createdAt: 'desc' }],
    });
    return NextResponse.json(incidents);
}
