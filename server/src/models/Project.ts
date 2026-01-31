import mongoose, { Document, Schema } from 'mongoose';

export interface IProject extends Document {
    name: string;
    client: string;
    location: string;
    budget: number;
    startDate: Date;
    endDate?: Date;
    status: 'active' | 'completed' | 'on-hold';
    description?: string;
}

const ProjectSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        client: { type: String, required: true },
        location: { type: String, required: true },
        budget: { type: Number, required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date },
        status: {
            type: String,
            enum: ['active', 'completed', 'on-hold'],
            default: 'active'
        },
        description: { type: String },
    },
    { timestamps: true }
);

export default mongoose.model<IProject>('Project', ProjectSchema);
