import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
    name: string;
    email: string;
    password?: string;
    role: 'admin' | 'engineer' | 'accountant' | 'hr' | 'employee';
    avatar?: string;
    permissions?: string[];
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, select: false }, // Don't return password by default
        role: {
            type: String,
            enum: ['admin', 'manager', 'engineer', 'accountant', 'hr', 'employee', 'drafter'],
            default: 'employee',
        },
        avatar: { type: String },
        permissions: [{ type: String }],
    },
    { timestamps: true }
);

// Prevent recompilation of model in development
const User: Model<IUser> =
    mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
