// Client-side CSV/Excel bank statement parser
export type ParsedTxn = {
    date: string; desc: string; credit: number; debit: number; balance: number; category: string;
};

const CATEGORY_RULES: [RegExp, string][] = [
    [/salary|payroll/i, 'Salary'],
    [/rent/i, 'Rent'],
    [/gst|cgst|sgst|igst/i, 'GST Payment'],
    [/tds|income.?tax|advance.?tax/i, 'Tax Payment'],
    [/emi|loan/i, 'Loan EMI'],
    [/electricity|power|bescom|msedcl/i, 'Electricity'],
    [/water|bwssb/i, 'Water'],
    [/telephone|mobile|jio|airtel|vodafone|bsnl/i, 'Telecom'],
    [/insurance|lic|policy/i, 'Insurance'],
    [/mutual.?fund|sip|elss|ppf|nps/i, 'Investment'],
    [/amazon|flipkart|swiggy|zomato/i, 'E-Commerce'],
    [/petrol|fuel|diesel|hp|iocl|bpcl/i, 'Fuel'],
    [/interest/i, 'Interest'],
    [/dividend/i, 'Dividend'],
    [/bank.?charge|sms.?charge|annual.?fee/i, 'Bank Charges'],
    [/neft|rtgs|imps|upi/i, 'Transfer'],
    [/cheque|chq/i, 'Cheque'],
    [/cash|atm|cdm/i, 'Cash'],
];

function categorize(desc: string): string {
    for (const [re, cat] of CATEGORY_RULES) {
        if (re.test(desc)) return cat;
    }
    return 'Other';
}

function parseNumber(s: string): number {
    if (!s) return 0;
    const cleaned = s.replace(/[₹,\s"]/g, '').replace(/\(([^)]+)\)/, '-$1');
    const n = parseFloat(cleaned);
    return isNaN(n) ? 0 : Math.abs(n);
}

function parseDate(s: string): string {
    if (!s) return '';
    const cleaned = s.replace(/['"]/g, '').trim();
    // Try DD/MM/YYYY, DD-MM-YYYY
    const dmy = cleaned.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})$/);
    if (dmy) {
        const y = dmy[3].length === 2 ? '20' + dmy[3] : dmy[3];
        return `${y}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')}`;
    }
    // Try YYYY-MM-DD
    const ymd = cleaned.match(/^(\d{4})[/\-.](\d{1,2})[/\-.](\d{1,2})$/);
    if (ymd) return `${ymd[1]}-${ymd[2].padStart(2, '0')}-${ymd[3].padStart(2, '0')}`;
    // Try natural date
    try { const d = new Date(cleaned); if (!isNaN(d.getTime())) return d.toISOString().split('T')[0]; } catch {}
    return cleaned;
}

export function parseCSV(text: string): ParsedTxn[] {
    const lines = text.split(/\r?\n/).filter(l => l.trim());
    if (lines.length < 2) return [];

    // Split first line to detect separator
    const sep = lines[0].includes('\t') ? '\t' : ',';
    const splitLine = (line: string) => {
        const parts: string[] = [];
        let cur = '', inQuote = false;
        for (const ch of line) {
            if (ch === '"') { inQuote = !inQuote; continue; }
            if (ch === sep && !inQuote) { parts.push(cur.trim()); cur = ''; continue; }
            cur += ch;
        }
        parts.push(cur.trim());
        return parts;
    };

    const headers = splitLine(lines[0]).map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));

    // Auto-detect column mapping
    const dateIdx = headers.findIndex(h => /date|txndate|valuedate|transactiondate/.test(h));
    const descIdx = headers.findIndex(h => /desc|narration|particular|remark|detail|reference/.test(h));
    const creditIdx = headers.findIndex(h => /credit|deposit|cr/.test(h));
    const debitIdx = headers.findIndex(h => /debit|withdrawal|dr/.test(h));
    const balIdx = headers.findIndex(h => /balance|closingbalance|runningbalance/.test(h));
    const amtIdx = headers.findIndex(h => /amount|amt/.test(h));

    const txns: ParsedTxn[] = [];
    for (let i = 1; i < lines.length; i++) {
        const cols = splitLine(lines[i]);
        if (cols.length < 3) continue;

        const date = parseDate(cols[dateIdx] || cols[0] || '');
        const desc = cols[descIdx >= 0 ? descIdx : 1] || '';
        if (!date && !desc) continue;

        let credit = 0, debit = 0;
        if (creditIdx >= 0 && debitIdx >= 0) {
            credit = parseNumber(cols[creditIdx]);
            debit = parseNumber(cols[debitIdx]);
        } else if (amtIdx >= 0) {
            const amt = parseNumber(cols[amtIdx]);
            const raw = cols[amtIdx] || '';
            if (raw.includes('-') || raw.includes('(')) debit = amt; else credit = amt;
        } else {
            // Fallback: try columns 2 and 3
            credit = parseNumber(cols[2] || '');
            debit = parseNumber(cols[3] || '');
        }

        const balance = balIdx >= 0 ? parseNumber(cols[balIdx]) : 0;
        txns.push({ date, desc, credit, debit, balance, category: categorize(desc) });
    }
    return txns;
}

export function generateTallyXML(txns: ParsedTxn[], bankName: string): string {
    const vouchers = txns.map((t, i) => {
        const isReceipt = t.credit > 0;
        const amt = isReceipt ? t.credit : t.debit;
        return `  <VOUCHER VCHTYPE="${isReceipt ? 'Receipt' : 'Payment'}" ACTION="Create">
    <DATE>${t.date.replace(/-/g, '')}</DATE>
    <NARRATION>${t.desc}</NARRATION>
    <VOUCHERNUMBER>${i + 1}</VOUCHERNUMBER>
    <ALLLEDGERENTRIES.LIST>
      <LEDGERNAME>${bankName || 'Bank Account'}</LEDGERNAME>
      <ISDEEMEDPOSITIVE>${isReceipt ? 'Yes' : 'No'}</ISDEEMEDPOSITIVE>
      <AMOUNT>${isReceipt ? -amt : amt}</AMOUNT>
    </ALLLEDGERENTRIES.LIST>
    <ALLLEDGERENTRIES.LIST>
      <LEDGERNAME>${t.category}</LEDGERNAME>
      <ISDEEMEDPOSITIVE>${isReceipt ? 'No' : 'Yes'}</ISDEEMEDPOSITIVE>
      <AMOUNT>${isReceipt ? amt : -amt}</AMOUNT>
    </ALLLEDGERENTRIES.LIST>
  </VOUCHER>`;
    }).join('\n');
    return `<?xml version="1.0" encoding="UTF-8"?>
<ENVELOPE>
<HEADER><TALLYREQUEST>Import Data</TALLYREQUEST></HEADER>
<BODY><IMPORTDATA><REQUESTDESC><REPORTNAME>Vouchers</REPORTNAME></REQUESTDESC>
<REQUESTDATA><TALLYMESSAGE xmlns:UDF="TallyUDF">
${vouchers}
</TALLYMESSAGE></REQUESTDATA></IMPORTDATA></BODY>
</ENVELOPE>`;
}
