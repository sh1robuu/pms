import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.user.findMany({
            select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findById(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true, updatedAt: true },
        });
        if (!user) throw new NotFoundException('User not found');
        return user;
    }

    async create(data: { email: string; name: string; password: string; role: string }) {
        const passwordHash = await bcrypt.hash(data.password, 12);
        return this.prisma.user.create({
            data: {
                email: data.email,
                name: data.name,
                passwordHash,
                role: data.role,
            },
            select: { id: true, email: true, name: true, role: true, createdAt: true },
        });
    }

    async update(id: string, data: Partial<{ name: string; role: string; isActive: boolean }>) {
        return this.prisma.user.update({
            where: { id },
            data,
            select: { id: true, email: true, name: true, role: true, isActive: true },
        });
    }
}
