import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Client from '@/models/Client';

export async function GET() {
    try {
        await dbConnect();
        const clients = await Client.find({}).sort({ createdAt: -1 });
        return NextResponse.json(clients);
    } catch (error) {
        console.error('Error fetching clients:', error);
        return NextResponse.json(
            { error: 'Failed to fetch clients' },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();

        // Basic validation
        if (!body.name || !body.phone) {
            return NextResponse.json(
                { error: 'Name and Phone are required' },
                { status: 400 }
            );
        }

        const client = await Client.create(body);
        return NextResponse.json(client, { status: 201 });
    } catch (error) {
        console.error('Error creating client:', error);
        return NextResponse.json(
            { error: 'Failed to create client' },
            { status: 500 }
        );
    }
}
