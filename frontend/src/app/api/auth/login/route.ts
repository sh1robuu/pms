import { NextRequest, NextResponse } from 'next/server';
import { loginUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
    const { email, password } = await req.json();
    if (!email || !password) {
        return NextResponse.json({ message: 'Email and password required' }, { status: 400 });
    }
    const result = await loginUser(email, password);
    if (!result) {
        return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }
    return NextResponse.json(result);
}
