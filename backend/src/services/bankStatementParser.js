const XLSX = require('xlsx');

/**
 * Bank Statement Parser
 * Parses Excel/PDF bank statements and extracts structured transaction data.
 * Supports auto-detection for major Indian banks.
 */

// ── Bank Format Patterns ──────────────────────────────
const BANK_PATTERNS = {
    'SBI': {
        keywords: ['state bank', 'sbi'],
        dateFormats: ['DD/MM/YYYY', 'DD-MM-YYYY', 'DD MMM YYYY'],
        headerPatterns: ['txn date', 'description', 'debit', 'credit', 'balance']
    },
    'HDFC': {
        keywords: ['hdfc bank', 'hdfc ltd'],
        dateFormats: ['DD/MM/YY', 'DD/MM/YYYY'],
        headerPatterns: ['date', 'narration', 'withdrawal', 'deposit', 'closing balance']
    },
    'ICICI': {
        keywords: ['icici'],
        dateFormats: ['DD/MM/YYYY', 'DD-MM-YYYY'],
        headerPatterns: ['value date', 'transaction remarks', 'withdrawal', 'deposit', 'balance']
    },
    'AXIS': {
        keywords: ['axis'],
        dateFormats: ['DD-MM-YYYY'],
        headerPatterns: ['tran date', 'particulars', 'debit', 'credit', 'balance']
    },
    'KOTAK': {
        keywords: ['kotak'],
        dateFormats: ['DD-MM-YYYY', 'DD/MM/YYYY'],
        headerPatterns: ['date', 'narration', 'withdrawal', 'deposit', 'balance']
    },
    'BOB': {
        keywords: ['bank of baroda', 'bob'],
        dateFormats: ['DD/MM/YYYY'],
        headerPatterns: ['date', 'particulars', 'debit', 'credit', 'balance']
    },
    'PNB': {
        keywords: ['punjab national', 'pnb'],
        dateFormats: ['DD/MM/YYYY'],
        headerPatterns: ['date', 'description', 'debit', 'credit', 'balance']
    },
    'YES': {
        keywords: ['yes bank'],
        dateFormats: ['DD/MM/YYYY'],
        headerPatterns: ['date', 'description', 'debit', 'credit', 'balance']
    },
    'INDUSIND': {
        keywords: ['indusind'],
        dateFormats: ['DD/MM/YYYY'],
        headerPatterns: ['date', 'description', 'debit', 'credit', 'balance']
    },
    'CANARA': {
        keywords: ['canara'],
        dateFormats: ['DD/MM/YYYY'],
        headerPatterns: ['date', 'description', 'debit', 'credit', 'balance']
    }
};

// ── Payment Mode Detection ────────────────────────────
const PAYMENT_MODES = [
    { pattern: /\bUPI\b|\/UPI\//i, mode: 'UPI' },
    { pattern: /\bNEFT\b/i, mode: 'NEFT' },
    { pattern: /\bRTGS\b/i, mode: 'RTGS' },
    { pattern: /\bIMPS\b/i, mode: 'IMPS' },
    { pattern: /\bATM\b|ATM\s*WDL/i, mode: 'ATM' },
    { pattern: /\bCHQ\b|\bCHEQUE\b|\bCLG\b/i, mode: 'CHEQUE' },
    { pattern: /\bCASH\b|CASH\s*DEP/i, mode: 'CASH' },
    { pattern: /\bECS\b|\bNACH\b|\bACH\b/i, mode: 'ECS' },
    { pattern: /\bDEBIT\s*CARD\b|\bPOS\b/i, mode: 'CARD' },
    { pattern: /\bINT\b.*\bPAID\b|\bINTEREST\b/i, mode: 'INTEREST' },
    { pattern: /\bDD\b|\bDEMAND\s*DRAFT\b/i, mode: 'DD' },
];

// ── Transaction Categories ────────────────────────────
const CATEGORIES = [
    { pattern: /salary|payroll|wages/i, category: 'Salary', ledger: 'Salary Account' },
    { pattern: /rent\b|lease|tenancy/i, category: 'Rent', ledger: 'Rent Account' },
    { pattern: /electricity|power|bescom|msedcl|tpcl/i, category: 'Electricity', ledger: 'Electricity Charges' },
    { pattern: /telephone|mobile|airtel|jio|vodafone|bsnl/i, category: 'Telephone', ledger: 'Telephone Charges' },
    { pattern: /internet|broadband|wifi/i, category: 'Internet', ledger: 'Internet Charges' },
    { pattern: /insurance|lic|hdfc\s*life|icici\s*pru/i, category: 'Insurance', ledger: 'Insurance Premium' },
    { pattern: /gst|cgst|sgst|igst|tax\s*payment/i, category: 'GST Payment', ledger: 'GST Payable' },
    { pattern: /tds|income\s*tax|advance\s*tax/i, category: 'Tax Payment', ledger: 'Income Tax' },
    { pattern: /emi|loan|mortgage|housing/i, category: 'Loan EMI', ledger: 'Loan Account' },
    { pattern: /mutual\s*fund|sip|mf\s*pur|zerodha|groww|kuvera/i, category: 'Investment', ledger: 'Investments' },
    { pattern: /fd|fixed\s*deposit/i, category: 'Fixed Deposit', ledger: 'Fixed Deposit' },
    { pattern: /interest\s*(cr|credit|received|earned|quarterly)/i, category: 'Interest Received', ledger: 'Interest Income' },
    { pattern: /interest\s*(dr|debit|paid|charged)/i, category: 'Interest Paid', ledger: 'Interest Expense' },
    { pattern: /bank\s*charges|service\s*charge|maintenance|sms\s*alert/i, category: 'Bank Charges', ledger: 'Bank Charges' },
    { pattern: /dividend/i, category: 'Dividend', ledger: 'Dividend Income' },
    { pattern: /commission/i, category: 'Commission', ledger: 'Commission Account' },
    { pattern: /amazon|flipkart|myntra|swiggy|zomato|cred\b/i, category: 'E-Commerce', ledger: 'E-Commerce Purchases' },
    { pattern: /petrol|diesel|fuel|indian\s*oil|hp|bharat\s*petroleum/i, category: 'Fuel', ledger: 'Fuel Charges' },
    { pattern: /travel|railway|irctc|flight|airport/i, category: 'Travel', ledger: 'Travel Expenses' },
    { pattern: /food|hotel|restaurant|cafe/i, category: 'Food', ledger: 'Food & Entertainment' },
    { pattern: /education|school|college|tuition|edtech|ednovate/i, category: 'Education', ledger: 'Education Expenses' },
    { pattern: /medical|hospital|pharmacy|doctor|health/i, category: 'Medical', ledger: 'Medical Expenses' },
    { pattern: /vedanta|embassy|mindspace/i, category: 'Dividend', ledger: 'Dividend Income' },
];

// ── Core Parser ───────────────────────────────────────

function parseExcelStatement(filePath, bankNameOverride) {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

    // Find header row
    const { headerRowIndex, columnMap } = findHeaderRow(rawData);
    if (headerRowIndex === -1) {
        throw new Error('Could not detect bank statement format. Please ensure the file has columns for Date, Description, Debit, Credit, and Balance.');
    }

    // Detect bank name (override takes priority)
    const bankName = bankNameOverride || detectBank(rawData, sheetName);

    // Parse transactions
    const transactions = [];
    let accountNumber = '';

    // Try to find account number in the header rows
    for (let i = 0; i < headerRowIndex; i++) {
        const row = rawData[i].join(' ');
        const accMatch = row.match(/A\/C\s*(?:No\.?|Number)?\s*:?\s*(\d{9,18})/i) ||
            row.match(/Account\s*(?:No\.?|Number)?\s*:?\s*(\d{9,18})/i);
        if (accMatch) {
            accountNumber = accMatch[1];
            break;
        }
    }

    for (let i = headerRowIndex + 1; i < rawData.length; i++) {
        const row = rawData[i];
        if (!row || row.length === 0) continue;

        const dateVal = row[columnMap.date];
        const description = String(row[columnMap.description] || '').trim();
        const debit = parseAmount(row[columnMap.debit]);
        const credit = parseAmount(row[columnMap.credit]);
        const balance = parseAmount(row[columnMap.balance]);

        // Skip rows without valid date or description
        const parsedDate = parseDate(dateVal);
        if (!parsedDate || !description) continue;
        if (debit === 0 && credit === 0) continue;

        const paymentMode = detectPaymentMode(description);
        const { category, ledger } = categorizeTransaction(description);
        const reference = extractReference(description);

        transactions.push({
            date: parsedDate,
            description,
            reference,
            debit,
            credit,
            balance,
            category,
            payment_mode: paymentMode,
            ledger_name: ledger,
            narration: description,
            row_number: i + 1,
        });
    }

    return buildResult(bankName, accountNumber, transactions);
}

function parsePDFStatement(text, bankNameOverride) {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l);
    const fullText = lines.join(' ');
    const bankName = bankNameOverride || detectBankFromText(fullText);

    // Use bank-specific parser if available
    if (bankName === 'KOTAK') {
        return parseKotakPDF(lines, bankName);
    }

    return parseGenericPDF(lines, bankName);
}

// ── Kotak-Specific PDF Parser ─────────────────────────
function parseKotakPDF(lines, bankName) {
    const transactions = [];
    let accountNumber = '';

    const fullText = lines.join(' ');
    const accMatch = fullText.match(/Account\s*(?:No\.?)?\s*:?\s*(\d{9,18})/i);
    if (accMatch) accountNumber = accMatch[1];

    // Kotak format: date is concatenated: DD-MM-YYYYNarration...amount(Dr|Cr)balance(Cr|Dr)
    // Or multi-line where continuation lines have no date
    const dateRegex = /^(\d{2}-\d{2}-\d{4})/;

    // First pass: merge multi-line entries
    const mergedLines = [];
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Skip page headers and structural lines
        if (line.match(/^Page \d+ of \d+/) ||
            line.match(/^Period:/) ||
            line.match(/^Cust Reln/) ||
            line.match(/^Account No/) ||
            line.match(/^Currency:/) ||
            line.match(/^Branch/) ||
            line.match(/^Nominee/) ||
            line.match(/^MICR/) ||
            line.match(/^IFSC/) ||
            line.match(/^DateNarration/) ||
            line.match(/^Withdrawal\(Dr\)/) ||
            line.match(/^Deposit\(Cr\)/) ||
            line.match(/^Balance/) ||
            line === '') {
            continue;
        }

        if (dateRegex.test(line)) {
            mergedLines.push(line);
        } else if (mergedLines.length > 0) {
            // Continuation of previous line
            mergedLines[mergedLines.length - 1] += line;
        }
    }

    // Parse each merged line
    for (const line of mergedLines) {
        const dateMatch = line.match(/^(\d{2}-\d{2}-\d{4})/);
        if (!dateMatch) continue;

        const parsedDate = parseDate(dateMatch[1]);
        if (!parsedDate) continue;
        const afterDate = line.substring(10); // After DD-MM-YYYY

        // Kotak amounts are ALWAYS followed by (Dr) or (Cr)
        // Key insight: amounts have format like 1,412.00(Dr) or 40,000.00(Cr)
        // But they're concatenated with ref numbers like: ...3091312872331,412.00(Dr)8,343.73(Cr)
        // Strategy: find .XX(Dr/Cr), then extract valid Indian number format backwards

        const extractKotakAmounts = (text) => {
            const results = [];
            // Greedily match digits+commas before .XX(Dr/Cr)
            const re = /(\d[\d,]*\.\d{2})\(([DC]r)\)/g;
            let m;
            while ((m = re.exec(text)) !== null) {
                const raw = m[1];
                const type = m[2];
                const matchEnd = m.index + m[0].length;

                const dotIdx = raw.indexOf('.');
                const intStr = raw.substring(0, dotIdx);
                const decStr = raw.substring(dotIdx + 1);
                const groups = intStr.split(',');

                let cleanedAmount;

                if (groups.length === 1) {
                    // No commas — small amount or amount without formatting
                    // e.g., "411.50" or "1920.50" from "...1704230017361920.50(Cr)"
                    // For Kotak, amounts > 999 without commas are unusual
                    // Take only last 4 digits max (amounts up to 9999 without commas)
                    const digits = groups[0];
                    if (digits.length > 4) {
                        cleanedAmount = digits.slice(-4) + '.' + decStr;
                    } else {
                        cleanedAmount = intStr + '.' + decStr;
                    }
                } else {
                    // Has commas — validate Indian format from RIGHT
                    const lastGroup = groups[groups.length - 1];
                    if (lastGroup.length !== 3) {
                        // Invalid — skip this match
                        continue;
                    }

                    // Build valid amount from right to left
                    const validParts = [lastGroup];
                    for (let i = groups.length - 2; i >= 0; i--) {
                        if (i === 0) {
                            // Leading group: should be 1-2 digits in Indian format
                            // If oversized, it contains ref number bleed — take last 1 digit
                            if (groups[i].length > 2) {
                                validParts.unshift(groups[i].slice(-1));
                            } else {
                                validParts.unshift(groups[i]);
                            }
                        } else {
                            // Intermediate group: exactly 2 digits in Indian format
                            if (groups[i].length === 2) {
                                validParts.unshift(groups[i]);
                            } else if (groups[i].length > 2) {
                                // Ref bleed into intermediate group (rare)
                                validParts.unshift(groups[i].slice(-2));
                            } else {
                                break; // invalid grouping, stop
                            }
                        }
                    }
                    cleanedAmount = validParts.join(',') + '.' + decStr;
                }

                const value = parseFloat(cleanedAmount.replace(/,/g, ''));
                if (value > 0) {
                    // Calculate where the actual amount starts in the text
                    const fullSuffix = '(' + type + ')';
                    const rawWithSuffix = raw + fullSuffix;
                    const rawStart = matchEnd - rawWithSuffix.length;
                    // Narration ends where the contaminated raw match starts
                    // But actual amount is shorter than raw; narration includes the ref digits
                    results.push({
                        value,
                        type,
                        fullMatchStart: rawStart,
                        fullMatchEnd: matchEnd,
                    });
                }
            }
            return results;
        };

        const amounts = extractKotakAmounts(afterDate);

        if (amounts.length === 0) continue;

        // Narration is everything before the first amount
        const narrationEnd = amounts[0].fullMatchStart;
        const description = afterDate.substring(0, narrationEnd).trim();
        if (!description) continue;

        let debit = 0, credit = 0, balance = 0;

        if (amounts.length >= 2) {
            // Last amount is balance, first is transaction amount
            const txnAmount = amounts[0];
            const balAmount = amounts[amounts.length - 1];

            if (txnAmount.type === 'Dr') {
                debit = txnAmount.value;
            } else {
                credit = txnAmount.value;
            }
            balance = balAmount.value;
        } else if (amounts.length === 1) {
            const amt = amounts[0];
            if (amt.type === 'Dr') {
                debit = amt.value;
            } else {
                credit = amt.value;
            }
        }

        if (debit === 0 && credit === 0) continue;

        const paymentMode = detectPaymentMode(description);
        const { category, ledger } = categorizeTransaction(description);

        transactions.push({
            date: parsedDate,
            description,
            reference: extractReference(description),
            debit,
            credit,
            balance,
            category,
            payment_mode: paymentMode,
            ledger_name: ledger,
            narration: description,
            row_number: mergedLines.indexOf(line) + 1,
        });
    }

    // Balance-based cross-validation: correct amounts that don't match balance flow
    for (let i = 0; i < transactions.length; i++) {
        const t = transactions[i];
        if (i === 0 || t.balance === 0) continue;

        const prevBal = transactions[i - 1].balance;
        if (prevBal === 0) continue;

        // Expected: prevBal - debit + credit = balance
        const expectedBal = Math.round((prevBal - t.debit + t.credit) * 100) / 100;

        if (Math.abs(expectedBal - t.balance) > 0.01) {
            // Balance doesn't match — try to correct the transaction amount
            // Calculate what the correct amount should be
            if (t.debit > 0) {
                const correctDebit = Math.round((prevBal - t.balance) * 100) / 100;
                if (correctDebit > 0 && correctDebit < t.debit) {
                    t.debit = correctDebit;
                }
            } else if (t.credit > 0) {
                const correctCredit = Math.round((t.balance - prevBal) * 100) / 100;
                if (correctCredit > 0 && correctCredit < t.credit) {
                    t.credit = correctCredit;
                }
            }
        }
    }

    return buildResult(bankName, accountNumber, transactions);
}

// ── Generic PDF Parser ────────────────────────────────
function parseGenericPDF(lines, bankName) {
    const transactions = [];
    let accountNumber = '';

    const fullText = lines.join(' ');
    const accMatch = fullText.match(/A\/C\s*(?:No\.?|Number)?\s*:?\s*(\d{9,18})/i) ||
        fullText.match(/Account\s*(?:No\.?|Number)?\s*:?\s*(\d{9,18})/i);
    if (accMatch) accountNumber = accMatch[1];

    const dateRegex = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/;

    // Merge multi-line entries
    const mergedLines = [];
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (dateRegex.test(line)) {
            mergedLines.push(line);
        } else if (mergedLines.length > 0 && !line.match(/^Page\s/)) {
            mergedLines[mergedLines.length - 1] += ' ' + line;
        }
    }

    for (const line of mergedLines) {
        const dateMatch = line.match(dateRegex);
        if (!dateMatch) continue;

        const parsedDate = parseDate(dateMatch[1]);
        if (!parsedDate) continue;

        // Check for (Dr)/(Cr) suffixed amounts first
        const drCrPattern = /([\d,]+\.\d{2})\(([DC]r)\)/g;
        let drCrMatch;
        const drCrAmounts = [];
        while ((drCrMatch = drCrPattern.exec(line)) !== null) {
            drCrAmounts.push({ value: parseAmount(drCrMatch[1]), type: drCrMatch[2] });
        }

        let debit = 0, credit = 0, balance = 0;
        let description = '';

        if (drCrAmounts.length >= 2) {
            // Kotak/similar format with (Dr)/(Cr) markers
            const afterDate = line.substring(line.indexOf(dateMatch[1]) + dateMatch[1].length).trim();
            description = afterDate.replace(/([\d,]+\.\d{2})\([DC]r\)/g, '').trim();

            const txn = drCrAmounts[0];
            if (txn.type === 'Dr') debit = txn.value;
            else credit = txn.value;
            balance = drCrAmounts[drCrAmounts.length - 1].value;
        } else {
            // Standard format: amounts separated by whitespace
            const amounts = line.match(/[\d,]+\.\d{2}/g);
            if (!amounts || amounts.length < 1) continue;

            const afterDate = line.substring(line.indexOf(dateMatch[1]) + dateMatch[1].length).trim();
            description = afterDate.replace(/[\d,]+\.\d{2}/g, '').trim() || 'Transaction';

            if (amounts.length >= 3) {
                debit = parseAmount(amounts[0]);
                credit = parseAmount(amounts[1]);
                balance = parseAmount(amounts[2]);
            } else if (amounts.length === 2) {
                const amt1 = parseAmount(amounts[0]);
                const amt2 = parseAmount(amounts[1]);
                if (line.includes('DR') || line.includes('Debit') || line.includes('withdrawal')) {
                    debit = amt1;
                    balance = amt2;
                } else {
                    credit = amt1;
                    balance = amt2;
                }
            } else {
                balance = parseAmount(amounts[0]);
            }
        }

        if (debit === 0 && credit === 0) continue;
        if (!description) description = 'Transaction';

        const paymentMode = detectPaymentMode(description);
        const { category, ledger } = categorizeTransaction(description);

        transactions.push({
            date: parsedDate,
            description,
            reference: extractReference(description),
            debit,
            credit,
            balance,
            category,
            payment_mode: paymentMode,
            ledger_name: ledger,
            narration: description,
            row_number: mergedLines.indexOf(line) + 1,
        });
    }

    return buildResult(bankName, accountNumber, transactions);
}

// ── Build Result Object ───────────────────────────────
function buildResult(bankName, accountNumber, transactions) {
    return {
        bankName,
        accountNumber,
        transactions,
        totalDebit: Math.round(transactions.reduce((sum, t) => sum + t.debit, 0) * 100) / 100,
        totalCredit: Math.round(transactions.reduce((sum, t) => sum + t.credit, 0) * 100) / 100,
        closingBalance: transactions.length > 0 ? transactions[transactions.length - 1].balance : 0,
        periodFrom: transactions.length > 0 ? transactions[0].date : null,
        periodTo: transactions.length > 0 ? transactions[transactions.length - 1].date : null,
    };
}

// ── Helper Functions ──────────────────────────────────

function findHeaderRow(data) {
    const headerKeywords = ['date', 'description', 'narration', 'particulars', 'debit', 'credit', 'withdrawal', 'deposit', 'balance'];

    for (let i = 0; i < Math.min(data.length, 20); i++) {
        const row = data[i];
        if (!row || row.length < 3) continue;

        const rowText = row.map(c => String(c).toLowerCase().trim());
        const matches = headerKeywords.filter(kw => rowText.some(cell => cell.includes(kw)));

        if (matches.length >= 3) {
            const columnMap = {
                date: -1, description: -1, debit: -1, credit: -1, balance: -1,
            };

            for (let j = 0; j < rowText.length; j++) {
                const cell = rowText[j];
                if (columnMap.date === -1 && (cell.includes('date') || cell.includes('txn'))) {
                    columnMap.date = j;
                } else if (columnMap.description === -1 && (cell.includes('description') || cell.includes('narration') || cell.includes('particulars') || cell.includes('remarks'))) {
                    columnMap.description = j;
                } else if (columnMap.debit === -1 && (cell.includes('debit') || cell.includes('withdrawal') || cell.includes('dr'))) {
                    columnMap.debit = j;
                } else if (columnMap.credit === -1 && (cell.includes('credit') || cell.includes('deposit') || cell.includes('cr'))) {
                    columnMap.credit = j;
                } else if (columnMap.balance === -1 && cell.includes('balance')) {
                    columnMap.balance = j;
                }
            }

            if (columnMap.date !== -1 && columnMap.description !== -1 && (columnMap.debit !== -1 || columnMap.credit !== -1)) {
                if (columnMap.balance === -1) columnMap.balance = rowText.length - 1;
                if (columnMap.debit === -1) columnMap.debit = columnMap.credit;
                if (columnMap.credit === -1) columnMap.credit = columnMap.debit;
                return { headerRowIndex: i, columnMap };
            }
        }
    }

    return {
        headerRowIndex: 0,
        columnMap: { date: 0, description: 1, debit: 3, credit: 4, balance: 5 }
    };
}

function detectBank(data, sheetName) {
    const searchText = (data.slice(0, 10).map(r => (r || []).join(' ')).join(' ') + ' ' + sheetName).toLowerCase();
    for (const [bank, config] of Object.entries(BANK_PATTERNS)) {
        if (config.keywords.some(kw => searchText.includes(kw))) return bank;
    }
    return 'Unknown';
}

function detectBankFromText(text) {
    const lower = text.toLowerCase();
    // Check KOTAK before others to avoid false matches (e.g. 'hdfc' could appear in narration)
    if (lower.includes('kotak')) return 'KOTAK';
    for (const [bank, config] of Object.entries(BANK_PATTERNS)) {
        if (config.keywords.some(kw => lower.includes(kw))) return bank;
    }
    return 'Unknown';
}

function parseDate(val) {
    if (!val) return null;
    const str = String(val).trim();

    // Excel serial number
    if (/^\d{5}$/.test(str)) {
        const date = new Date((parseInt(str) - 25569) * 86400 * 1000);
        if (!isNaN(date.getTime())) return date.toISOString().split('T')[0];
    }

    // DD/MM/YYYY or DD-MM-YYYY
    let match = str.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
    if (match) {
        let [, d, m, y] = match;
        if (y.length === 2) y = '20' + y;
        const date = new Date(`${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`);
        if (!isNaN(date.getTime())) return date.toISOString().split('T')[0];
    }

    // DD MMM YYYY
    match = str.match(/(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+(\d{4})/i);
    if (match) {
        const date = new Date(`${match[2]} ${match[1]}, ${match[3]}`);
        if (!isNaN(date.getTime())) return date.toISOString().split('T')[0];
    }

    // Try native parse
    const date = new Date(str);
    if (!isNaN(date.getTime())) return date.toISOString().split('T')[0];

    return null;
}

function parseAmount(val) {
    if (val === null || val === undefined || val === '') return 0;
    if (typeof val === 'number') return Math.round(Math.abs(val) * 100) / 100;
    const cleaned = String(val).replace(/[₹\s]/g, '').replace(/,/g, '').replace(/\((.+)\)/, '-$1');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : Math.round(Math.abs(num) * 100) / 100;
}

function detectPaymentMode(description) {
    for (const { pattern, mode } of PAYMENT_MODES) {
        if (pattern.test(description)) return mode;
    }
    return 'OTHER';
}

function categorizeTransaction(description) {
    for (const { pattern, category, ledger } of CATEGORIES) {
        if (pattern.test(description)) return { category, ledger };
    }
    return { category: 'General', ledger: 'Suspense Account' };
}

function extractReference(description) {
    const refMatch = description.match(/(?:Ref|REF|UTR|RRN|TXN|TRANS)\s*(?:No\.?|#)?\s*:?\s*(\w{6,20})/i);
    if (refMatch) return refMatch[1];
    const upiMatch = description.match(/(\d{12,})/);
    if (upiMatch) return upiMatch[1];
    return '';
}

module.exports = { parseExcelStatement, parsePDFStatement };
