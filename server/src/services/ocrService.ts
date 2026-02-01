import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

// Only initialize OpenAI if API key is available
const openai = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_key_here'
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null;

export const parseInvoice = async (imageUrl: string) => {
    if (!openai) {
        console.warn('OpenAI API Key missing. Returning mock data.');
        return mockInvoiceData();
    }

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4-vision-preview", // or gpt-4o
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: "Extract the following details from this invoice image in JSON format: vendor, invoiceNumber, date, items (name, quantity, price, gstRate, amount), totalAmount, totalGst. Return ONLY JSON." },
                        {
                            type: "image_url",
                            image_url: {
                                "url": imageUrl,
                            },
                        },
                    ],
                },
            ],
            max_tokens: 1000,
        });

        const content = response.choices[0].message.content;
        // Basic cleaning of markdown code blocks if present
        const jsonStr = content?.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr || '{}');
    } catch (error) {
        console.error('OCR Error:', error);
        return mockInvoiceData();
    }
};

const mockInvoiceData = () => ({
    vendor: "Demo Vendor",
    invoiceNumber: "INV-000",
    date: new Date().toISOString(),
    items: [{ name: "Material Match", quantity: 1, price: 1000, amount: 1000 }],
    totalAmount: 1000,
    totalGst: 180
});
