import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAttendance extends Document {
    user: mongoose.Types.ObjectId;
    date: Date; // Normalized to start of day for easy querying
    checkIn: Date;
    checkOut?: Date;
    status: 'present' | 'absent' | 'late' | 'excused';
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const AttendanceSchema: Schema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        date: { type: Date, required: true },
        checkIn: { type: Date, required: true },
        checkOut: { type: Date },
        status: {
            type: String,
            enum: ['present', 'absent', 'late', 'excused'],
            default: 'present',
        },
        notes: { type: String },
    },
    { timestamps: true }
);

// Compound index to ensure one record per user per day
AttendanceSchema.index({ user: 1, date: 1 }, { unique: true });

export const Attendance: Model<IAttendance> = mongoose.models.Attendance || mongoose.model<IAttendance>('Attendance', AttendanceSchema);
