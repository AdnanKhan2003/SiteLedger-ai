import mongoose, { Document, Schema } from 'mongoose';

export interface IWorker extends Document {
    name: string;
    phone: string;
    role: string;
    dailyRate: number;
    photoUrl?: string; // Cloudinary URL
    status: 'active' | 'inactive';
    createdAt: Date;
}

const WorkerSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        role: { type: String, required: true }, // e.g., Mason, Helper
        dailyRate: { type: Number, required: true },
        photoUrl: { type: String },
        status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    },
    { timestamps: true }
);

export default mongoose.model<IWorker>('Worker', WorkerSchema);
