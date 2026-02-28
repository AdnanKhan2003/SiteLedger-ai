import mongoose, { Document, Schema } from 'mongoose';

export interface IAttendance extends Document {
    worker: mongoose.Types.ObjectId;
    date: Date; 
    timeIn?: Date;
    timeOut?: Date;
    status: 'present' | 'absent' | 'half-day' | 'leave' | 'pending';
    notes?: string;
}

const AttendanceSchema: Schema = new Schema(
    {
        worker: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        date: { type: Date, required: true },
        timeIn: { type: Date },
        timeOut: { type: Date },
        status: {
            type: String,
            enum: ['present', 'absent', 'half-day', 'leave', 'pending'],
            default: 'present'
        },
        notes: { type: String },
    },
    { timestamps: true }
);


AttendanceSchema.index({ worker: 1, date: 1 }, { unique: true });

export default mongoose.model<IAttendance>('Attendance', AttendanceSchema);
