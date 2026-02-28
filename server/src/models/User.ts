import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    name: string;
    email: string;
    passwordHash: string;
    role: 'admin' | 'worker';

    
    phone?: string;
    workerRole?: string;      
    specialty?: string;
    dailyRate?: number;
    photoUrl?: string;
    status?: 'active' | 'inactive';

    createdAt: Date;
}

const UserSchema: Schema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['admin', 'worker'], default: 'worker' },

    
    phone: { type: String },
    workerRole: { type: String },
    specialty: { type: String },
    dailyRate: { type: Number },
    photoUrl: { type: String },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },

    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IUser>('User', UserSchema);
