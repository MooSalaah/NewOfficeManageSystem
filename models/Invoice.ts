import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IInvoice extends Document {
    invoiceNumber: string;
    client: mongoose.Types.ObjectId;
    project?: mongoose.Types.ObjectId;
    items: { description: string; quantity: number; unitPrice: number; total: number }[];
    totalAmount: number;
    status: 'draft' | 'sent' | 'paid' | 'overdue';
    dueDate: Date;
    issueDate: Date;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const InvoiceSchema: Schema = new Schema(
    {
        invoiceNumber: { type: String, required: true, unique: true },
        client: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
        project: { type: Schema.Types.ObjectId, ref: 'Project' },
        items: [{
            description: { type: String, required: true },
            quantity: { type: Number, required: true },
            unitPrice: { type: Number, required: true },
            total: { type: Number, required: true }
        }],
        totalAmount: { type: Number, required: true },
        status: {
            type: String,
            enum: ['draft', 'sent', 'paid', 'overdue'],
            default: 'draft',
        },
        dueDate: { type: Date, required: true },
        issueDate: { type: Date, default: Date.now },
        createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    },
    { timestamps: true }
);

const Invoice: Model<IInvoice> =
    mongoose.models.Invoice || mongoose.model<IInvoice>('Invoice', InvoiceSchema);

export default Invoice;
