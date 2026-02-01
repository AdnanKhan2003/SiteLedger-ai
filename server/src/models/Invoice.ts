import mongoose, { Schema, Document } from 'mongoose';

export interface IInvoice extends Document {
    invoiceNumber: string;
    date: Date;
    dueDate?: Date;

    // Company Info (Sender)
    companyName: string;
    companyAddress: string;
    companyEmail: string;
    companyPhone: string;

    // Client Info (Receiver)
    clientName: string;
    clientAddress: string;
    clientEmail: string;

    items: Array<{
        description: string;
        quantity: number;
        rate: number;
        amount: number;
    }>;

    totalAmount: number;
    status: 'draft' | 'sent' | 'paid';
    notes?: string;
}

const InvoiceSchema: Schema = new Schema({
    invoiceNumber: { type: String, required: true },
    date: { type: Date, required: true },
    dueDate: { type: Date },

    companyName: { type: String, required: true },
    companyAddress: { type: String },
    companyEmail: { type: String },
    companyPhone: { type: String },

    clientName: { type: String, required: true },
    clientAddress: { type: String },
    clientEmail: { type: String },

    items: [{
        description: String,
        quantity: Number,
        rate: Number,
        amount: Number
    }],

    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ['draft', 'sent', 'paid'], default: 'draft' },
    notes: { type: String },
    project: { type: Schema.Types.ObjectId, ref: 'Project' }
}, { timestamps: true });

export default mongoose.model<IInvoice>('Invoice', InvoiceSchema);
