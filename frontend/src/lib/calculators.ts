// Client-Side Calculator Engine — replaces broken API calls to localhost:5000
// All calculations run in the browser — no backend needed

const NEW_SLABS = [
    { from: 0, to: 400000, rate: 0 },
    { from: 400000, to: 800000, rate: 0.05 },
    { from: 800000, to: 1200000, rate: 0.10 },
    { from: 1200000, to: 1600000, rate: 0.15 },
    { from: 1600000, to: 2000000, rate: 0.20 },
    { from: 2000000, to: 2400000, rate: 0.25 },
    { from: 2400000, to: Infinity, rate: 0.30 },
];
const OLD_SLABS = [
    { from: 0, to: 250000, rate: 0 },
    { from: 250000, to: 500000, rate: 0.05 },
    { from: 500000, to: 1000000, rate: 0.20 },
    { from: 1000000, to: Infinity, rate: 0.30 },
];

function slabTax(income: number, slabs: typeof NEW_SLABS) {
    let tax = 0;
    const details: any[] = [];
    for (const s of slabs) {
        if (income <= s.from) { details.push({ range: `₹${s.from.toLocaleString('en-IN')}+`, rate: `${s.rate * 100}%`, tax: 0 }); continue; }
        const taxable = Math.min(income, s.to) - s.from;
        const t = taxable * s.rate;
        tax += t;
        details.push({ range: `₹${s.from.toLocaleString('en-IN')} – ₹${s.to === Infinity ? '∞' : s.to.toLocaleString('en-IN')}`, rate: `${s.rate * 100}%`, tax: t });
    }
    return { tax: Math.round(tax), slabs: details };
}

export function calcIncomeTax(data: any) {
    const income = data.gross_salary || 0;
    const ded80c = Math.min(data.section_80c || 0, 150000);
    const oldTaxable = Math.max(0, income - 50000 - ded80c);
    const newTaxable = Math.max(0, income - 75000);
    const oldCalc = slabTax(oldTaxable, OLD_SLABS);
    const newCalc = slabTax(newTaxable, NEW_SLABS);
    const oldCess = Math.round(oldCalc.tax * 0.04);
    const newCess = Math.round(newCalc.tax * 0.04);
    const oldRebate = oldTaxable <= 700000 ? Math.min(oldCalc.tax, 12500) : 0;
    const newRebate = newTaxable <= 1200000 ? Math.min(newCalc.tax, 60000) : 0;
    const oldTotal = Math.max(0, oldCalc.tax + oldCess - oldRebate);
    const newTotal = Math.max(0, newCalc.tax + newCess - newRebate);
    const savings = Math.abs(oldTotal - newTotal);
    return {
        totalIncome: income, savings,
        recommendation: newTotal <= oldTotal ? 'new_regime' : 'old_regime',
        old_regime: { taxableIncome: oldTaxable, totalDeductions: 50000 + ded80c, tax: oldCalc.tax, cess: oldCess, rebate: oldRebate, totalTax: oldTotal, effectiveRate: income > 0 ? ((oldTotal / income) * 100).toFixed(1) : '0', slabs: oldCalc.slabs },
        new_regime: { taxableIncome: newTaxable, standardDeduction: 75000, tax: newCalc.tax, cess: newCess, rebate: newRebate, totalTax: newTotal, effectiveRate: income > 0 ? ((newTotal / income) * 100).toFixed(1) : '0', slabs: newCalc.slabs },
    };
}

export function calcHRA(data: any) {
    const basic = (data.basic_salary || 0) * 12;
    const da = (data.da || 0) * 12;
    const hra = (data.hra_received || 0) * 12;
    const rent = (data.rent_paid || 0) * 12;
    const pct = data.is_metro ? 0.50 : 0.40;
    const a = hra;
    const b = rent - 0.10 * (basic + da);
    const c = pct * (basic + da);
    const exemption = Math.max(0, Math.round(Math.min(a, b, c)));
    return {
        annual: { basicPlusDa: basic + da, hra, rent },
        calculation: { actualHRA: a, rentMinus10Percent: Math.round(b), percentOfBasic: Math.round(c), percentUsed: `${pct * 100}%` },
        exemption, taxableHRA: hra - exemption, monthlySavings: Math.round(exemption / 12),
    };
}

export function calcEMI(data: any) {
    const P = data.principal || 0;
    const r = (data.annual_rate || 0) / 1200;
    const n = data.tenure_months || 1;
    const emi = r > 0 ? Math.round(P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1)) : Math.round(P / n);
    const total = emi * n;
    return { emi, principal: P, annualRate: data.annual_rate, tenureMonths: n, totalPayment: total, totalInterest: total - P, interestToLoanRatio: P > 0 ? ((total - P) / P * 100).toFixed(1) : '0' };
}

export function calcSIP(data: any) {
    const m = data.monthly_investment || 0;
    const r = (data.expected_return_rate || 0) / 1200;
    const n = (data.tenure_years || 0) * 12;
    const fv = r > 0 ? Math.round(m * ((Math.pow(1 + r, n) - 1) / r) * (1 + r)) : m * n;
    const invested = m * n;
    return { futureValue: fv, totalInvested: invested, wealthGained: fv - invested, monthlyInvestment: m, expectedReturnRate: data.expected_return_rate, tenureYears: data.tenure_years };
}

export function calcPPF(data: any) {
    const annual = data.annual_investment || 0;
    const years = data.tenure_years || 15;
    const rate = 7.1 / 100;
    let balance = 0;
    for (let i = 0; i < years; i++) { balance = (balance + annual) * (1 + rate); }
    const maturity = Math.round(balance);
    const invested = annual * years;
    return { maturityValue: maturity, totalInvested: invested, totalInterest: maturity - invested, annualInvestment: annual, interestRate: 7.1, taxSaved80C: Math.round(Math.min(annual, 150000) * 0.312) };
}

export function calcGST(data: any) {
    const amount = data.amount || 0;
    const rate = data.gst_rate || 18;
    const isInclusive = data.is_inclusive;
    const isInterState = data.is_inter_state;
    const base = isInclusive ? Math.round(amount * 100 / (100 + rate)) : amount;
    const gst = Math.round(base * rate / 100);
    return {
        baseAmount: base, gstRate: rate, gstAmount: gst, totalAmount: base + gst,
        isInclusive, isInterState,
        breakdown: isInterState
            ? { igst: gst, igstRate: rate }
            : { cgst: Math.round(gst / 2), cgstRate: rate / 2, sgst: Math.round(gst / 2), sgstRate: rate / 2 },
    };
}

const TDS_RATES: Record<string, { rate: number; threshold: number; name: string }> = {
    '192': { rate: 0, threshold: 0, name: 'Salary (slab rates)' },
    '194A': { rate: 10, threshold: 40000, name: 'Interest other than securities' },
    '194C_IND': { rate: 1, threshold: 30000, name: 'Contractor (Individual/HUF)' },
    '194C_OTH': { rate: 2, threshold: 30000, name: 'Contractor (Others)' },
    '194H': { rate: 5, threshold: 15000, name: 'Commission/Brokerage' },
    '194I_LAND': { rate: 10, threshold: 240000, name: 'Rent (Land/Building)' },
    '194I_EQUIP': { rate: 2, threshold: 240000, name: 'Rent (P&M/Equipment)' },
    '194J_TECH': { rate: 2, threshold: 30000, name: 'Technical Services' },
    '194J_PROF': { rate: 10, threshold: 30000, name: 'Professional Services' },
    '194Q': { rate: 0.1, threshold: 5000000, name: 'Purchase of Goods' },
    '194R': { rate: 10, threshold: 20000, name: 'Benefits/Perquisites' },
    '194S': { rate: 1, threshold: 10000, name: 'Crypto/VDA Transfer' },
};

export function calcTDS(data: any) {
    const sec = TDS_RATES[data.section] || TDS_RATES['194A'];
    const amount = data.amount || 0;
    const rate = data.pan_available ? sec.rate : 20;
    const tds = Math.round(amount * rate / 100);
    return { section: data.section, sectionName: sec.name, amount, rate: `${rate}%`, threshold: sec.threshold, tdsAmount: tds, netPayable: amount - tds, panAvailable: data.pan_available, message: amount < sec.threshold ? `Amount below threshold of ₹${sec.threshold.toLocaleString('en-IN')} — TDS may not apply` : '' };
}

export function calcGratuity(data: any) {
    const salary = data.last_drawn_salary || 0;
    const years = data.years_of_service || 0;
    const covered = data.is_covered;
    const gratuity = covered ? Math.round(salary * 15 * years / 26) : Math.round(salary * 15 * years / 30);
    const exempt = Math.min(gratuity, 2000000);
    return { gratuityAmount: gratuity, exemptAmount: exempt, taxableGratuity: Math.max(0, gratuity - exempt), formula: covered ? '(Basic × 15 × Years) / 26' : '(Basic × 15 × Years) / 30', yearsOfService: years };
}

export function calcNPS(data: any) {
    const m = (data.monthly_contribution || 0) + (data.employer_contribution || 0);
    const r = (data.expected_return || 10) / 1200;
    const n = (data.years || 25) * 12;
    const corpus = r > 0 ? Math.round(m * ((Math.pow(1 + r, n) - 1) / r) * (1 + r)) : m * n;
    const invested = m * n;
    const annuity = Math.round(corpus * 0.40);
    const lumpsum = Math.round(corpus * 0.60);
    const tax80CCD = Math.min((data.monthly_contribution || 0) * 12, 50000);
    return { totalCorpus: corpus, totalInvested: invested, wealthGained: corpus - invested, annuityPortion40: annuity, lumpsumTaxFree60: lumpsum, monthlyPension: Math.round(annuity * 0.06 / 12), taxDeduction80CCD: tax80CCD };
}

export function calcCapitalGains(data: any) {
    const buy = data.purchase_price || 0;
    const sell = data.sale_price || 0;
    const months = data.holding_period_months || 0;
    const gain = sell - buy;
    const isEquity = ['Equity Shares', 'Equity MF'].includes(data.asset_type);
    const longTermMonths = isEquity ? 12 : 24;
    const isLong = months >= longTermMonths;
    const rate = isLong ? (isEquity ? 12.5 : 20) : (isEquity ? 20 : 30);
    const exemption = isLong && isEquity ? 125000 : 0;
    const taxableGain = Math.max(0, gain - exemption);
    const tax = Math.round(taxableGain * rate / 100);
    return { purchasePrice: buy, salePrice: sell, capitalGain: gain, holdingPeriod: `${months} months`, gainType: isLong ? 'Long Term' : 'Short Term', taxRate: `${rate}%`, section: isLong ? (isEquity ? '112A' : '112') : (isEquity ? '111A' : 'Normal'), exemption, taxableGain, capitalGainsTax: tax, cess: Math.round(tax * 0.04), totalTax: Math.round(tax * 1.04) };
}

export function calcFD(data: any) {
    const P = data.principal || 0;
    const r = (data.annual_rate || 0) / 100;
    const months = data.tenure_months || 12;
    const compMap: Record<string, number> = { monthly: 12, quarterly: 4, 'half-yearly': 2, annually: 1 };
    const n = compMap[data.compounding] || 4;
    const t = months / 12;
    const maturity = Math.round(P * Math.pow(1 + r / n, n * t));
    const interest = maturity - P;
    const tds = interest > 40000 ? Math.round(interest * 0.10) : 0;
    return { principal: P, maturityValue: maturity, totalInterest: interest, effectiveRate: P > 0 ? ((interest / P / t) * 100).toFixed(2) + '%' : '0%', tdsDeducted: tds, netInterest: interest - tds };
}

export function calcRD(data: any) {
    const m = data.monthly_deposit || 0;
    const r = (data.annual_rate || 0) / 400;
    const n = data.tenure_months || 60;
    const maturity = Math.round(m * ((Math.pow(1 + r, n) - 1) / (1 - Math.pow(1 + r, -1 / 3))));
    const invested = m * n;
    return { monthlyDeposit: m, maturityValue: maturity || invested, totalInvested: invested, totalInterest: (maturity || invested) - invested };
}

const DEPR_RATES: Record<string, { wdv: number; slm: number }> = {
    'Building - Residential': { wdv: 5, slm: 1.58 }, 'Building - Commercial': { wdv: 10, slm: 3.17 },
    'Furniture & Fittings': { wdv: 10, slm: 6.33 }, 'Plant & Machinery (General)': { wdv: 15, slm: 4.75 },
    'Motor Car': { wdv: 15, slm: 9.5 }, 'Computer/Software': { wdv: 40, slm: 16.21 },
    'Books (Annual)': { wdv: 40, slm: 16.21 }, 'Books (Professional)': { wdv: 40, slm: 16.21 },
    'Intangible Assets': { wdv: 25, slm: 8.45 },
};

export function calcDepreciation(data: any) {
    const cost = data.asset_cost || 0;
    const rates = DEPR_RATES[data.asset_type] || { wdv: 15, slm: 4.75 };
    const rate = data.method === 'WDV' ? rates.wdv : rates.slm;
    const years = data.years_to_calculate || 5;
    const schedule: any[] = [];
    let wdv = cost;
    for (let y = 1; y <= years; y++) {
        const dep = data.method === 'WDV' ? Math.round(wdv * rate / 100) : Math.round(cost * rate / 100);
        wdv -= dep;
        schedule.push({ year: y, openingWDV: wdv + dep, depreciation: dep, closingWDV: Math.max(0, wdv) });
    }
    return { assetCost: cost, method: data.method, rate: `${rate}%`, assetType: data.asset_type, totalDepreciation: schedule.reduce((s, r) => s + r.depreciation, 0), schedule };
}

export function calcRegimeOptimizer(data: any) {
    const income = (data.gross_salary || 0) + (data.other_income || 0);
    const oldDed = Math.min(data.section_80c || 0, 150000) + Math.min(data.section_80d_self || 0, 25000) + Math.min(data.section_80d_parents || 0, 50000) + (data.section_80e || 0) + Math.min(data.section_80tta || 0, 10000) + Math.min(data.home_loan_interest || 0, 200000) + Math.min(data.nps_80ccd || 0, 50000) + (data.hra_exemption || 0) + 50000 + (data.professional_tax || 2400);
    const oldTaxable = Math.max(0, income - oldDed);
    const newTaxable = Math.max(0, income - 75000);
    const oldTax = slabTax(oldTaxable, OLD_SLABS).tax;
    const newTax = slabTax(newTaxable, NEW_SLABS).tax;
    const oldCess = Math.round(oldTax * 0.04);
    const newCess = Math.round(newTax * 0.04);
    const oldRebate = oldTaxable <= 700000 ? Math.min(oldTax, 12500) : 0;
    const newRebate = newTaxable <= 1200000 ? Math.min(newTax, 60000) : 0;
    const oldTotal = Math.max(0, oldTax + oldCess - oldRebate);
    const newTotal = Math.max(0, newTax + newCess - newRebate);
    const rec = newTotal <= oldTotal ? 'NEW' : 'OLD';
    return {
        recommended: rec, savings: Math.abs(oldTotal - newTotal),
        oldRegime: { taxableIncome: oldTaxable, deductions: oldDed, tax: oldTax, cess: oldCess, totalTax: oldTotal },
        newRegime: { taxableIncome: newTaxable, deductions: 75000, tax: newTax, cess: newCess, totalTax: newTotal },
        message: `${rec} Regime saves ₹${Math.abs(oldTotal - newTotal).toLocaleString('en-IN')}. ${rec === 'NEW' ? 'No need for deduction investments.' : 'Your deductions of ₹' + oldDed.toLocaleString('en-IN') + ' make Old Regime better.'}`,
    };
}

export function calcAdvanceTax(data: any) {
    const liability = data.total_tax_liability || 0;
    const tds = data.tds_deducted || 0;
    const net = Math.max(0, liability - tds);
    if (net < 10000) return { totalLiability: liability, tdsDeducted: tds, netPayable: net, message: 'Advance tax not applicable — net liability below ₹10,000', schedule: [] };
    return {
        totalLiability: liability, tdsDeducted: tds, netPayable: net,
        schedule: [
            { instalment: 'Q1 (15 Jun)', percentage: '15%', amount: Math.round(net * 0.15), cumulative: '15%' },
            { instalment: 'Q2 (15 Sep)', percentage: '30%', amount: Math.round(net * 0.30), cumulative: '45%' },
            { instalment: 'Q3 (15 Dec)', percentage: '30%', amount: Math.round(net * 0.30), cumulative: '75%' },
            { instalment: 'Q4 (15 Mar)', percentage: '25%', amount: Math.round(net * 0.25), cumulative: '100%' },
        ],
    };
}

const PT_RATES: Record<string, { slabs: [number, number][]; max: number }> = {
    maharashtra: { slabs: [[7500, 0], [10000, 175], [Infinity, 200]], max: 2500 },
    karnataka: { slabs: [[15000, 0], [Infinity, 200]], max: 2400 },
    west_bengal: { slabs: [[10000, 0], [15000, 110], [25000, 130], [40000, 150], [Infinity, 200]], max: 2400 },
    tamil_nadu: { slabs: [[21000, 0], [30000, 100], [45000, 235], [60000, 510], [75000, 760], [Infinity, 1095]], max: 2500 },
    gujarat: { slabs: [[6000, 0], [9000, 80], [12000, 150], [Infinity, 200]], max: 2500 },
};

export function calcProfessionalTax(data: any) {
    const salary = data.monthly_salary || 0;
    const state = data.state || 'maharashtra';
    const info = PT_RATES[state] || PT_RATES.maharashtra;
    let monthlyTax = 0;
    for (const [limit, tax] of info.slabs) { if (salary <= limit) { monthlyTax = tax; break; } }
    return { monthlySalary: salary, state, monthlyTax, annualTax: Math.min(monthlyTax * 12, info.max), maxAnnual: info.max };
}

export function calcStampDuty(data: any) {
    const value = data.property_value || 0;
    const rates: Record<string, { stamp: number; reg: number; femaleDiscount: number }> = {
        maharashtra: { stamp: 5, reg: 1, femaleDiscount: 1 }, karnataka: { stamp: 5, reg: 1, femaleDiscount: 0 },
        delhi: { stamp: 6, reg: 1, femaleDiscount: 2 }, tamil_nadu: { stamp: 7, reg: 1, femaleDiscount: 0 },
        uttar_pradesh: { stamp: 7, reg: 1, femaleDiscount: 2 }, gujarat: { stamp: 4.9, reg: 1, femaleDiscount: 0 },
        rajasthan: { stamp: 5, reg: 1, femaleDiscount: 1 }, west_bengal: { stamp: 6, reg: 1, femaleDiscount: 1 },
        telangana: { stamp: 5, reg: 0.5, femaleDiscount: 0 }, kerala: { stamp: 8, reg: 2, femaleDiscount: 0 },
    };
    const r = rates[data.state] || rates.maharashtra;
    const stampRate = data.is_female ? Math.max(0, r.stamp - r.femaleDiscount) : r.stamp;
    const stampDuty = Math.round(value * stampRate / 100);
    const regFee = Math.round(value * r.reg / 100);
    return { propertyValue: value, stampDutyRate: `${stampRate}%`, stampDuty, registrationFee: regFee, totalCost: stampDuty + regFee, femaleDiscount: data.is_female ? `${r.femaleDiscount}% discount applied` : 'N/A' };
}

export function calcCryptoTax(data: any) {
    const buy = (data.buy_price || 0) * (data.quantity || 1);
    const sell = (data.sell_price || 0) * (data.quantity || 1);
    const gain = sell - buy;
    const tax = gain > 0 ? Math.round(gain * 0.30) : 0;
    const cess = Math.round(tax * 0.04);
    const tds1pct = Math.round(sell * 0.01);
    return { totalBuyValue: buy, totalSellValue: sell, capitalGain: gain, taxRate: '30% (Sec 115BBH)', incomeTax: tax, cess, totalTax: tax + cess, tds1Percent: tds1pct, netProfit: gain - tax - cess, note: 'No deduction except cost of acquisition. No set-off of losses allowed.' };
}
