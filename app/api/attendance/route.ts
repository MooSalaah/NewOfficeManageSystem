import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Attendance from '@/models/Attendance';
import User from '@/models/User'; // Ensure User is registered

export async function GET(req: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

        const attendance = await Attendance.find({ date })
            .populate('user', 'name email avatar role')
            .sort({ checkIn: 1 });

        return NextResponse.json(attendance);
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
        const { action, userId } = body; // action: 'check-in' | 'check-out'

        // Mock user ID if not provided (for demo)
        let targetUserId = userId;
        if (!targetUserId) {
            const User = (await import('@/models/User')).default;
            const admin = await User.findOne();
            targetUserId = admin?._id;
        }

        const today = new Date().toISOString().split('T')[0];

        if (action === 'check-in') {
            // Check if already checked in
            const existing = await Attendance.findOne({ user: targetUserId, date: today });
            if (existing) {
                return NextResponse.json(
                    { error: 'Already checked in today' },
                    { status: 400 }
                );
            }

            const attendance = await Attendance.create({
                user: targetUserId,
                date: today,
                checkIn: new Date(),
                status: 'present' // Logic for 'late' could be added here based on time
            });

            return NextResponse.json(attendance, { status: 201 });
        } else if (action === 'check-out') {
            const attendance = await Attendance.findOne({ user: targetUserId, date: today });

            if (!attendance) {
                return NextResponse.json(
                    { error: 'No check-in record found for today' },
                    { status: 404 }
                );
            }

            attendance.checkOut = new Date();
            await attendance.save();

            return NextResponse.json(attendance);
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Error in attendance action:', error);
        return NextResponse.json(
            { error: 'Failed to process attendance' },
            { status: 500 }
        );
    }
}
