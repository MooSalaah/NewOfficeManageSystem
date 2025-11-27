import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Task from '@/models/Task';
import Project from '@/models/Project';
import User from '@/models/User';

export async function GET() {
    try {
        await dbConnect();

        // Ensure models are registered
        const _p = Project;
        const _u = User;

        const tasks = await Task.find({})
            .populate('project', 'title')
            .populate('assignee', 'name avatar')
            .sort({ createdAt: -1 });

        return NextResponse.json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        return NextResponse.json(
            { error: 'Failed to fetch tasks' },
            { status: 500 }
        );
    }
}
