const mongoose = require('mongoose');
//only one per po no.
const matchStatusSchema = new mongoose.Schema({
    poNumber: { type: String, required: true, unique: true },
    status: { 
        type: String, 
        enum: ['matched','partially_matched','mismatch','insufficient_documents'], 
        default: 'insufficient_documents',
    },
    reasons: [String],
    lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('MatchStatus', matchStatusSchema);
 