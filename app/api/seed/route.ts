import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { hashPassword } from '@/lib/auth';

export async function GET() {
    try {
        await dbConnect();

        const email = 'admin@example.com';
        const existing = await User.findOne({ email });

        if (existing) {
            return NextResponse.json({ message: 'User already exists' });
        }

        const hashedPassword = await hashPassword('password123');

        await User.create({
            name: 'Admin User',
            email,
            password: hashedPassword,
            role: 'admin',
            permissions: ['all'],
        });

        return NextResponse.json({ message: 'Admin user created: admin@example.com / password123' });
    } catch (error) {
        return NextResponse.json({ error: 'Seed failed', details: error }, { status: 500 });
    }
}
