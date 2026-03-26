import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from './db';
import { NextRequest, NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'hotel-pms-secret-key-2024';

export async function loginUser(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) return null;

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return null;

    const token = jwt.sign(
        { sub: user.id, email: user.email, role: user.role, name: user.name },
        JWT_SECRET,
        { expiresIn: '24h' },
    );

    return {
        access_token: token,
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
    };
}

export function verifyToken(token: string) {
    try {
        return jwt.verify(token, JWT_SECRET) as { sub: string; email: string; role: string; name: string };
    } catch {
        return null;
    }
}

// Helper to extract and verify user from request
export function getAuthUser(req: NextRequest) {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return null;
    const token = authHeader.slice(7);
    return verifyToken(token);
}

// Middleware helper for protected routes
export function requireAuth(req: NextRequest) {
    const user = getAuthUser(req);
    if (!user) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return user;
}
