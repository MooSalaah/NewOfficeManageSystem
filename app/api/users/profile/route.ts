import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { hashPassword } from '@/lib/auth';

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
