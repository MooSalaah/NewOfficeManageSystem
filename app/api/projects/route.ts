import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Project from '@/models/Project';
import Client from '@/models/Client';
import User from '@/models/User';
import Task from '@/models/Task';

export async function GET() {
    try {
        console.log('Fetching projects...');
        await dbConnect();
        console.log('DB connected in projects route');

        // Ensure models are registered
        const _u = User;
        const _c = Client;

        // Populate client name and team members (just names for list view)
        const projects = await Project.find({})
            .populate('client', 'name')
            .populate('team', 'name avatar')
            .populate('manager', 'name')
            .sort({ createdAt: -1 });

        return NextResponse.json(projects);
    } catch (error: any) {
        console.error('Error fetching projects:', error);
        if (error.message && error.message.includes('MONGODB_URI')) {
            return NextResponse.json({ error: 'Database configuration error: MONGODB_URI is missing' }, { status: 500 });
        }
        return NextResponse.json(
            { error: 'Failed to fetch projects', details: error.message },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();
        const { tasks, ...projectData } = body;

        // Basic validation could go here

        const project = await Project.create(projectData);
        const projectId = (project as any)._id;

        // Create tasks if provided
        if (tasks && Array.isArray(tasks) && tasks.length > 0) {
            const taskDocs = tasks.map((taskTitle: string) => ({
                title: taskTitle,
                project: projectId,
                status: 'todo',
                priority: 'medium',
                description: `مهمة تلقائية: ${taskTitle}`,
                // Assign to creator if we had user info, or leave unassigned
            }));

            await Task.insertMany(taskDocs);
        }

        return NextResponse.json(project, { status: 201 });
    } catch (error: any) {
        console.error('Error creating project:', error);
        if (error.message && error.message.includes('MONGODB_URI')) {
            return NextResponse.json({ error: 'Database configuration error: MONGODB_URI is missing' }, { status: 500 });
        }
        return NextResponse.json(
            { error: 'Failed to create project', details: error.message },
            { status: 500 }
        );
    }
}
