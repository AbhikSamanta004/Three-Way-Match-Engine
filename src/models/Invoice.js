const mongoose = require('mongoose');

const Invoice = mongoose.model('Invoice', new mongoose.Schema({
    invoiceNumber: { type: String, required: true },
    poNumber: { type: String, required: true },
    invoiceDate: { type: Date, required: true },

    items: [{
        itemCode: { type: String, required: true },
        description: String,
        quantity: { type: Number, required: true }
    }]
}, { timestamps: true }));

module.exports = Invoice;