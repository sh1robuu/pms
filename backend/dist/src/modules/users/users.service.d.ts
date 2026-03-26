import { PrismaService } from '../../prisma/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: string;
        email: string;
        name: string;
        role: string;
        isActive: boolean;
        createdAt: Date;
    }[]>;
    findById(id: string): Promise<{
        id: string;
        email: string;
        name: string;
        role: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(data: {
        email: string;
        name: string;
        password: string;
        role: string;
    }): Promise<{
        id: string;
        email: string;
        name: string;
        role: string;
        createdAt: Date;
    }>;
    update(id: string, data: Partial<{
        name: string;
        role: string;
        isActive: boolean;
    }>): Promise<{
        id: string;
        email: string;
        name: string;
        role: string;
        isActive: boolean;
    }>;
}
