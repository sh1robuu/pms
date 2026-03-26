import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AlertsService {
    constructor(private prisma: PrismaService) { }

    async create(data: {
        type: string;
        severity: string;
        message: string;
        roomId?: string;
        reservationId?: string;
    }) {
        return this.prisma.alert.create({
            data,
            include: {
                room: { select: { id: true, roomNumber: true } },
                reservation: { select: { id: true, confirmationNumber: true } },
            },
        });
    }

    async findAll(query?: { isRead?: boolean; severity?: string; limit?: number }) {
        return this.prisma.alert.findMany({
            where: {
                ...(query?.isRead !== undefined && { isRead: query.isRead }),
                ...(query?.severity && { severity: query.severity }),
            },
            include: {
                room: { select: { id: true, roomNumber: true } },
                reservation: { select: { id: true, confirmationNumber: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: query?.limit || 50,
        });
    }

    async markAsRead(id: string) {
        return this.prisma.alert.update({
            where: { id },
            data: { isRead: true },
        });
    }

    async markAllAsRead() {
        return this.prisma.alert.updateMany({
            where: { isRead: false },
            data: { isRead: true },
        });
    }

    async getUnreadCount() {
        return this.prisma.alert.count({ where: { isRead: false } });
    }
}
