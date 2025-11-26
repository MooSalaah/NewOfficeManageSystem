import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IClient extends Document {
    name: string;
    email?: string;
    phone: string;
    companyName?: string;
    address?: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const ClientSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String },
        phone: { type: String, required: true },
        companyName: { type: String },
        address: { type: String },
        notes: { type: String },
    },
    { timestamps: true }
);

const Client: Model<IClient> =
    mongoose.models.Client || mongoose.model<IClient>('Client', ClientSchema);

export default Client;
