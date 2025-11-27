import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Attendance } from '@/models/Attendance';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function GET() {
    try {
        await dbConnect();

        // Get current user from token
        const cookieStore = await cookies();
        const token = cookieStore.get('token');

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = await verifyToken(token.value);
        if (!payload || !payload.userId) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const records = await Attendance.find({ user: payload.userId })
            .sort({ date: -1 })
            .limit(30); // Last 30 days

        // Check if checked in today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayRecord = await Attendance.findOne({
            user: payload.userId,
            date: today
        });

        return NextResponse.json({
            history: records,
            today: todayRecord
        });
    } catch (error) {
        console.error('Error fetching attendance:', error);
        return NextResponse.json(
            { error: 'Failed to fetch attendance' },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();
        const { action } = body; // 'check-in' or 'check-out'

        // Get current user
        const cookieStore = await cookies();
        const token = cookieStore.get('token');

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = await verifyToken(token.value);
        if (!payload || !payload.userId) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const now = new Date();

        if (action === 'check-in') {
            // Check if already checked in
            const existing = await Attendance.findOne({ user: payload.userId, date: today });
            if (existing) {
                return NextResponse.json({ error: 'Already checked in today' }, { status: 400 });
            }

            const record = await Attendance.create({
                user: payload.userId,
                date: today,
                checkIn: now,
                status: 'present' // Logic for 'late' can be added here
            });

            return NextResponse.json(record);
        } else if (action === 'check-out') {
            const record = await Attendance.findOne({ user: payload.userId, date: today });
            if (!record) {
                return NextResponse.json({ error: 'No check-in record found for today' }, { status: 400 });
            }

            record.checkOut = now;
            await record.save();

            return NextResponse.json(record);
        } else {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

    } catch (error) {
        console.error('Error processing attendance:', error);
        return NextResponse.json(
            { error: 'Failed to process attendance' },
            { status: 500 }
        );
    }
}
