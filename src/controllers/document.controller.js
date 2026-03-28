const fs = require('fs');
const PO = require('../models/PO');
const GRN = require('../models/GRN');
const Invoice = require('../models/Invoice');
const MatchStatus = require('../models/MatchStatus');
const { parseDocument } = require('../services/gemini.service');
const { performMatching } = require('../services/matching.service');

const uploadDocument = async (req, res) => {
    try {
        const { documentType } = req.body;
        const file = req.file;
        if (!file) return res.status(400).json({ error: 'Missing file' });
        //for validate filetype name
        if (!['po', 'grn', 'invoice'].includes(documentType)) {
            return res.status(400).json({ error: 'Invalid document type' });
        }
        //parse document using gemini
        const data = await parseDocument(file.path, documentType);
        let poNumber = data.poNumber;
        let saved;
        //store in db
        if (documentType === 'po'){
            const existing = await PO.findOne({ poNumber: data.poNumber });
            if (existing) {
                data.isDuplicate = true;
            }
            saved = await PO.findOneAndUpdate(
                { poNumber: data.poNumber },
                data,
                { upsert: true, new: true }
            );
        }
        else if (documentType === 'grn'){
            saved = await GRN.create(data);
        }
        else if (documentType === 'invoice'){
            saved = await Invoice.create(data);
        }


        const match = await performMatching(poNumber);

        res.status(201).json({
            message: 'Upload successful',
            doc: saved,
            match
        });
    } catch (err) {
        console.error('Upload Error:', err.message);
        res.status(500).json({ error: err.message });
    }
};

const getDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const { type } = req.query;

        let doc;
        if (type === 'po') doc = await PO.findById(id);
        else if (type === 'grn') doc = await GRN.findById(id);
        else if (type === 'invoice') doc = await Invoice.findById(id);
        else return res.status(400).json({ error: 'Type is required (po, grn, or invoice)' });

        if (!doc) return res.status(404).json({ error: 'Not found' });
        res.json(doc);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getMatchResult = async (req, res) => {
    try {
        const { poNumber } = req.params;
        //for latest matching
         let result = await MatchStatus.findOne({ poNumber });
        if (!result) {
            result = await performMatching(poNumber);
        }

        const grns = await GRN.find({ poNumber });
        const invoices = await Invoice.find({ poNumber });
        const po = await PO.findOne({ poNumber });

        res.json({
            poNumber,
            status: result.status,
            reasons: result.reasons,
            docs: {
                po: po ? po._id : null,
                grns: grns.map(g => g._id),
                invoices: invoices.map(i => i._id)
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    uploadDocument,
    getDocument,
    getMatchResult
};
