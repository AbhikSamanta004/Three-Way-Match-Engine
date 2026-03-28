const PO = require('../models/PO');
const GRN = require('../models/GRN');
const Invoice = require('../models/Invoice');
const MatchStatus = require('../models/MatchStatus');

const performMatching = async (poNumber) => {
    const po = await PO.findOne({ poNumber });
    const grns = await GRN.find({ poNumber });
    const invoices = await Invoice.find({ poNumber });

    if (!po) {
        const result = { status: 'insufficient_documents', reasons: ['po_not_found'] };
        await MatchStatus.findOneAndUpdate({ poNumber }, result, { upsert: true });
        return result;
    }

    let status = 'matched';
    const reasons = [];
    const itemMap = {};

    if (po.isDuplicate) reasons.push('duplicate_po');
    // create map for po items
    po.items.forEach(i => {
        itemMap[i.itemCode] = { po: i.quantity, grn: 0, inv: 0 };
    });

    // verify grn items with map
    grns.forEach(g => {
        g.items.forEach(i => {
            if (itemMap[i.itemCode]) itemMap[i.itemCode].grn += i.receivedQuantity;
            else reasons.push('item_missing_in_po');
        });
    });

    // verify invoice date and itemswith map
    invoices.forEach(inv => {
        if (new Date(inv.invoiceDate) > new Date(po.poDate)) {
            reasons.push('invoice_date_after_po_date');
        } 
        inv.items.forEach(i => { 
            if (itemMap[i.itemCode]) itemMap[i.itemCode].inv += i.quantity;
            else reasons.push('item_missing_in_po');
        });
    });

    for (const code in itemMap) {
        const { po, grn, inv } = itemMap[code];

        if (grn > po) reasons.push('grn_qty_exceeds_po_qty');
        if (inv > grn) reasons.push('invoice_qty_exceeds_grn_qty');
        if (inv > po) reasons.push('invoice_qty_exceeds_po_qty');
        // assum that if grn!=po or inv!=po then it is partially matched
        if (status === 'matched' && (grn < po || inv < po)) {
            status = 'partially_matched';
        }
    }
    // if any reason is present then it is mismatch
    if (reasons.length > 0) status = 'mismatch';
    // check if grn and invoice are present
    if (grns.length === 0 || invoices.length === 0) {
        if (status === 'matched' || status === 'partially_matched') {
            status = 'insufficient_documents';
        }
    }
    // WE ONLY PUSH IN ARRAY UNIQUE REASONS
    const finalResult = { poNumber, status, reasons: [...new Set(reasons)] };
    await MatchStatus.findOneAndUpdate({ poNumber }, finalResult, { upsert: true });

    return finalResult;
};

module.exports = { performMatching };
