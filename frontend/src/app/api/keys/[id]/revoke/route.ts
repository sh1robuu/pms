import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const authUser = requireAuth(req);
    if (authUser instanceof NextResponse) return authUser;

    const { id } = await params;
    const key = await prisma.key.update({
        where: { id },
        data: { status: 'REVOKED', revokedAt: new Date(), revokedById: authUser.sub },
        include: {
            guest: { select: { firstName: true, lastName: true } },
            room: { select: { roomNumber: true } },
        },
    });

    await prisma.auditLog.create({
        data: { action: 'KEY_REVOKED', entityType: 'Key', entityId: id, userId: authUser.sub, details: JSON.stringify({ keyCode: key.keyCode }) },
    });

    return NextResponse.json(key);
}
