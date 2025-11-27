import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Client from '@/models/Client';
import Project from '@/models/Project';
import Task from '@/models/Task';
import Transaction from '@/models/Transaction';
import { hashPassword } from '@/lib/auth';

export async function GET() {
    try {
        await dbConnect();

        // 1. Create Users (Staff)
        const users = [
            { name: 'Manager', email: 'manager@newcorner.com', role: 'manager', password: 'password123' },
            { name: 'Mohamed (Eng)', email: 'mohamed.eng@newcorner.com', role: 'engineer', password: 'password123' },
            { name: 'Amr (Eng)', email: 'amr.eng@newcorner.com', role: 'engineer', password: 'password123' },
            { name: 'Mohsen (Eng)', email: 'mohsen.eng@newcorner.com', role: 'engineer', password: 'password123' },
            { name: 'Ahmed (Acc)', email: 'ahmed.acc@newcorner.com', role: 'accountant', password: 'password123' },
            { name: 'Sayed (HR)', email: 'sayed.hr@newcorner.com', role: 'hr', password: 'password123' },
            { name: 'Mohamed (Draft)', email: 'mohamed.draft@newcorner.com', role: 'drafter', password: 'password123' },
        ];

        let admin; // Keep reference to manager as admin for other relations

        for (const u of users) {
            const hashedPassword = await hashPassword(u.password);

            // Upsert user: Update if exists, Create if not. Ensure password and role are set.
            const user = await User.findOneAndUpdate(
                { email: u.email },
                {
                    name: u.name,
                    email: u.email,
                    password: hashedPassword,
                    role: u.role,
                    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`,
                    permissions: ['all'],
                },
                { upsert: true, new: true, runValidators: true }
            );

            if (u.role === 'manager') admin = user;
        }

        if (!admin) {
            throw new Error('Manager user not found after seeding users');
        }

        // 2. Create Clients
        const clientsData = [
            { name: 'شركة الأفق للتطوير', email: 'contact@alofuq.com', phone: '0501234567', company: 'الأفق', address: 'الرياض - العليا' },
            { name: 'مجموعة البناء الحديث', email: 'info@modernbuild.sa', phone: '0559876543', company: 'البناء الحديث', address: 'جدة - التحلية' },
            { name: 'خالد العتيبي', email: 'khaled@gmail.com', phone: '0541112222', company: 'فرد', address: 'الدمام' },
        ];

        let clients = [];
        for (const c of clientsData) {
            let client = await Client.findOne({ email: c.email });
            if (!client) {
                // Create returns an array if passed an array, but here we pass an object.
                // However, Mongoose types can be tricky. We'll cast to any to be safe for this seed script.
                const newClient = await Client.create({ ...c, createdBy: admin._id } as any);
                client = newClient as any;
            }
            clients.push(client);
        }

        // 3. Create Projects
        const projectsData = [
            { title: 'تصميم فيلا سكنية - حي الملقا', client: clients[0]?._id, status: 'in_progress', budget: 150000, startDate: new Date(), endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
            { title: 'إشراف هندسي - برج العليا', client: clients[1]?._id, status: 'new', budget: 500000, startDate: new Date(), endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) },
            { title: 'استشارة فنية - ترميم', client: clients[2]?._id, status: 'completed', budget: 5000, startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), endDate: new Date() },
        ];

        let projects = [];
        for (const p of projectsData) {
            let project = await Project.findOne({ title: p.title });
            if (!project) {
                const newProject = await Project.create({ ...p, createdBy: admin._id, team: [admin._id] } as any);
                project = newProject as any;
            }
            projects.push(project);
        }

        // 4. Create Tasks
        if ((await Task.countDocuments()) === 0) {
            await Task.create([
                { title: 'إعداد المخططات الأولية', project: projects[0]?._id, assignee: admin._id, status: 'in_progress', priority: 'high', dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) },
                { title: 'مراجعة العقد', project: projects[1]?._id, assignee: admin._id, status: 'todo', priority: 'medium', dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) },
            ]);
        }

        // 5. Create Finance Data
        if ((await Transaction.countDocuments()) === 0) {
            await Transaction.create([
                { type: 'income', amount: 50000, category: 'دفعة مقدمة', description: 'دفعة أولى - فيلا الملقا', date: new Date(), project: projects[0]?._id, client: clients[0]?._id, createdBy: admin._id },
                { type: 'expense', amount: 2000, category: 'تراخيص', description: 'رسوم بلدية', date: new Date(), project: projects[0]?._id, createdBy: admin._id },
            ]);
        }

        return NextResponse.json({
            message: 'Database seeded successfully!',
            stats: {
                users: await User.countDocuments(),
                clients: clients.length,
                projects: projects.length,
                tasks: await Task.countDocuments(),
                transactions: await Transaction.countDocuments()
            }
        });
    } catch (error) {
        console.error('Seed error:', error);
        return NextResponse.json({ error: 'Seed failed', details: String(error) }, { status: 500 });
    }
}
