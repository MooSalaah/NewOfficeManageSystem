import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { hashPassword } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        await dbConnect();
        // In a real app, verify admin role from token here
        // For now, we assume the frontend protects the route or we check headers if we had middleware passing user info

        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        return NextResponse.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json(
            { error: 'Failed to fetch users' },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();
        const { name, email, password, role } = body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { error: 'User already exists' },
                { status: 400 }
            );
        }

        const hashedPassword = await hashPassword(password);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'employee',
            permissions: [] // Default permissions
        });

        // Remove password from response
        const userResponse = user.toObject();
        delete userResponse.password;

        return NextResponse.json(userResponse, { status: 201 });
    } catch (error) {
        console.error('Error creating user:', error);
        return NextResponse.json(
            { error: 'Failed to create user' },
            { status: 500 }
        );
    }
}
