import { UsersService } from './users.service';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
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
    create(body: {
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
    update(id: string, body: any): Promise<{
        id: string;
        email: string;
        name: string;
        role: string;
        isActive: boolean;
    }>;
}
