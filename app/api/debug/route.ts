import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';

export async function GET() {
    const status = {
        env: {
            NODE_ENV: process.env.NODE_ENV,
            VERCEL: process.env.VERCEL,
            HAS_MONGO_URI: !!process.env.MONGODB_URI,
            HAS_JWT_SECRET: !!process.env.JWT_SECRET,
        },
        db: 'unknown',
        error: null as string | null,
    };

    try {
        await dbConnect();
        status.db = 'connected';
    } catch (e: any) {
        status.db = 'failed';
        status.error = e.message;
    }

    return NextResponse.json(status);
}
