import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Client from '@/models/Client';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { name, phone } = await req.json();

        // Check if client exists by name (simple check for demo)
        let client = await Client.findOne({ name });

        if (!client) {
            client = await Client.create({
                name,
                phone: phone || '0000000000', // Default if not provided
                email: '',
                companyName: '',
                address: '',
                notes: 'Created via Quick Add'
            });
        }

        return NextResponse.json(client);
    } catch (error) {
        console.error('Error in quick client create:', error);
        return NextResponse.json(
            { error: 'Failed to create/find client' },
            { status: 500 }
        );
    }
}
