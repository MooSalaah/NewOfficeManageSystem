import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Invoice } from '@/models/Finance';
import Project from '@/models/Project';
import Client from '@/models/Client';

export async function GET() {
    try {
        await dbConnect();

        // Ensure models are registered
        const _p = Project;
        const _c = Client;

        const invoices = await Invoice.find({})
            .populate('project', 'title')
            .populate('client', 'name')
            .sort({ createdAt: -1 });

        return NextResponse.json(invoices);
    } catch (error) {
        console.error('Error fetching invoices:', error);
        return NextResponse.json(
            { error: 'Failed to fetch invoices' },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();

        // Basic validation
        if (!body.project || !body.amount || !body.dueDate) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const invoice = await Invoice.create(body);
        return NextResponse.json(invoice, { status: 201 });
    } catch (error) {
        console.error('Error creating invoice:', error);
        return NextResponse.json(
            { error: 'Failed to create invoice' },
            { status: 500 }
        );
    }
}
