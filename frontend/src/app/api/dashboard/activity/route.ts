import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
    const user = requireAuth(req);
    if (user instanceof NextResponse) return user;

    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '20');
    const [recentAudit, recentAlerts] = await Promise.all([
        prisma.auditLog.findMany({ include: { user: { select: { name: true } } }, orderBy: { createdAt: 'desc' }, take: limit }),
        prisma.alert.findMany({ include: { room: { select: { roomNumber: true } }, reservation: { select: { confirmationNumber: true } } }, orderBy: { createdAt: 'desc' }, take: limit }),
    ]);
    return NextResponse.json({ recentAudit, recentAlerts });
}
