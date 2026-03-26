import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
    const user = requireAuth(req);
    if (user instanceof NextResponse) return user;

    const url = req.nextUrl;
    const search = url.searchParams.get('search');
    const vipOnly = url.searchParams.get('vip') === 'true';

    const guests = await prisma.guest.findMany({
        where: {
            ...(vipOnly && { vipStatus: true }),
            ...(search && {
                OR: [
                    { firstName: { contains: search } },
                    { lastName: { contains: search } },
                    { email: { contains: search } },
                    { phone: { contains: search } },
                ],
            }),
        },
        include: {
            reservations: {
                select: { id: true, confirmationNumber: true, status: true, arrivalDate: true, departureDate: true, isVip: true },
                orderBy: { arrivalDate: 'desc' },
                take: 5,
            },
            _count: { select: { reservations: true } },
        },
        orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(guests);
}

export async function POST(req: NextRequest) {
    const authUser = requireAuth(req);
    if (authUser instanceof NextResponse) return authUser;

    const body = await req.json();
    const guest = await prisma.guest.create({
        data: {
            firstName: body.firstName,
            lastName: body.lastName,
            email: body.email || null,
            phone: body.phone || null,
            idNumber: body.idNumber || null,
            vipStatus: body.vipStatus || false,
            notes: body.notes || null,
        },
    });

    await prisma.auditLog.create({
        data: { action: 'GUEST_CREATED', entityType: 'Guest', entityId: guest.id, userId: authUser.sub, details: JSON.stringify({ name: `${body.firstName} ${body.lastName}` }) },
    });

    return NextResponse.json(guest);
}
