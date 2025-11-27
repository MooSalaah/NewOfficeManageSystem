import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { comparePassword, signToken } from '@/lib/auth';

export async function POST(req: Request) {
    let step = 'init';
    try {
        step = 'db_connect';
        await dbConnect();

        step = 'parse_body';
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
        }

        step = 'find_user';
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 401 });
        }

        step = 'compare_password';
        const isMatch = await comparePassword(password, user.password!);

        if (!isMatch) {
            return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
        }

        step = 'sign_token';
        const token = await signToken({
            id: user._id,
            role: user.role,
            name: user.name,
        });

        step = 'create_response';
        const response = NextResponse.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });

        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: '/',
        });

        return response;
    } catch (error: any) {
        console.error(`Login error at step ${step}:`, error);
        return NextResponse.json(
            { error: `Failed at ${step}: ${error.message}`, stack: error.stack },
            { status: 500 }
        );
    }
}
