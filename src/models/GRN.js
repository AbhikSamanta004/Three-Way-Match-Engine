const mongoose = require('mongoose');

const GRN = mongoose.model('GRN', new mongoose.Schema({
    grnNumber: { type: String, required: true },
    poNumber: { type: String, required: true },
    grnDate: { type: Date, required: true },

    items: [{
        itemCode: { type: String, required: true },
        description: String,
        receivedQuantity: { type: Number, required: true }
    }]
}, { timestamps: true }));

module.exports = GRN;