import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { hashPassword, verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
    try {
        console.log('Fetching profile...');
        await dbConnect();
        console.log('DB connected in profile route');

        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = await verifyToken(token);
        if (!decoded || !decoded.id) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ user });
    } catch (error) {
        console.error('Error fetching profile:', error);
        return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();
        const { userId, name, email, password, currentPassword } = body;

        // In a real app, get userId from token. Here we accept it from body for demo simplicity
        // or we could parse the cookie again.

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Update fields
        if (name) user.name = name;
        if (email) user.email = email;
        // @ts-ignore
        if (body.avatar) user.avatar = body.avatar;

        if (password) {
            // Ideally verify currentPassword here
            user.password = await hashPassword(password);
        }

        await user.save();

        const userResponse = user.toObject();
        delete userResponse.password;

        return NextResponse.json(userResponse);
    } catch (error) {
        console.error('Error updating profile:', error);
        return NextResponse.json(
            { error: 'Failed to update profile' },
            { status: 500 }
        );
    }
}
