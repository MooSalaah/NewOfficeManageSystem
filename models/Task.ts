import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITask extends Document {
    title: string;
    project: mongoose.Types.ObjectId;
    assignee?: mongoose.Types.ObjectId;
    status: 'todo' | 'in_progress' | 'review' | 'done';
    priority: 'low' | 'medium' | 'high';
    dueDate?: Date;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}

const TaskSchema: Schema = new Schema(
    {
        title: { type: String, required: true },
        project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
        assignee: { type: Schema.Types.ObjectId, ref: 'User' },
        status: {
            type: String,
            enum: ['todo', 'in_progress', 'review', 'done'],
            default: 'todo',
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high'],
            default: 'medium',
        },
        dueDate: { type: Date },
        description: { type: String },
    },
    { timestamps: true }
);

const Task: Model<ITask> =
    mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);

export default Task;
