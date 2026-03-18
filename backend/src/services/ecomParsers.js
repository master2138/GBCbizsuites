const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// ─────────────────────────────────────────────────────────
// E-Commerce Marketplace Parsers
// Supports: Amazon, Flipkart, Meesho, Myntra
// ─────────────────────────────────────────────────────────

const GST_RATES = [0, 3, 5, 12, 18, 28]; // Common GST rates in India

// ── HSN Code Lookup (Common E-Commerce Items) ───────────
const HSN_MAP = {
    'clothing': { hsn: '6109', rate: 5, desc: 'T-shirts, Tops' },
    'fashion': { hsn: '6109', rate: 5, desc: 'Fashion Apparel' },
    'shirt': { hsn: '6105', rate: 5, desc: 'Shirts' },
    'jeans': { hsn: '6204', rate: 12, desc: 'Trousers/Jeans' },
    'saree': { hsn: '5208', rate: 5, desc: 'Sarees' },
    'kurta': { hsn: '6211', rate: 5, desc: 'Kurta/Ethnic Wear' },
    'shoe': { hsn: '6403', rate: 18, desc: 'Footwear' },
    'footwear': { hsn: '6403', rate: 18, desc: 'Footwear' },
    'sandal': { hsn: '6402', rate: 18, desc: 'Sandals' },
    'electronics': { hsn: '8471', rate: 18, desc: 'Electronics' },
    'mobile': { hsn: '8517', rate: 18, desc: 'Mobile Phones' },
    'phone': { hsn: '8517', rate: 18, desc: 'Mobile Phones' },
    'laptop': { hsn: '8471', rate: 18, desc: 'Laptops' },
    'charger': { hsn: '8504', rate: 18, desc: 'Chargers/Adapters' },
    'headphone': { hsn: '8518', rate: 18, desc: 'Headphones/Earphones' },
    'earphone': { hsn: '8518', rate: 18, desc: 'Headphones/Earphones' },
    'watch': { hsn: '9102', rate: 18, desc: 'Watches' },
    'bag': { hsn: '4202', rate: 18, desc: 'Bags/Luggage' },
    'cosmetic': { hsn: '3304', rate: 28, desc: 'Cosmetics' },
    'beauty': { hsn: '3304', rate: 18, desc: 'Beauty Products' },
    'food': { hsn: '2106', rate: 18, desc: 'Food Products' },
    'grocery': { hsn: '0901', rate: 5, desc: 'Grocery' },
    'book': { hsn: '4901', rate: 0, desc: 'Books' },
    'stationery': { hsn: '4820', rate: 18, desc: 'Stationery' },
    'toy': { hsn: '9503', rate: 12, desc: 'Toys' },
    'jewellery': { hsn: '7113', rate: 3, desc: 'Jewellery' },
    'furniture': { hsn: '9403', rate: 18, desc: 'Furniture' },
    'kitchenware': { hsn: '7323', rate: 18, desc: 'Kitchenware' },
    'home': { hsn: '9405', rate: 18, desc: 'Home & Living' },
    'default': { hsn: '9999', rate: 18, desc: 'Other Goods' },
};

function guessHSN(productName) {
    if (!productName) return HSN_MAP.default;
    const lower = productName.toLowerCase();
    for (const [keyword, info] of Object.entries(HSN_MAP)) {
        if (keyword !== 'default' && lower.includes(keyword)) return info;
    }
    return HSN_MAP.default;
}

// ── Utility: Parse amount safely ─────────────────────────
function parseAmt(val) {
    if (val == null || val === '') return 0;
    if (typeof val === 'number') return val;
    return parseFloat(String(val).replace(/[₹,\s]/g, '')) || 0;
}

// ── Detect platform from file contents ──────────────────
function detectPlatform(headers) {
    const h = headers.map(h => String(h).toLowerCase().trim());
    const joined = h.join('|');
    if (joined.includes('asin') || joined.includes('amazon') || joined.includes('marketplace')) return 'AMAZON';
    if (joined.includes('flipkart') || joined.includes('sub_category') || joined.includes('seller sku')) return 'FLIPKART';
    if (joined.includes('meesho') || joined.includes('sub order') || joined.includes('supplier sku')) return 'MEESHO';
    if (joined.includes('myntra') || joined.includes('article type') || joined.includes('style_id')) return 'MYNTRA';
    return 'UNKNOWN';
}

// ─────────────────────────────────────────────────────────
// AMAZON Parser
// Fields: order-id, sku, asin, quantity, item-price, 
// shipping-credits, amazon-fees, tax-amount
// ─────────────────────────────────────────────────────────
function parseAmazon(rows, headers) {
    const transactions = [];
    const colMap = {};
    headers.forEach((h, i) => {
        const key = String(h).toLowerCase().replace(/[\s-]+/g, '_');
        colMap[key] = i;
    });

    // Find relevant columns by fuzzy matching
    const findCol = (...names) => {
        for (const name of names) {
            for (const [key, idx] of Object.entries(colMap)) {
                if (key.includes(name)) return idx;
            }
        }
        return -1;
    };

    const orderIdCol = findCol('order_id', 'order');
    const skuCol = findCol('sku', 'merchant_sku');
    const asinCol = findCol('asin');
    const qtyCol = findCol('quantity', 'qty');
    const dateCol = findCol('date', 'posted_date', 'settlement_date', 'purchase_date');
    const productCol = findCol('product_name', 'product', 'title', 'item', 'description');
    const priceCol = findCol('item_price', 'total', 'principal', 'product_charges');
    const feeCol = findCol('total_fee', 'amazon_fee', 'commission', 'marketplace_fee', 'other_fee');
    const shippingCol = findCol('shipping', 'delivery_charge');
    const taxCol = findCol('tax', 'gst', 'cgst');
    const igstCol = findCol('igst');
    const cgstCol = findCol('cgst');
    const sgstCol = findCol('sgst');
    const tcsCol = findCol('tcs');

    for (const row of rows) {
        const vals = Array.isArray(row) ? row : Object.values(row);
        const orderId = orderIdCol >= 0 ? String(vals[orderIdCol] || '') : '';
        if (!orderId || orderId.toLowerCase().includes('total')) continue;

        const productName = productCol >= 0 ? String(vals[productCol] || '') : '';
        const hsnInfo = guessHSN(productName);
        const itemPrice = priceCol >= 0 ? parseAmt(vals[priceCol]) : 0;
        const quantity = qtyCol >= 0 ? parseInt(vals[qtyCol]) || 1 : 1;
        const fees = feeCol >= 0 ? Math.abs(parseAmt(vals[feeCol])) : 0;
        const shipping = shippingCol >= 0 ? parseAmt(vals[shippingCol]) : 0;

        let cgst = cgstCol >= 0 ? parseAmt(vals[cgstCol]) : 0;
        let sgst = sgstCol >= 0 ? parseAmt(vals[sgstCol]) : 0;
        let igst = igstCol >= 0 ? parseAmt(vals[igstCol]) : 0;
        const tcs = tcsCol >= 0 ? parseAmt(vals[tcsCol]) : 0;
        const totalTax = taxCol >= 0 ? parseAmt(vals[taxCol]) : (cgst + sgst + igst);

        // If no GST breakdown, compute from rate
        if (cgst === 0 && sgst === 0 && igst === 0 && itemPrice > 0) {
            const rate = hsnInfo.rate / 100;
            const taxableValue = itemPrice / (1 + rate);
            // Assume intra-state (CGST + SGST) by default
            cgst = Math.round((taxableValue * rate / 2) * 100) / 100;
            sgst = cgst;
        }

        const taxableValue = itemPrice > 0 ? Math.round((itemPrice - cgst - sgst - igst) * 100) / 100 : 0;

        let dateStr = '';
        if (dateCol >= 0 && vals[dateCol]) {
            dateStr = parseDate(vals[dateCol]);
        }

        transactions.push({
            platform: 'Amazon',
            orderId,
            date: dateStr,
            sku: skuCol >= 0 ? String(vals[skuCol] || '') : '',
            asin: asinCol >= 0 ? String(vals[asinCol] || '') : '',
            product: productName,
            hsn: hsnInfo.hsn,
            gstRate: hsnInfo.rate,
            quantity,
            itemPrice,
            taxableValue,
            cgst,
            sgst,
            igst,
            totalTax: cgst + sgst + igst,
            platformFees: fees,
            shipping,
            tcs,
            netAmount: itemPrice - fees + shipping - tcs,
            type: itemPrice >= 0 ? 'SALE' : 'RETURN',
        });
    }
    return transactions;
}

// ─────────────────────────────────────────────────────────
// FLIPKART Parser
// ─────────────────────────────────────────────────────────
function parseFlipkart(rows, headers) {
    const transactions = [];
    const colMap = {};
    headers.forEach((h, i) => {
        const key = String(h).toLowerCase().replace(/[\s-]+/g, '_');
        colMap[key] = i;
    });

    const findCol = (...names) => {
        for (const name of names) {
            for (const [key, idx] of Object.entries(colMap)) {
                if (key.includes(name)) return idx;
            }
        }
        return -1;
    };

    const orderIdCol = findCol('order_id', 'order_item_id');
    const dateCol = findCol('order_date', 'date', 'created');
    const productCol = findCol('product_title', 'product', 'sku_name', 'title');
    const skuCol = findCol('seller_sku', 'sku', 'fsn');
    const qtyCol = findCol('quantity', 'qty');
    const priceCol = findCol('selling_price', 'total_amount', 'order_amount', 'final_amount');
    const feeCol = findCol('commission', 'marketplace_fee', 'total_fee', 'platform_fee');
    const shippingFeeCol = findCol('shipping_fee', 'logistics_fee');
    const taxCol = findCol('tax', 'total_tax');
    const tcsCol = findCol('tcs');

    for (const row of rows) {
        const vals = Array.isArray(row) ? row : Object.values(row);
        const orderId = orderIdCol >= 0 ? String(vals[orderIdCol] || '') : '';
        if (!orderId) continue;

        const productName = productCol >= 0 ? String(vals[productCol] || '') : '';
        const hsnInfo = guessHSN(productName);
        const itemPrice = priceCol >= 0 ? parseAmt(vals[priceCol]) : 0;
        const quantity = qtyCol >= 0 ? parseInt(vals[qtyCol]) || 1 : 1;
        const fees = feeCol >= 0 ? Math.abs(parseAmt(vals[feeCol])) : 0;
        const shippingFee = shippingFeeCol >= 0 ? Math.abs(parseAmt(vals[shippingFeeCol])) : 0;
        const tcs = tcsCol >= 0 ? parseAmt(vals[tcsCol]) : 0;

        const rate = hsnInfo.rate / 100;
        const taxableValue = Math.round((itemPrice / (1 + rate)) * 100) / 100;
        const cgst = Math.round((taxableValue * rate / 2) * 100) / 100;
        const sgst = cgst;

        let dateStr = '';
        if (dateCol >= 0 && vals[dateCol]) {
            dateStr = parseDate(vals[dateCol]);
        }

        transactions.push({
            platform: 'Flipkart',
            orderId,
            date: dateStr,
            sku: skuCol >= 0 ? String(vals[skuCol] || '') : '',
            asin: '',
            product: productName,
            hsn: hsnInfo.hsn,
            gstRate: hsnInfo.rate,
            quantity,
            itemPrice,
            taxableValue,
            cgst,
            sgst,
            igst: 0,
            totalTax: cgst + sgst,
            platformFees: fees + shippingFee,
            shipping: 0,
            tcs,
            netAmount: itemPrice - fees - shippingFee - tcs,
            type: itemPrice >= 0 ? 'SALE' : 'RETURN',
        });
    }
    return transactions;
}

// ─────────────────────────────────────────────────────────
// MEESHO Parser
// ─────────────────────────────────────────────────────────
function parseMeesho(rows, headers) {
    const transactions = [];
    const colMap = {};
    headers.forEach((h, i) => {
        const key = String(h).toLowerCase().replace(/[\s-]+/g, '_');
        colMap[key] = i;
    });

    const findCol = (...names) => {
        for (const name of names) {
            for (const [key, idx] of Object.entries(colMap)) {
                if (key.includes(name)) return idx;
            }
        }
        return -1;
    };

    const orderIdCol = findCol('sub_order', 'order_id', 'order');
    const dateCol = findCol('order_date', 'date', 'created');
    const productCol = findCol('product_name', 'product', 'title', 'item');
    const skuCol = findCol('supplier_sku', 'sku');
    const qtyCol = findCol('quantity', 'qty');
    const priceCol = findCol('selling_price', 'order_value', 'total', 'final_amount');
    const feeCol = findCol('commission', 'meesho_commission', 'deduction');
    const paymentCol = findCol('payment_mode', 'cod', 'prepaid');
    const tcsCol = findCol('tcs');

    for (const row of rows) {
        const vals = Array.isArray(row) ? row : Object.values(row);
        const orderId = orderIdCol >= 0 ? String(vals[orderIdCol] || '') : '';
        if (!orderId) continue;

        const productName = productCol >= 0 ? String(vals[productCol] || '') : '';
        const hsnInfo = guessHSN(productName);
        const itemPrice = priceCol >= 0 ? parseAmt(vals[priceCol]) : 0;
        const quantity = qtyCol >= 0 ? parseInt(vals[qtyCol]) || 1 : 1;
        const fees = feeCol >= 0 ? Math.abs(parseAmt(vals[feeCol])) : 0;
        const tcs = tcsCol >= 0 ? parseAmt(vals[tcsCol]) : 0;
        const paymentMode = paymentCol >= 0 ? String(vals[paymentCol] || 'Prepaid') : 'Prepaid';

        const rate = hsnInfo.rate / 100;
        const taxableValue = Math.round((itemPrice / (1 + rate)) * 100) / 100;
        const cgst = Math.round((taxableValue * rate / 2) * 100) / 100;
        const sgst = cgst;

        let dateStr = '';
        if (dateCol >= 0 && vals[dateCol]) {
            dateStr = parseDate(vals[dateCol]);
        }

        transactions.push({
            platform: 'Meesho',
            orderId,
            date: dateStr,
            sku: skuCol >= 0 ? String(vals[skuCol] || '') : '',
            asin: '',
            product: productName,
            hsn: hsnInfo.hsn,
            gstRate: hsnInfo.rate,
            quantity,
            itemPrice,
            taxableValue,
            cgst,
            sgst,
            igst: 0,
            totalTax: cgst + sgst,
            platformFees: fees,
            shipping: 0,
            tcs,
            netAmount: itemPrice - fees - tcs,
            paymentMode,
            type: itemPrice >= 0 ? 'SALE' : 'RETURN',
        });
    }
    return transactions;
}

// ─────────────────────────────────────────────────────────
// GSTR-1 Summary Generator  
// ─────────────────────────────────────────────────────────
function generateGSTR1Summary(transactions) {
    // B2C (Small): Invoice value <= 2.5L per state
    // B2B: Invoice value > 2.5L (requires buyer GSTIN)
    // HSN Summary: Group by HSN code

    const b2c = [];          // B2C transactions
    const hsnSummary = {};   // HSN-wise summary
    const rateSummary = {};  // Rate-wise summary
    let totalTaxable = 0, totalCGST = 0, totalSGST = 0, totalIGST = 0, totalValue = 0;

    for (const txn of transactions) {
        if (txn.type === 'RETURN') continue;

        totalTaxable += txn.taxableValue;
        totalCGST += txn.cgst;
        totalSGST += txn.sgst;
        totalIGST += txn.igst;
        totalValue += txn.itemPrice;

        // B2C entry
        b2c.push({
            date: txn.date,
            invoiceNo: txn.orderId,
            taxableValue: txn.taxableValue,
            cgst: txn.cgst,
            sgst: txn.sgst,
            igst: txn.igst,
            total: txn.itemPrice,
        });

        // HSN summary
        const hsn = txn.hsn;
        if (!hsnSummary[hsn]) {
            hsnSummary[hsn] = { hsn, description: '', quantity: 0, taxableValue: 0, cgst: 0, sgst: 0, igst: 0, total: 0, rate: txn.gstRate };
        }
        hsnSummary[hsn].quantity += txn.quantity;
        hsnSummary[hsn].taxableValue += txn.taxableValue;
        hsnSummary[hsn].cgst += txn.cgst;
        hsnSummary[hsn].sgst += txn.sgst;
        hsnSummary[hsn].igst += txn.igst;
        hsnSummary[hsn].total += txn.itemPrice;

        // Rate summary
        const rate = txn.gstRate;
        if (!rateSummary[rate]) {
            rateSummary[rate] = { rate, count: 0, taxableValue: 0, cgst: 0, sgst: 0, igst: 0, total: 0 };
        }
        rateSummary[rate].count++;
        rateSummary[rate].taxableValue += txn.taxableValue;
        rateSummary[rate].cgst += txn.cgst;
        rateSummary[rate].sgst += txn.sgst;
        rateSummary[rate].igst += txn.igst;
        rateSummary[rate].total += txn.itemPrice;
    }

    // Round all values
    const round = obj => {
        for (const key of Object.keys(obj)) {
            if (typeof obj[key] === 'number') obj[key] = Math.round(obj[key] * 100) / 100;
        }
        return obj;
    };

    return {
        b2c: b2c.map(round),
        hsnSummary: Object.values(hsnSummary).map(round),
        rateSummary: Object.values(rateSummary).map(round).sort((a, b) => a.rate - b.rate),
        totals: round({
            totalTaxable,
            totalCGST,
            totalSGST,
            totalIGST,
            totalTax: totalCGST + totalSGST + totalIGST,
            totalValue,
            salesCount: transactions.filter(t => t.type === 'SALE').length,
            returnsCount: transactions.filter(t => t.type === 'RETURN').length,
        }),
    };
}

// ─────────────────────────────────────────────────────────
// Tally XML Generator for E-Commerce
// ─────────────────────────────────────────────────────────
function generateEcomTallyXML(transactions, firmName = 'E-Commerce Seller') {
    const vouchers = transactions.filter(t => t.type === 'SALE').map((txn, i) => {
        const voucherDate = txn.date.replace(/-/g, '');
        return `
    <VOUCHER REMOTEID="${txn.platform}-${txn.orderId}" VCHTYPE="Sales" ACTION="Create">
        <DATE>${voucherDate}</DATE>
        <VOUCHERTYPENAME>Sales</VOUCHERTYPENAME>
        <VOUCHERNUMBER>${txn.orderId}</VOUCHERNUMBER>
        <PARTYLEDGERNAME>${txn.platform} Marketplace</PARTYLEDGERNAME>
        <NARRATION>${txn.platform} Order ${txn.orderId} - ${txn.product}</NARRATION>
        <ALLLEDGERENTRIES.LIST>
            <LEDGERNAME>${txn.platform} Marketplace</LEDGERNAME>
            <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
            <AMOUNT>-${txn.itemPrice.toFixed(2)}</AMOUNT>
        </ALLLEDGERENTRIES.LIST>
        <ALLLEDGERENTRIES.LIST>
            <LEDGERNAME>Sales - ${txn.platform}</LEDGERNAME>
            <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
            <AMOUNT>${txn.taxableValue.toFixed(2)}</AMOUNT>
        </ALLLEDGERENTRIES.LIST>
        ${txn.cgst > 0 ? `<ALLLEDGERENTRIES.LIST>
            <LEDGERNAME>CGST Output</LEDGERNAME>
            <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
            <AMOUNT>${txn.cgst.toFixed(2)}</AMOUNT>
        </ALLLEDGERENTRIES.LIST>` : ''}
        ${txn.sgst > 0 ? `<ALLLEDGERENTRIES.LIST>
            <LEDGERNAME>SGST Output</LEDGERNAME>
            <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
            <AMOUNT>${txn.sgst.toFixed(2)}</AMOUNT>
        </ALLLEDGERENTRIES.LIST>` : ''}
        ${txn.igst > 0 ? `<ALLLEDGERENTRIES.LIST>
            <LEDGERNAME>IGST Output</LEDGERNAME>
            <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
            <AMOUNT>${txn.igst.toFixed(2)}</AMOUNT>
        </ALLLEDGERENTRIES.LIST>` : ''}
    </VOUCHER>`;
    });

    return `<?xml version="1.0" encoding="UTF-8"?>
<ENVELOPE>
    <HEADER>
        <TALLYREQUEST>Import Data</TALLYREQUEST>
    </HEADER>
    <BODY>
        <IMPORTDATA>
            <REQUESTDESC>
                <REPORTNAME>All Masters</REPORTNAME>
            </REQUESTDESC>
            <REQUESTDATA>
                <TALLYMESSAGE xmlns:UDF="TallyUDF">
${vouchers.join('\n')}
                </TALLYMESSAGE>
            </REQUESTDATA>
        </IMPORTDATA>
    </BODY>
</ENVELOPE>`;
}

// ── Date Parser Helper ───────────────────────────────────
function parseDate(val) {
    if (!val) return '';

    // Excel serial number
    if (typeof val === 'number') {
        const d = new Date((val - 25569) * 86400 * 1000);
        return d.toISOString().split('T')[0];
    }

    const str = String(val).trim();

    // Try common formats
    const formats = [
        /^(\d{4})-(\d{2})-(\d{2})/, // YYYY-MM-DD
        /^(\d{2})\/(\d{2})\/(\d{4})/, // DD/MM/YYYY
        /^(\d{2})-(\d{2})-(\d{4})/, // DD-MM-YYYY
    ];

    for (const fmt of formats) {
        const m = str.match(fmt);
        if (m) {
            if (fmt === formats[0]) return `${m[1]}-${m[2]}-${m[3]}`;
            return `${m[3]}-${m[2]}-${m[1]}`;
        }
    }

    // Fallback: try Date() constructor
    const d = new Date(str);
    if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
    return str;
}

// ─────────────────────────────────────────────────────────
// Main Parser Entry
// ─────────────────────────────────────────────────────────
function parseEcommerceFile(filePath, platformOverride = null) {
    const ext = path.extname(filePath).toLowerCase();
    let workbook, sheet, headers, rows;

    if (ext === '.csv' || ext === '.xlsx' || ext === '.xls') {
        workbook = XLSX.readFile(filePath);
        sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        if (data.length < 2) throw new Error('File has insufficient data rows.');

        // Find the header row (first row with >= 3 non-empty cells)
        let headerIdx = 0;
        for (let i = 0; i < Math.min(data.length, 10); i++) {
            const nonEmpty = (data[i] || []).filter(c => c != null && String(c).trim() !== '').length;
            if (nonEmpty >= 3) { headerIdx = i; break; }
        }

        headers = data[headerIdx];
        rows = data.slice(headerIdx + 1).filter(r => r.some(c => c != null && String(c).trim() !== ''));
    } else {
        throw new Error(`Unsupported file format: ${ext}. Please upload CSV or Excel files.`);
    }

    // Detect or use override
    const platform = platformOverride || detectPlatform(headers);

    let transactions;
    switch (platform.toUpperCase()) {
        case 'AMAZON':
            transactions = parseAmazon(rows, headers);
            break;
        case 'FLIPKART':
            transactions = parseFlipkart(rows, headers);
            break;
        case 'MEESHO':
            transactions = parseMeesho(rows, headers);
            break;
        case 'MYNTRA':
            transactions = parseFlipkart(rows, headers); // Similar format
            break;
        default:
            // Generic — try Amazon format first
            transactions = parseAmazon(rows, headers);
            if (transactions.length === 0) {
                transactions = parseFlipkart(rows, headers);
            }
    }

    if (transactions.length === 0) {
        throw new Error('No transactions found. Please check the file format and try specifying the platform manually.');
    }

    const gstr1 = generateGSTR1Summary(transactions);

    // Platform fees summary
    const totalFees = transactions.reduce((s, t) => s + t.platformFees, 0);
    const totalTCS = transactions.reduce((s, t) => s + t.tcs, 0);

    return {
        platform: platform || 'UNKNOWN',
        fileName: path.basename(filePath),
        parsedAt: new Date().toISOString(),
        summary: {
            totalTransactions: transactions.length,
            salesCount: transactions.filter(t => t.type === 'SALE').length,
            returnsCount: transactions.filter(t => t.type === 'RETURN').length,
            totalSales: Math.round(gstr1.totals.totalValue * 100) / 100,
            totalTaxable: Math.round(gstr1.totals.totalTaxable * 100) / 100,
            totalGST: Math.round(gstr1.totals.totalTax * 100) / 100,
            totalPlatformFees: Math.round(totalFees * 100) / 100,
            totalTCS: Math.round(totalTCS * 100) / 100,
            netReceivable: Math.round((gstr1.totals.totalValue - totalFees - totalTCS) * 100) / 100,
        },
        transactions,
        gstr1,
    };
}

module.exports = {
    parseEcommerceFile,
    generateGSTR1Summary,
    generateEcomTallyXML,
    detectPlatform,
    guessHSN,
    HSN_MAP,
};
