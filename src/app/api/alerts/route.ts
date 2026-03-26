import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
    const user = requireAuth(req);
    if (user instanceof NextResponse) return user;

    const url = req.nextUrl;
    const limit = parseInt(url.searchParams.get('limit') || '100');

    const alerts = await prisma.alert.findMany({
        include: {
            room: { select: { id: true, roomNumber: true } },
            reservation: { select: { id: true, confirmationNumber: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
    });
    return NextResponse.json(alerts);
}

export async function PUT(req: NextRequest) {
    const authUser = requireAuth(req);
    if (authUser instanceof NextResponse) return authUser;

    // Mark all read
    await prisma.alert.updateMany({ where: { isRead: false }, data: { isRead: true } });
    return NextResponse.json({ success: true });
}
