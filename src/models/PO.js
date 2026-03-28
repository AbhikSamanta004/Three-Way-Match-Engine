const mongoose = require('mongoose');

const PO = mongoose.model('PO', new mongoose.Schema({
    poNumber: { type: String, required: true, unique: true },
    poDate: { type: Date, required: true },
    vendorName: { type: String, required: true },

    items: [{
        itemCode: { type: String, required: true },
        description: String,
        quantity: { type: Number, required: true }
    }],
    isDuplicate: { type: Boolean, default: false }
}, { timestamps: true }));


module.exports = PO;