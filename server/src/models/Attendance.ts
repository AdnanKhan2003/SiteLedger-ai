import mongoose, { Document, Schema } from 'mongoose';

export interface IAttendance extends Document {
    worker: mongoose.Types.ObjectId;
    date: Date; // Normalized to midnight or string YYYY-MM-DD
    timeIn?: Date;
    timeOut?: Date;
    status: 'present' | 'absent' | 'half-day' | 'leave';
    notes?: string;
}

const AttendanceSchema: Schema = new Schema(
    {
        worker: { type: Schema.Types.ObjectId, ref: 'Worker', required: true },
        date: { type: Date, required: true },
        timeIn: { type: Date },
        timeOut: { type: Date },
        status: {
            type: String,
            enum: ['present', 'absent', 'half-day', 'leave'],
            default: 'present'
        },
        notes: { type: String },
    },
    { timestamps: true }
);

// Prevent duplicate attendance for same worker on same day
AttendanceSchema.index({ worker: 1, date: 1 }, { unique: true });

export default mongoose.model<IAttendance>('Attendance', AttendanceSchema);
