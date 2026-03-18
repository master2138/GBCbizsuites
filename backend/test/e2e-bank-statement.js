// E2E Test: Create sample bank statement → Upload → Parse → Export Tally XML → Validate
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000/api';
let TOKEN = '';

async function request(endpoint, options = {}) {
    const headers = { ...options.headers };
    if (TOKEN) headers['Authorization'] = `Bearer ${TOKEN}`;
    if (!(options.body instanceof FormData) && !(options.body instanceof Buffer)) {
        headers['Content-Type'] = 'application/json';
    }
    const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
    return res;
}

async function run() {
    console.log('\n══════════════════════════════════════════════════════');
    console.log('  END-TO-END TEST: Bank Statement → Tally XML Export');
    console.log('══════════════════════════════════════════════════════\n');

    // Step 1: Register/Login
    console.log('📝 Step 1: Register test user...');
    const regRes = await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email: `e2e_${Date.now()}@test.com`, password: 'test123456', name: 'E2E Test CA' })
    });
    const regData = await regRes.json();
    TOKEN = regData.token;
    console.log(`   ✅ Registered: ${regData.user.name}\n`);

    // Step 2: Create sample bank statement Excel
    console.log('📊 Step 2: Creating sample HDFC bank statement Excel...');
    const sampleFile = path.join(__dirname, 'sample_hdfc_statement.xlsx');

    const headers = ['Date', 'Narration', 'Chq./Ref.No.', 'Value Dt', 'Withdrawal Amt.', 'Deposit Amt.', 'Closing Balance'];
    const rows = [
        ['01/01/2026', 'OPENING BALANCE', '', '01/01/2026', '', '', '250000.00'],
        ['02/01/2026', 'UPI/CR/412345678/GOOGLE PAY/9876543210', 'UPI412345678', '02/01/2026', '', '15000.00', '265000.00'],
        ['03/01/2026', 'NEFT/N123456789/RELIANCE INDUSTRIES', 'N123456789', '03/01/2026', '50000.00', '', '215000.00'],
        ['05/01/2026', 'ATM/CASH WITHDRAWAL/ATM123456', 'ATM123456', '05/01/2026', '10000.00', '', '205000.00'],
        ['07/01/2026', 'UPI/DR/567890123/SWIGGY/FOOD ORDER', 'UPI567890123', '07/01/2026', '450.00', '', '204550.00'],
        ['08/01/2026', 'IMPS/I987654321/SALARY/JAN 2026', 'I987654321', '08/01/2026', '', '75000.00', '279550.00'],
        ['10/01/2026', 'RTGS/R111222333/INVESTMENT/MUTUAL FUND', 'R111222333', '10/01/2026', '25000.00', '', '254550.00'],
        ['12/01/2026', 'NACH/MANDATE/HOME LOAN EMI/HDFC LTD', 'NACH123', '12/01/2026', '35000.00', '', '219550.00'],
        ['15/01/2026', 'CHQ/DEP/CHEQUE DEPOSIT/SELF', 'CHQ987654', '15/01/2026', '', '30000.00', '249550.00'],
        ['18/01/2026', 'UPI/DR/333444555/AMAZON/SHOPPING', 'UPI333444555', '18/01/2026', '8999.00', '', '240551.00'],
        ['20/01/2026', 'NEFT/N987654321/CLIENT PAYMENT/ABC CORP', 'N987654321', '20/01/2026', '', '120000.00', '360551.00'],
        ['22/01/2026', 'UPI/DR/666777888/ELECTRICITY BILL/TPCL', 'UPI666777888', '22/01/2026', '3500.00', '', '357051.00'],
        ['25/01/2026', 'DD/DEMAND DRAFT/INCOME TAX ADVANCE', 'DD123456', '25/01/2026', '15000.00', '', '342051.00'],
        ['28/01/2026', 'INTEREST/QUARTERLY INTEREST CREDIT', 'INT001', '28/01/2026', '', '1250.00', '343301.00'],
        ['30/01/2026', 'UPI/DR/999888777/RENT PAYMENT/JAN', 'UPI999888777', '30/01/2026', '18000.00', '', '325301.00'],
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([
        ['HDFC BANK LIMITED'],
        ['Statement of Account - Savings Account'],
        ['Account No: 50100123456789'],
        ['Period: 01/01/2026 to 31/01/2026'],
        [],
        headers,
        ...rows
    ]);
    XLSX.utils.book_append_sheet(wb, ws, 'Statement');
    XLSX.writeFile(wb, sampleFile);
    console.log(`   ✅ Created: ${sampleFile}\n`);

    // Step 3: Upload
    console.log('📤 Step 3: Uploading bank statement...');
    const fileBuffer = fs.readFileSync(sampleFile);

    // Create multipart form data manually
    const boundary = '----FormBoundary' + Date.now();
    const bodyParts = [
        `--${boundary}\r\n`,
        `Content-Disposition: form-data; name="file"; filename="sample_hdfc_statement.xlsx"\r\n`,
        `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet\r\n\r\n`,
    ];
    const bodyStart = Buffer.from(bodyParts.join(''));
    const bodyEnd = Buffer.from(`\r\n--${boundary}--\r\n`);
    const body = Buffer.concat([bodyStart, fileBuffer, bodyEnd]);

    const uploadRes = await fetch(`${BASE_URL}/bank-statements/upload`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${TOKEN}`,
            'Content-Type': `multipart/form-data; boundary=${boundary}`,
        },
        body
    });
    const uploadData = await uploadRes.json();

    if (uploadRes.status === 201) {
        console.log(`   ✅ Upload successful!`);
        console.log(`   📊 Bank Detected: ${uploadData.statement.bankName}`);
        console.log(`   📝 Transactions Found: ${uploadData.statement.totalTransactions}`);
        console.log(`   💸 Total Debit: ₹${uploadData.statement.totalDebit?.toLocaleString('en-IN')}`);
        console.log(`   💰 Total Credit: ₹${uploadData.statement.totalCredit?.toLocaleString('en-IN')}`);

        if (uploadData.transactions && uploadData.transactions.length > 0) {
            console.log('\n   📋 Transaction Samples:');
            uploadData.transactions.slice(0, 5).forEach((t, i) => {
                console.log(`      ${i + 1}. ${t.date} | ${t.description.slice(0, 40)} | Dr:₹${t.debit} Cr:₹${t.credit} | ${t.category} | Ledger: ${t.ledger_name}`);
            });
        }

        if (uploadData.summary?.byCategory) {
            console.log('\n   📂 Category Breakdown:');
            uploadData.summary.byCategory.forEach(c => {
                console.log(`      ${c.category}: ${c.count} txns — Dr:₹${c.debit.toLocaleString('en-IN')} Cr:₹${c.credit.toLocaleString('en-IN')}`);
            });
        }

        const STMT_ID = uploadData.statement.id;

        // Step 4: Export Tally XML
        console.log('\n📁 Step 4: Exporting Tally XML...');
        const xmlRes = await fetch(`${BASE_URL}/bank-statements/${STMT_ID}/export/tally-xml`, {
            headers: { 'Authorization': `Bearer ${TOKEN}` }
        });
        const xmlContent = await xmlRes.text();

        const hasTallyEnvelope = xmlContent.includes('<ENVELOPE>');
        const hasTallyMessage = xmlContent.includes('<TALLYMESSAGE');
        const hasVoucherEntries = xmlContent.includes('<VOUCHER');
        const hasLedgers = xmlContent.includes('<LEDGER');

        if (hasTallyEnvelope && hasTallyMessage) {
            console.log(`   ✅ Tally XML generated successfully!`);
            console.log(`   📏 XML Size: ${(xmlContent.length / 1024).toFixed(1)} KB`);
            console.log(`   ✅ Has <ENVELOPE>: ${hasTallyEnvelope}`);
            console.log(`   ✅ Has <TALLYMESSAGE>: ${hasTallyMessage}`);
            console.log(`   ✅ Has <VOUCHER>: ${hasVoucherEntries}`);
            console.log(`   ✅ Has <LEDGER>: ${hasLedgers}`);

            // Save XML for inspection
            const xmlFile = path.join(__dirname, 'output_tally_import.xml');
            fs.writeFileSync(xmlFile, xmlContent);
            console.log(`   💾 Saved to: ${xmlFile}`);

            // Show first few lines
            console.log('\n   📄 XML Preview (first 15 lines):');
            xmlContent.split('\n').slice(0, 15).forEach(l => console.log(`      ${l}`));
        } else {
            console.log(`   ❌ Tally XML validation failed!`);
            console.log(`   XML content: ${xmlContent.slice(0, 500)}`);
        }

        // Step 5: Export Excel
        console.log('\n📊 Step 5: Exporting Excel...');
        const excelRes = await fetch(`${BASE_URL}/bank-statements/${STMT_ID}/export/excel`, {
            headers: { 'Authorization': `Bearer ${TOKEN}` }
        });
        if (excelRes.status === 200) {
            const excelBuffer = Buffer.from(await excelRes.arrayBuffer());
            const excelFile = path.join(__dirname, 'output_categorized.xlsx');
            fs.writeFileSync(excelFile, excelBuffer);
            console.log(`   ✅ Excel export successful! Size: ${(excelBuffer.length / 1024).toFixed(1)} KB`);
            console.log(`   💾 Saved to: ${excelFile}`);
        } else {
            console.log(`   ❌ Excel export failed: ${excelRes.status}`);
        }

        // Step 6: Verify statement in list
        console.log('\n📋 Step 6: Verifying statement appears in list...');
        const listRes = await request('/bank-statements');
        const listData = await listRes.json();
        const found = listData.statements?.find(s => s.id === STMT_ID);
        console.log(`   ✅ Statement found in list: ${found ? 'YES' : 'NO'}`);
        if (found) {
            console.log(`   📊 Status: ${found.status} | Bank: ${found.bank_name} | Txns: ${found.total_transactions}`);
        }

    } else {
        console.log(`   ❌ Upload failed: ${uploadRes.status}`);
        console.log(`   Error: ${JSON.stringify(uploadData)}`);
    }

    // Step 7: Dashboard verification
    console.log('\n📊 Step 7: Verifying dashboard reflects data...');
    const dashRes = await request('/dashboard/stats');
    const dashData = await dashRes.json();
    console.log(`   ✅ Dashboard Stats:`);
    console.log(`      Statements: ${dashData.stats?.totalStatements}`);
    console.log(`      Total Debit: ₹${dashData.stats?.totalDebit?.toLocaleString('en-IN')}`);
    console.log(`      Total Credit: ₹${dashData.stats?.totalCredit?.toLocaleString('en-IN')}`);

    // Cleanup
    if (fs.existsSync(sampleFile)) fs.unlinkSync(sampleFile);

    console.log('\n══════════════════════════════════════════════════════');
    console.log('  END-TO-END TEST COMPLETE! 🎉');
    console.log('══════════════════════════════════════════════════════\n');
}

run().catch(console.error);
