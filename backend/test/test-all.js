// Comprehensive API test script for CA Mega Suite
const BASE_URL = 'http://localhost:5000/api';
let TOKEN = '';
let USER_ID = '';
let CLIENT_ID = '';

async function request(endpoint, options = {}) {
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (TOKEN) headers['Authorization'] = `Bearer ${TOKEN}`;

    const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
    const data = await res.json();
    return { status: res.status, data };
}

async function test(name, fn) {
    try {
        const result = await fn();
        console.log(`✅ ${name}`);
        return result;
    } catch (err) {
        console.error(`❌ ${name}: ${err.message}`);
        return null;
    }
}

async function runTests() {
    console.log('\n═══════════════════════════════════════════');
    console.log('  CA MEGA SUITE — API Test Suite');
    console.log('═══════════════════════════════════════════\n');

    // 1. Health
    await test('Health Check', async () => {
        const { status, data } = await request('/health');
        if (status !== 200 || data.status !== 'ok') throw new Error(`Expected ok, got ${data.status}`);
    });

    // 2. Register
    const testEmail = `test${Date.now()}@gbc.com`;
    await test('Register User', async () => {
        const { status, data } = await request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email: testEmail, password: 'test123456', name: 'CA Test User', firm_name: 'GBC Associates' })
        });
        if (status !== 201) throw new Error(`Status ${status}: ${data.error}`);
        TOKEN = data.token;
        USER_ID = data.user.id;
        console.log(`   Token: ${TOKEN.slice(0, 30)}...`);
    });

    // 3. Duplicate Register
    await test('Duplicate Register (should fail 409)', async () => {
        const { status } = await request('/auth/register', { method: 'POST', body: JSON.stringify({ email: testEmail, password: 'test123', name: 'Dup' }) });
        if (status !== 409) throw new Error(`Expected 409, got ${status}`);
    });

    // 4. Get Me
    await test('Get Current User', async () => {
        const { status, data } = await request('/auth/me');
        if (status !== 200 || !data.user.name) throw new Error(`Status ${status}`);
        console.log(`   User: ${data.user.name} (${data.user.email})`);
    });

    // 5. Create Client
    await test('Create Client', async () => {
        const { status, data } = await request('/clients', {
            method: 'POST',
            body: JSON.stringify({ name: 'Reliance Industries', email: 'finance@ril.com', phone: '9876543210', gstin: '27AADCR5566R1Z3', pan: 'AADCR5566R', business_type: 'Pvt Ltd' })
        });
        if (status !== 201) throw new Error(`Status ${status}: ${data.error}`);
        CLIENT_ID = data.client.id;
        console.log(`   Client ID: ${CLIENT_ID}`);
    });

    // 6. List Clients
    await test('List Clients', async () => {
        const { status, data } = await request('/clients');
        if (status !== 200 || data.clients.length === 0) throw new Error(`Expected clients`);
        console.log(`   Found: ${data.clients.length} clients`);
    });

    // 7. Update Client
    await test('Update Client', async () => {
        const { status, data } = await request(`/clients/${CLIENT_ID}`, {
            method: 'PUT', body: JSON.stringify({ name: 'Reliance Industries Ltd', notes: 'Updated via test' })
        });
        if (status !== 200) throw new Error(`Status ${status}`);
        console.log(`   Updated: ${data.client.name}`);
    });

    // 8. Dashboard Stats 
    await test('Dashboard Stats', async () => {
        const { status, data } = await request('/dashboard/stats');
        if (status !== 200) throw new Error(`Status ${status}`);
        console.log(`   Clients: ${data.stats.totalClients}, Statements: ${data.stats.totalStatements}`);
    });

    // 9. Activity Feed
    await test('Activity Feed', async () => {
        const { status, data } = await request('/dashboard/activity');
        if (status !== 200) throw new Error(`Status ${status}`);
        console.log(`   Activities: ${data.activities.length}`);
    });

    // 10. Income Tax Calculator (uses gross_salary, not annual_income)
    await test('Income Tax Calculator', async () => {
        const { status, data } = await request('/calculators/income-tax', {
            method: 'POST',
            body: JSON.stringify({ gross_salary: 1500000, section_80c: 150000, age_group: 'below_60' })
        });
        if (status !== 200) throw new Error(`Status ${status}: ${JSON.stringify(data)}`);
        if (!data.old_regime || !data.new_regime) throw new Error('Missing regimes');
        console.log(`   Old Regime Tax: ₹${data.old_regime.totalTax}, New Regime: ₹${data.new_regime.totalTax}`);
        console.log(`   Recommended: ${data.recommendation}, Savings: ₹${data.savings}`);
    });

    // 11. HRA Calculator (uses monthly basic_salary, da, monthly hra_received, rent_paid, is_metro)
    await test('HRA Calculator', async () => {
        const { status, data } = await request('/calculators/hra', {
            method: 'POST',
            body: JSON.stringify({ basic_salary: 50000, da: 0, hra_received: 20000, rent_paid: 15000, is_metro: true })
        });
        if (status !== 200) throw new Error(`Status ${status}: ${JSON.stringify(data)}`);
        if (data.exemption === undefined) throw new Error('Missing exemption');
        console.log(`   HRA Exemption: ₹${data.exemption}, Taxable HRA: ₹${data.taxableHRA}`);
    });

    // 12. EMI Calculator
    await test('EMI Calculator', async () => {
        const { status, data } = await request('/calculators/emi', {
            method: 'POST',
            body: JSON.stringify({ principal: 5000000, annual_rate: 8.5, tenure_months: 240 })
        });
        if (status !== 200) throw new Error(`Status ${status}: ${JSON.stringify(data)}`);
        if (!data.emi) throw new Error('Missing emi');
        console.log(`   Monthly EMI: ₹${data.emi}, Total Interest: ₹${data.totalInterest}`);
    });

    // 13. SIP Calculator (uses expected_return_rate, tenure_years)
    await test('SIP Calculator', async () => {
        const { status, data } = await request('/calculators/sip', {
            method: 'POST',
            body: JSON.stringify({ monthly_investment: 5000, expected_return_rate: 12, tenure_years: 10 })
        });
        if (status !== 200) throw new Error(`Status ${status}: ${JSON.stringify(data)}`);
        if (!data.futureValue) throw new Error('Missing futureValue');
        console.log(`   Future Value: ₹${data.futureValue}, Wealth Gained: ₹${data.wealthGained}`);
    });

    // 14. PPF Calculator (uses annual_investment, tenure_years)
    await test('PPF Calculator', async () => {
        const { status, data } = await request('/calculators/ppf', {
            method: 'POST',
            body: JSON.stringify({ annual_investment: 150000, tenure_years: 15 })
        });
        if (status !== 200) throw new Error(`Status ${status}: ${JSON.stringify(data)}`);
        if (!data.maturityValue) throw new Error('Missing maturityValue');
        console.log(`   Maturity: ₹${data.maturityValue}, Interest Earned: ₹${data.totalInterest}`);
    });

    // 15. GST Calculator (uses is_inclusive, is_inter_state)
    await test('GST Calculator', async () => {
        const { status, data } = await request('/calculators/gst', {
            method: 'POST',
            body: JSON.stringify({ amount: 10000, gst_rate: 18, is_inclusive: false, is_inter_state: false })
        });
        if (status !== 200) throw new Error(`Status ${status}: ${JSON.stringify(data)}`);
        if (!data.gstAmount && data.gstAmount !== 0) throw new Error('Missing gstAmount');
        console.log(`   GST: ₹${data.gstAmount}, Total: ₹${data.totalAmount}`);
        console.log(`   CGST: ₹${data.breakdown.cgst}, SGST: ₹${data.breakdown.sgst}`);
    });

    // 16. GSTIN Verify Valid
    await test('GSTIN Verify (Valid Format)', async () => {
        const { status, data } = await request('/gstin/verify/27AADCB2230M1ZA');
        if (status !== 200) throw new Error(`Status ${status}`);
        console.log(`   Valid: ${data.valid}, State: ${data.details?.state_name}, PAN: ${data.details?.pan}`);
    });

    // 17. GSTIN Invalid
    await test('GSTIN Verify (Invalid)', async () => {
        const { status, data } = await request('/gstin/verify/INVALID');
        if (data.valid) throw new Error('Expected invalid');
        console.log(`   Correctly identified as invalid`);
    });

    // 18. Bank Statements List
    await test('List Bank Statements', async () => {
        const { status, data } = await request('/bank-statements');
        if (status !== 200) throw new Error(`Status ${status}`);
        console.log(`   Statements: ${data.statements.length}`);
    });

    // 19. Delete Client
    await test('Delete Client', async () => {
        const { status } = await request(`/clients/${CLIENT_ID}`, { method: 'DELETE' });
        if (status !== 200) throw new Error(`Status ${status}`);
    });

    console.log('\n═══════════════════════════════════════════');
    console.log('  ALL TESTS COMPLETE! 🎉');
    console.log('═══════════════════════════════════════════\n');
}

runTests().catch(console.error);
