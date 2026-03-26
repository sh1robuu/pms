import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class GuestsService {
    constructor(private prisma: PrismaService) { }

    async findAll(query?: { search?: string; vipOnly?: boolean }) {
        return this.prisma.guest.findMany({
            where: {
                ...(query?.search && {
                    OR: [
                        { firstName: { contains: query.search } },
                        { lastName: { contains: query.search } },
                        { email: { contains: query.search } },
                    ],
                }),
                ...(query?.vipOnly && { vipStatus: true }),
            },
            include: {
                reservations: { orderBy: { arrivalDate: 'desc' }, take: 5 },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findById(id: string) {
        return this.prisma.guest.findUnique({
            where: { id },
            include: {
                reservations: {
                    include: { assignedRoom: true },
                    orderBy: { arrivalDate: 'desc' },
                },
                keys: { orderBy: { issuedAt: 'desc' } },
            },
        });
    }

    async create(data: {
        firstName: string;
        lastName: string;
        email?: string;
        phone?: string;
        idNumber?: string;
        vipStatus?: boolean;
        notes?: string;
    }) {
        return this.prisma.guest.create({ data });
    }

    async update(id: string, data: Partial<{
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        idNumber: string;
        vipStatus: boolean;
        notes: string;
    }>) {
        return this.prisma.guest.update({ where: { id }, data });
    }
}
