import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Project from '@/models/Project';
import Client from '@/models/Client';
import Transaction from '@/models/Transaction';
import Task from '@/models/Task';

export async function GET() {
    try {
        await dbConnect();

        const [projectsCount, clientsCount, tasksCount, transactions] = await Promise.all([
            Project.countDocuments(),
            Client.countDocuments(),
            Task.countDocuments({ status: { $ne: 'Completed' } }),
            Transaction.aggregate([
                { $match: { type: 'income' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ])
        ]);

        const revenue = transactions[0]?.total || 0;

        return NextResponse.json({
            projectsCount,
            clientsCount,
            revenue,
            pendingTasks: tasksCount
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch dashboard stats' },
            { status: 500 }
        );
    }
}
