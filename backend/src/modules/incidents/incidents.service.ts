import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IncidentStatus } from '../../shared/enums';

@Injectable()
export class IncidentsService {
    constructor(private prisma: PrismaService) { }

    async create(data: {
        type: string;
        severity: string;
        roomId?: string;
        reservationId?: string;
        guestId?: string;
        rootCause: string;
        description: string;
    }) {
        return this.prisma.incident.create({
            data,
            include: {
                room: { select: { id: true, roomNumber: true } },
                reservation: { select: { id: true, confirmationNumber: true } },
                guest: { select: { id: true, firstName: true, lastName: true } },
            },
        });
    }

    async findAll(query?: { status?: string; severity?: string; type?: string; limit?: number }) {
        return this.prisma.incident.findMany({
            where: {
                ...(query?.status && { status: query.status }),
                ...(query?.severity && { severity: query.severity }),
                ...(query?.type && { type: query.type }),
            },
            include: {
                room: { select: { id: true, roomNumber: true } },
                reservation: { select: { id: true, confirmationNumber: true } },
                guest: { select: { id: true, firstName: true, lastName: true } },
                owner: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: query?.limit || 50,
        });
    }

    async findById(id: string) {
        return this.prisma.incident.findUnique({
            where: { id },
            include: {
                room: true,
                reservation: { include: { guest: true } },
                guest: true,
                owner: { select: { id: true, name: true, email: true } },
            },
        });
    }

    async updateStatus(id: string, status: string, ownerId?: string) {
        return this.prisma.incident.update({
            where: { id },
            data: {
                status,
                ...(ownerId && { ownerId }),
                ...(status === IncidentStatus.RESOLVED && { resolvedAt: new Date() }),
            },
        });
    }

    async assignOwner(id: string, ownerId: string) {
        return this.prisma.incident.update({
            where: { id },
            data: { ownerId, status: IncidentStatus.INVESTIGATING },
        });
    }

    async getStats() {
        const [open, investigating, total] = await Promise.all([
            this.prisma.incident.count({ where: { status: IncidentStatus.OPEN } }),
            this.prisma.incident.count({ where: { status: IncidentStatus.INVESTIGATING } }),
            this.prisma.incident.count(),
        ]);
        return { open, investigating, total, resolved: total - open - investigating };
    }
}
