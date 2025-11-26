import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Transaction from '@/models/Transaction';
import Invoice from '@/models/Invoice';

export async function GET() {
    try {
        await dbConnect();

        // Fetch recent transactions
        const transactions = await Transaction.find({})
            .sort({ date: -1 })
            .limit(10)
            .populate('project', 'title')
            .populate('client', 'name');

        // Calculate totals
        const income = await Transaction.aggregate([
            { $match: { type: 'income' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const expenses = await Transaction.aggregate([
            { $match: { type: 'expense' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const totalIncome = income[0]?.total || 0;
        const totalExpenses = expenses[0]?.total || 0;
        const netProfit = totalIncome - totalExpenses;

        // Mock chart data (last 6 months) - in a real app, use aggregation
        const chartData = [
            { name: 'يناير', income: 4000, expense: 2400 },
            { name: 'فبراير', income: 3000, expense: 1398 },
            { name: 'مارس', income: 2000, expense: 9800 },
            { name: 'أبريل', income: 2780, expense: 3908 },
            { name: 'مايو', income: 1890, expense: 4800 },
            { name: 'يونيو', income: 2390, expense: 3800 },
        ];

        return NextResponse.json({
            stats: {
                income: totalIncome,
                expenses: totalExpenses,
                netProfit,
            },
            transactions,
            chartData
        });
    } catch (error) {
        console.error('Error fetching finance data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch finance data' },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();

        // In a real app, get user ID from token/session
        // For demo, we'll assume a dummy user ID or pass it in body (not secure but quick)
        // Ideally, middleware adds user to request, but Next.js App Router API handling is different.
        // We'll just use a hardcoded ID for the "CreatedBy" for now if not provided, or fetch the first admin.

        // const admin = await User.findOne({ role: 'admin' });
        // body.createdBy = admin._id;

        // Actually, let's just require it or mock it.
        // We will skip createdBy validation for this demo step to ensure it works without auth context in API easily
        // OR better, we just don't enforce it in the schema strictly if we didn't require it?
        // Schema says required: true.
        // Let's fetch a user.

        const User = (await import('@/models/User')).default;
        const admin = await User.findOne();

        const transaction = await Transaction.create({
            ...body,
            createdBy: admin?._id
        });

        return NextResponse.json(transaction, { status: 201 });
    } catch (error) {
        console.error('Error creating transaction:', error);
        return NextResponse.json(
            { error: 'Failed to create transaction' },
            { status: 500 }
        );
    }
}
