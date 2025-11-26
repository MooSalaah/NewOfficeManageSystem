import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProject extends Document {
    title: string;
    client: mongoose.Types.ObjectId;
    status: 'new' | 'in_progress' | 'completed' | 'on_hold';
    budget: number;
    startDate: Date;
    endDate: Date;
    team: mongoose.Types.ObjectId[];
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}

const ProjectSchema: Schema = new Schema(
    {
        title: { type: String, required: true },
        client: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
        status: {
            type: String,
            enum: ['new', 'in_progress', 'completed', 'on_hold'],
            default: 'new',
        },
        budget: { type: Number, required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        team: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        description: { type: String },
    },
    { timestamps: true }
);

const Project: Model<IProject> =
    mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);

export default Project;
