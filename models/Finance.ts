import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IInvoice extends Document {
    project: mongoose.Types.ObjectId;
    client: mongoose.Types.ObjectId;
    amount: number;
    status: 'paid' | 'pending' | 'overdue';
    issueDate: Date;
    dueDate: Date;
    items: { description: string; quantity: number; price: number }[];
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const InvoiceSchema: Schema = new Schema(
    {
        project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
        client: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
        amount: { type: Number, required: true },
        status: {
            type: String,
            enum: ['paid', 'pending', 'overdue'],
            default: 'pending',
            index: true,
        },
        issueDate: { type: Date, required: true },
        dueDate: { type: Date, required: true },
        items: [{
            description: { type: String, required: true },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true }
        }],
        notes: { type: String },
    },
    { timestamps: true }
);

export interface IExpense extends Document {
    title: string;
    amount: number;
    category: 'office' | 'salary' | 'software' | 'marketing' | 'other';
    date: Date;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}

const ExpenseSchema: Schema = new Schema(
    {
        title: { type: String, required: true },
        amount: { type: Number, required: true },
        category: {
            type: String,
            enum: ['office', 'salary', 'software', 'marketing', 'other'],
            default: 'other',
            index: true,
        },
        date: { type: Date, required: true },
        description: { type: String },
    },
    { timestamps: true }
);

export const Invoice: Model<IInvoice> = mongoose.models.Invoice || mongoose.model<IInvoice>('Invoice', InvoiceSchema);
export const Expense: Model<IExpense> = mongoose.models.Expense || mongoose.model<IExpense>('Expense', ExpenseSchema);
