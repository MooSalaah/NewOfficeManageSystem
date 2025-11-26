import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITransaction extends Document {
    type: 'income' | 'expense';
    amount: number;
    category: string;
    description?: string;
    date: Date;
    project?: mongoose.Types.ObjectId;
    client?: mongoose.Types.ObjectId;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const TransactionSchema: Schema = new Schema(
    {
        type: { type: String, enum: ['income', 'expense'], required: true },
        amount: { type: Number, required: true },
        category: { type: String, required: true }, // e.g., 'Rent', 'Salary', 'Project Payment'
        description: { type: String },
        date: { type: Date, default: Date.now },
        project: { type: Schema.Types.ObjectId, ref: 'Project' },
        client: { type: Schema.Types.ObjectId, ref: 'Client' },
        createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    },
    { timestamps: true }
);

const Transaction: Model<ITransaction> =
    mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);

export default Transaction;
