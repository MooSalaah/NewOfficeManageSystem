import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Invoice from '@/models/Invoice';
import Client from '@/models/Client'; // Ensure Client is registered

export async function GET() {
    try {
        await dbConnect();
        const invoices = await Invoice.find({})
            .populate('client', 'name companyName address')
            .populate('project', 'title')
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

        // Auto-generate invoice number if not provided
        if (!body.invoiceNumber) {
            const count = await Invoice.countDocuments();
            body.invoiceNumber = `INV-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;
        }

        // Mock user
        const User = (await import('@/models/User')).default;
        const admin = await User.findOne();

        const invoice = await Invoice.create({
            ...body,
            createdBy: admin?._id
        });

        return NextResponse.json(invoice, { status: 201 });
    } catch (error) {
        console.error('Error creating invoice:', error);
        return NextResponse.json(
            { error: 'Failed to create invoice' },
            { status: 500 }
        );
    }
}
