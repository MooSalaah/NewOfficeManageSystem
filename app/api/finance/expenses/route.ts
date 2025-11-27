import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Expense } from '@/models/Finance';

export async function GET() {
    try {
        await dbConnect();
        const expenses = await Expense.find({}).sort({ date: -1 });
        return NextResponse.json(expenses);
    } catch (error) {
        console.error('Error fetching expenses:', error);
        return NextResponse.json(
            { error: 'Failed to fetch expenses' },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();

        if (!body.title || !body.amount || !body.date) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const expense = await Expense.create(body);
        return NextResponse.json(expense, { status: 201 });
    } catch (error) {
        console.error('Error creating expense:', error);
        return NextResponse.json(
            { error: 'Failed to create expense' },
            { status: 500 }
        );
    }
}
