const http = require('http');
const fs = require('fs');

function post(path, body, token) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(body);
        const opts = {
            hostname: 'localhost', port: 5000, path, method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
        };
        if (token) opts.headers['Authorization'] = 'Bearer ' + token;
        const req = http.request(opts, res => {
            let d = ''; res.on('data', c => d += c);
            res.on('end', () => resolve(JSON.parse(d)));
        });
        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

function uploadFile(filePath, bankName, token) {
    return new Promise((resolve, reject) => {
        const boundary = '----FormBoundary' + Date.now();
        const fileContent = fs.readFileSync(filePath);
        const fileName = filePath.split(/[\/\\]/).pop();

        let bodyStr = '';
        bodyStr += '--' + boundary + '\r\n';
        bodyStr += 'Content-Disposition: form-data; name="bank_name"\r\n\r\n';
        bodyStr += bankName + '\r\n';
        bodyStr += '--' + boundary + '\r\n';
        bodyStr += 'Content-Disposition: form-data; name="file"; filename="' + fileName + '"\r\n';
        bodyStr += 'Content-Type: application/pdf\r\n\r\n';

        const header = Buffer.from(bodyStr, 'utf8');
        const footer = Buffer.from('\r\n--' + boundary + '--\r\n', 'utf8');
        const body = Buffer.concat([header, fileContent, footer]);

        const req = http.request({
            hostname: 'localhost', port: 5000, path: '/api/bank-statements/upload', method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'multipart/form-data; boundary=' + boundary,
                'Content-Length': body.length
            }
        }, res => {
            let d = ''; res.on('data', c => d += c);
            res.on('end', () => {
                try { resolve(JSON.parse(d)); } catch (e) { reject(new Error(d.slice(0, 500))); }
            });
        });
        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

async function run() {
    console.log('=== Kotak PDF Parsing Test ===\n');

    // Register
    const auth = await post('/api/auth/register', {
        email: 'kotak_test_' + Date.now() + '@test.com',
        password: 'Test123!',
        name: 'Kotak Tester'
    });
    console.log('Auth:', auth.token ? 'OK' : 'FAILED');
    if (!auth.token) { console.log(auth); return; }

    // Upload Kotak PDF with bank override
    const pdfPath = 'c:/GBC Associates/GBC mega App/Attached/01 Apr 2023 - 31 Mar 2024_XX1241.pdf';
    console.log('\nUploading Kotak PDF with bank_name=KOTAK...');
    const result = await uploadFile(pdfPath, 'KOTAK', auth.token);

    if (result.error) {
        console.log('ERROR:', result.error);
        return;
    }

    console.log('\n--- Results ---');
    console.log('Bank:', result.statement?.bankName);
    console.log('Transactions:', result.statement?.totalTransactions);
    console.log('Total Debit: Rs', result.statement?.totalDebit?.toLocaleString('en-IN'));
    console.log('Total Credit: Rs', result.statement?.totalCredit?.toLocaleString('en-IN'));

    console.log('\nFirst 10 transactions:');
    (result.transactions || []).slice(0, 10).forEach((t, i) => {
        const desc = (t.description || '').slice(0, 50);
        console.log(`  ${i + 1}. ${t.date} | Dr:${t.debit} Cr:${t.credit} Bal:${t.balance} | ${t.category} | ${desc}`);
    });

    console.log('\nCategory summary:');
    (result.summary?.byCategory || []).forEach(c => {
        console.log(`  ${c.category}: ${c.count} txns, Dr:${c.debit}, Cr:${c.credit}`);
    });

    console.log('\n=== Done ===');
}

run().catch(err => console.error('Fatal:', err));
