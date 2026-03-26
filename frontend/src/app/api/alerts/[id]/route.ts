import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const authUser = requireAuth(req);
    if (authUser instanceof NextResponse) return authUser;

    const { id } = await params;
    const alert = await prisma.alert.update({
        where: { id },
        data: { isRead: true },
    });
    return NextResponse.json(alert);
}
