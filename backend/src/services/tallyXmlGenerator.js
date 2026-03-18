/**
 * Tally XML Generator
 * Generates Tally Prime-compatible XML from parsed bank statement transactions.
 * Produces a valid XML file that can be imported into Tally using the Import Data feature.
 */

function generateTallyXML(transactions, options = {}) {
    const {
        companyName = 'CA Mega Suite Import',
        bankLedgerName = 'Bank Account',
        voucherType = 'Receipt',
        financialYearFrom = '20250401',
        financialYearTo = '20260331'
    } = options;

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>All Masters and Vouchers</REPORTNAME>
        <STATICVARIABLES>
          <SVCURRENTCOMPANY>${escapeXml(companyName)}</SVCURRENTCOMPANY>
        </STATICVARIABLES>
      </REQUESTDESC>
      <REQUESTDATA>
`;

    // First, generate ledger masters for unique categories
    const uniqueLedgers = new Set();
    transactions.forEach(t => {
        if (t.ledger_name && t.ledger_name !== 'Suspense Account') {
            uniqueLedgers.add(t.ledger_name);
        }
    });

    // Bank Ledger Master
    xml += `        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <LEDGER NAME="${escapeXml(bankLedgerName)}" ACTION="Create">
            <NAME.LIST>
              <NAME>${escapeXml(bankLedgerName)}</NAME>
            </NAME.LIST>
            <PARENT>Bank Accounts</PARENT>
            <ISBANKLEDGER>Yes</ISBANKLEDGER>
          </LEDGER>
        </TALLYMESSAGE>
`;

    // Sundry Ledger Masters
    uniqueLedgers.forEach(ledger => {
        const parentGroup = getLedgerGroup(ledger);
        xml += `        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <LEDGER NAME="${escapeXml(ledger)}" ACTION="Create">
            <NAME.LIST>
              <NAME>${escapeXml(ledger)}</NAME>
            </NAME.LIST>
            <PARENT>${escapeXml(parentGroup)}</PARENT>
          </LEDGER>
        </TALLYMESSAGE>
`;
    });

    // Suspense Account ledger
    xml += `        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <LEDGER NAME="Suspense Account" ACTION="Create">
            <NAME.LIST>
              <NAME>Suspense Account</NAME>
            </NAME.LIST>
            <PARENT>Suspense A/c</PARENT>
          </LEDGER>
        </TALLYMESSAGE>
`;

    // Now generate voucher entries for each transaction
    transactions.forEach((t, index) => {
        const tallyDate = formatTallyDate(t.date);
        const isDebit = t.debit > 0;
        const amount = isDebit ? t.debit : t.credit;
        const counterLedger = t.ledger_name || 'Suspense Account';

        // Determine voucher type based on transaction
        let vType = 'Journal';
        if (isDebit) {
            vType = 'Payment'; // Money going out from bank
        } else {
            vType = 'Receipt'; // Money coming into bank
        }

        const voucherNumber = `CMS-${String(index + 1).padStart(5, '0')}`;

        xml += `        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <VOUCHER VCHTYPE="${vType}" ACTION="Create">
            <DATE>${tallyDate}</DATE>
            <VOUCHERTYPENAME>${vType}</VOUCHERTYPENAME>
            <VOUCHERNUMBER>${voucherNumber}</VOUCHERNUMBER>
            <NARRATION>${escapeXml(t.description || t.narration || 'Bank Transaction')}</NARRATION>
            <REFERENCE>${escapeXml(t.reference || '')}</REFERENCE>
`;

        if (isDebit) {
            // Payment: Debit the expense/party, Credit the bank
            xml += `            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>${escapeXml(counterLedger)}</LEDGERNAME>
              <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
              <AMOUNT>-${amount.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>${escapeXml(bankLedgerName)}</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>${amount.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
`;
        } else {
            // Receipt: Debit the bank, Credit the income/party
            xml += `            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>${escapeXml(bankLedgerName)}</LEDGERNAME>
              <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
              <AMOUNT>-${amount.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>${escapeXml(counterLedger)}</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>${amount.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
`;
        }

        xml += `          </VOUCHER>
        </TALLYMESSAGE>
`;
    });

    xml += `      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;

    return xml;
}

// ── Helpers ────────────────────────────────────────────

function formatTallyDate(dateStr) {
    if (!dateStr) return '20260101';
    // Input: YYYY-MM-DD → Output: YYYYMMDD
    return dateStr.replace(/-/g, '');
}

function escapeXml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function getLedgerGroup(ledgerName) {
    const groups = {
        'Salary Account': 'Direct Expenses',
        'Rent Account': 'Indirect Expenses',
        'Electricity Charges': 'Indirect Expenses',
        'Telephone Charges': 'Indirect Expenses',
        'Internet Charges': 'Indirect Expenses',
        'Insurance Premium': 'Indirect Expenses',
        'GST Payable': 'Duties & Taxes',
        'Income Tax': 'Duties & Taxes',
        'Loan Account': 'Loans (Liability)',
        'Investments': 'Investments',
        'Fixed Deposit': 'Investments',
        'Interest Income': 'Indirect Incomes',
        'Interest Expense': 'Indirect Expenses',
        'Bank Charges': 'Indirect Expenses',
        'Dividend Income': 'Indirect Incomes',
        'Commission Account': 'Indirect Incomes',
        'E-Commerce Purchases': 'Purchase Accounts',
        'Fuel Charges': 'Indirect Expenses',
        'Travel Expenses': 'Indirect Expenses',
        'Food & Entertainment': 'Indirect Expenses',
    };
    return groups[ledgerName] || 'Sundry Debtors';
}

/**
 * Generate a simple Excel export of transactions
 */
function generateExcelData(transactions) {
    const headers = ['Date', 'Description', 'Reference', 'Debit (₹)', 'Credit (₹)', 'Balance (₹)', 'Category', 'Payment Mode', 'Tally Ledger'];

    const rows = transactions.map(t => [
        t.date,
        t.description,
        t.reference,
        t.debit || '',
        t.credit || '',
        t.balance || '',
        t.category,
        t.payment_mode,
        t.ledger_name
    ]);

    // Summary row
    const totalDebit = transactions.reduce((s, t) => s + (t.debit || 0), 0);
    const totalCredit = transactions.reduce((s, t) => s + (t.credit || 0), 0);
    rows.push([]);
    rows.push(['TOTAL', '', '', totalDebit.toFixed(2), totalCredit.toFixed(2), '', '', '', '']);

    return { headers, rows };
}

module.exports = { generateTallyXML, generateExcelData };
