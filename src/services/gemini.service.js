const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const dotenv = require("dotenv");

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const parseDocument = async (filePath, type) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const parts = [{
            inlineData: {
                data: Buffer.from(fs.readFileSync(filePath)).toString("base64"),
                mimeType: "application/pdf"
            },
        }];

        const prompts = {
            po: `Parse this Purchase Order. Give me the poNumber, poDate (in YYYY-MM-DD format), vendorName, and a list of items (itemCode, description, quantity). Return JSON only.`,
            grn: `Parse this GRN. Give me the grnNumber, poNumber, grnDate (in YYYY-MM-DD format), and a list of items (itemCode, description, receivedQuantity). Return JSON only.`,
            invoice: `Parse this Invoice. Give me the invoiceNumber, poNumber, invoiceDate (in YYYY-MM-DD format), and a list of items (itemCode, description, quantity). Return JSON only.`
        };


        const result = await model.generateContent([prompts[type], ...parts]);
        const text = result.response.text();
        
        const json = text.replace(/```json\n?|\n?```/g, "").trim();
        return JSON.parse(json);
    } catch (err) {
        console.error("Gemini parse failed:", err.message);
        throw err;
    }
};

module.exports = { parseDocument };
