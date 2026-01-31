import mongoose, { Document, Schema } from 'mongoose';

export interface IExpense extends Document {
    vendor: string;
    items: Array<{
        name: string;
        quantity: number;
        price: number;
        gstRate?: number;
        amount: number;
    }>;
    category: 'materials' | 'labor' | 'equipment' | 'miscellaneous';
    subCategory?: string; // e.g., cement, steel
    totalAmount: number;
    totalGst: number;
    invoiceNumber?: string;
    invoiceDate: Date;
    invoiceUrl: string;
    status: 'pending' | 'paid';
    paymentDate?: Date;
    notes?: string;
    project?: mongoose.Types.ObjectId; // Link to project
}

const ExpenseSchema: Schema = new Schema(
    {
        vendor: { type: String, required: true },
        items: [
            {
                name: String,
                quantity: Number,
                price: Number,
                gstRate: Number,
                amount: Number,
            }
        ],
        category: {
            type: String,
            enum: ['materials', 'labor', 'equipment', 'miscellaneous'],
            required: true
        },
        subCategory: { type: String },
        totalAmount: { type: Number, required: true },
        totalGst: { type: Number, default: 0 },
        invoiceNumber: { type: String },
        invoiceDate: { type: Date, default: Date.now },
        invoiceUrl: { type: String },
        status: { type: String, enum: ['pending', 'paid'], default: 'pending' },
        paymentDate: { type: Date },
        notes: { type: String },
        project: { type: Schema.Types.ObjectId, ref: 'Project' },
    },
    { timestamps: true }
);

export default mongoose.model<IExpense>('Expense', ExpenseSchema);
