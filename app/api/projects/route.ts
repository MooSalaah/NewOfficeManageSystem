import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Project from '@/models/Project';
import Client from '@/models/Client';
import User from '@/models/User';

export async function GET() {
    try {
        await dbConnect();

        // Ensure models are registered
        const _u = User;
        const _c = Client;

        // Populate client name and team members (just names for list view)
        const projects = await Project.find({})
            .populate('client', 'name')
            .populate('team', 'name avatar')
            .sort({ createdAt: -1 });

        return NextResponse.json(projects);
    } catch (error) {
        console.error('Error fetching projects:', error);
        return NextResponse.json(
            { error: 'Failed to fetch projects' },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();

        // Basic validation could go here

        const project = await Project.create(body);

        return NextResponse.json(project, { status: 201 });
    } catch (error) {
        console.error('Error creating project:', error);
        return NextResponse.json(
            { error: 'Failed to create project' },
            { status: 500 }
        );
    }
}
