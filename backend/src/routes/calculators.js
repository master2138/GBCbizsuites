const express = require('express');
const router = express.Router();

// Calculators are public (no auth required) for wider reach

// ── Income Tax Calculator (FY 2025-26) ───────────────
router.post('/income-tax', (req, res) => {
    try {
        const {
            gross_salary = 0,
            other_income = 0,
            hra_exemption = 0,
            section_80c = 0,
            section_80d = 0,
            section_80tta = 0,
            home_loan_interest = 0,
            nps_80ccd = 0,
            other_deductions = 0,
            age_group = 'below_60'
        } = req.body;

        const totalIncome = gross_salary + other_income;

        // ── Old Regime Calculation ──
        const oldDeductions = Math.min(section_80c, 150000) +
            Math.min(section_80d, age_group === 'below_60' ? 25000 : 50000) +
            Math.min(section_80tta, 10000) +
            Math.min(home_loan_interest, 200000) +
            Math.min(nps_80ccd, 50000) +
            other_deductions +
            hra_exemption;

        const standardDeductionOld = 75000;
        const oldTaxableIncome = Math.max(0, totalIncome - standardDeductionOld - oldDeductions);
        const oldTax = calculateOldRegimeTax(oldTaxableIncome, age_group);
        const oldCess = Math.round(oldTax * 0.04);

        // ── New Regime Calculation (FY 2025-26) ──
        const standardDeductionNew = 75000;
        const newTaxableIncome = Math.max(0, totalIncome - standardDeductionNew);
        const newTax = calculateNewRegimeTax(newTaxableIncome);
        const newCess = Math.round(newTax * 0.04);

        const recommendation = (oldTax + oldCess) <= (newTax + newCess) ? 'old_regime' : 'new_regime';
        const savings = Math.abs((oldTax + oldCess) - (newTax + newCess));

        res.json({
            totalIncome,
            old_regime: {
                taxableIncome: oldTaxableIncome,
                standardDeduction: standardDeductionOld,
                totalDeductions: oldDeductions + standardDeductionOld,
                tax: oldTax,
                cess: oldCess,
                totalTax: oldTax + oldCess,
                effectiveRate: totalIncome > 0 ? (((oldTax + oldCess) / totalIncome) * 100).toFixed(2) : '0.00',
                slabs: getOldRegimeSlabs(oldTaxableIncome, age_group),
            },
            new_regime: {
                taxableIncome: newTaxableIncome,
                standardDeduction: standardDeductionNew,
                tax: newTax,
                cess: newCess,
                totalTax: newTax + newCess,
                effectiveRate: totalIncome > 0 ? (((newTax + newCess) / totalIncome) * 100).toFixed(2) : '0.00',
                slabs: getNewRegimeSlabs(newTaxableIncome),
            },
            recommendation,
            savings,
        });
    } catch (err) {
        console.error('Income tax calc error:', err);
        res.status(500).json({ error: 'Calculation failed.' });
    }
});

// ── HRA Calculator ────────────────────────────────────
router.post('/hra', (req, res) => {
    try {
        const {
            basic_salary = 0,
            da = 0,
            hra_received = 0,
            rent_paid = 0,
            is_metro = false
        } = req.body;

        const basicPlusDa = basic_salary + da;
        const annualBasicPlusDa = basicPlusDa * 12;
        const annualHRA = hra_received * 12;
        const annualRent = rent_paid * 12;

        // HRA Exemption = Minimum of:
        // 1. Actual HRA received
        // 2. Rent paid - 10% of basic+DA
        // 3. 50% (metro) or 40% (non-metro) of basic+DA
        const option1 = annualHRA;
        const option2 = Math.max(0, annualRent - (0.10 * annualBasicPlusDa));
        const option3 = (is_metro ? 0.50 : 0.40) * annualBasicPlusDa;

        const exemption = Math.min(option1, option2, option3);
        const taxable = Math.max(0, annualHRA - exemption);

        res.json({
            monthly: {
                basicPlusDa: basicPlusDa,
                hra: hra_received,
                rent: rent_paid,
            },
            annual: {
                basicPlusDa: annualBasicPlusDa,
                hra: annualHRA,
                rent: annualRent,
            },
            calculation: {
                actualHRA: option1,
                rentMinus10Percent: option2,
                percentOfBasic: option3,
                percentUsed: is_metro ? '50%' : '40%',
            },
            exemption,
            taxableHRA: taxable,
            monthlySavings: Math.round(exemption / 12),
        });
    } catch (err) {
        res.status(500).json({ error: 'HRA calculation failed.' });
    }
});

// ── EMI Calculator ────────────────────────────────────
router.post('/emi', (req, res) => {
    try {
        const {
            principal = 0,
            annual_rate = 0,
            tenure_months = 0
        } = req.body;

        if (principal <= 0 || annual_rate <= 0 || tenure_months <= 0) {
            return res.status(400).json({ error: 'Principal, rate, and tenure must be positive values.' });
        }

        const monthlyRate = annual_rate / 12 / 100;
        const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure_months)) /
            (Math.pow(1 + monthlyRate, tenure_months) - 1);

        const totalPayment = emi * tenure_months;
        const totalInterest = totalPayment - principal;

        // Amortization schedule
        const schedule = [];
        let balance = principal;
        for (let month = 1; month <= tenure_months; month++) {
            const interest = balance * monthlyRate;
            const principalPart = emi - interest;
            balance = Math.max(0, balance - principalPart);
            schedule.push({
                month,
                emi: Math.round(emi),
                principal: Math.round(principalPart),
                interest: Math.round(interest),
                balance: Math.round(balance),
            });
        }

        res.json({
            emi: Math.round(emi),
            totalPayment: Math.round(totalPayment),
            totalInterest: Math.round(totalInterest),
            principal,
            annualRate: annual_rate,
            tenureMonths: tenure_months,
            interestToLoanRatio: ((totalInterest / principal) * 100).toFixed(2),
            schedule: schedule.length <= 60 ? schedule : schedule.filter((_, i) => i % 12 === 11 || i === 0), // Show yearly for long tenures
        });
    } catch (err) {
        res.status(500).json({ error: 'EMI calculation failed.' });
    }
});

// ── SIP Calculator ────────────────────────────────────
router.post('/sip', (req, res) => {
    try {
        const {
            monthly_investment = 0,
            expected_return_rate = 12,
            tenure_years = 0,
            step_up_percent = 0
        } = req.body;

        if (monthly_investment <= 0 || tenure_years <= 0) {
            return res.status(400).json({ error: 'Investment and tenure must be positive values.' });
        }

        const monthlyRate = expected_return_rate / 12 / 100;
        const totalMonths = tenure_years * 12;

        let totalInvested = 0;
        let futureValue = 0;
        let currentMonthly = monthly_investment;
        const yearlyBreakdown = [];

        for (let month = 1; month <= totalMonths; month++) {
            if (step_up_percent > 0 && month > 1 && (month - 1) % 12 === 0) {
                currentMonthly = Math.round(currentMonthly * (1 + step_up_percent / 100));
            }
            totalInvested += currentMonthly;
            futureValue = (futureValue + currentMonthly) * (1 + monthlyRate);

            if (month % 12 === 0) {
                yearlyBreakdown.push({
                    year: month / 12,
                    monthlyInvestment: currentMonthly,
                    totalInvested: Math.round(totalInvested),
                    futureValue: Math.round(futureValue),
                    gains: Math.round(futureValue - totalInvested),
                });
            }
        }

        const wealthGained = futureValue - totalInvested;

        res.json({
            monthlyInvestment: monthly_investment,
            expectedReturnRate: expected_return_rate,
            tenureYears: tenure_years,
            totalInvested: Math.round(totalInvested),
            futureValue: Math.round(futureValue),
            wealthGained: Math.round(wealthGained),
            xirr: expected_return_rate,
            yearlyBreakdown,
        });
    } catch (err) {
        res.status(500).json({ error: 'SIP calculation failed.' });
    }
});

// ── PPF Calculator ────────────────────────────────────
router.post('/ppf', (req, res) => {
    try {
        const {
            annual_investment = 0,
            tenure_years = 15,
            interest_rate = 7.1
        } = req.body;

        const cappedInvestment = Math.min(annual_investment, 150000); // PPF max ₹1.5L/year
        const yearlyBreakdown = [];
        let balance = 0;
        let totalInvested = 0;

        for (let year = 1; year <= tenure_years; year++) {
            totalInvested += cappedInvestment;
            const interest = (balance + cappedInvestment) * (interest_rate / 100);
            balance = balance + cappedInvestment + interest;
            yearlyBreakdown.push({
                year,
                investment: cappedInvestment,
                interest: Math.round(interest),
                balance: Math.round(balance),
                totalInvested,
            });
        }

        const totalInterest = balance - totalInvested;

        res.json({
            annualInvestment: cappedInvestment,
            interestRate: interest_rate,
            tenureYears: tenure_years,
            totalInvested: Math.round(totalInvested),
            totalInterest: Math.round(totalInterest),
            maturityValue: Math.round(balance),
            taxSaved80C: Math.round(cappedInvestment * 0.312), // ~31.2% tax bracket approx
            yearlyBreakdown,
        });
    } catch (err) {
        res.status(500).json({ error: 'PPF calculation failed.' });
    }
});

// ── GST Calculator ────────────────────────────────────
router.post('/gst', (req, res) => {
    try {
        const {
            amount = 0,
            gst_rate = 18,
            is_inclusive = false,
            is_inter_state = false
        } = req.body;

        let baseAmount, gstAmount, totalAmount;

        if (is_inclusive) {
            totalAmount = amount;
            baseAmount = (amount * 100) / (100 + gst_rate);
            gstAmount = totalAmount - baseAmount;
        } else {
            baseAmount = amount;
            gstAmount = (amount * gst_rate) / 100;
            totalAmount = baseAmount + gstAmount;
        }

        let cgst = 0, sgst = 0, igst = 0;
        if (is_inter_state) {
            igst = gstAmount;
        } else {
            cgst = gstAmount / 2;
            sgst = gstAmount / 2;
        }

        res.json({
            baseAmount: Math.round(baseAmount * 100) / 100,
            gstRate: gst_rate,
            gstAmount: Math.round(gstAmount * 100) / 100,
            totalAmount: Math.round(totalAmount * 100) / 100,
            isInclusive: is_inclusive,
            isInterState: is_inter_state,
            breakdown: {
                cgst: Math.round(cgst * 100) / 100,
                sgst: Math.round(sgst * 100) / 100,
                igst: Math.round(igst * 100) / 100,
                cgstRate: is_inter_state ? 0 : gst_rate / 2,
                sgstRate: is_inter_state ? 0 : gst_rate / 2,
                igstRate: is_inter_state ? gst_rate : 0,
            },
        });
    } catch (err) {
        res.status(500).json({ error: 'GST calculation failed.' });
    }
});

// ── Tax Helper Functions ──────────────────────────────

function calculateOldRegimeTax(income, ageGroup) {
    let exemptionLimit = 250000;
    if (ageGroup === '60_to_80') exemptionLimit = 300000;
    if (ageGroup === 'above_80') exemptionLimit = 500000;

    if (income <= exemptionLimit) return 0;

    let tax = 0;
    const slabs = [
        { min: exemptionLimit, max: 500000, rate: 0.05 },
        { min: 500000, max: 1000000, rate: 0.20 },
        { min: 1000000, max: Infinity, rate: 0.30 },
    ];

    for (const slab of slabs) {
        if (income > slab.min) {
            const taxable = Math.min(income, slab.max) - slab.min;
            tax += taxable * slab.rate;
        }
    }

    // Rebate u/s 87A (old regime up to 5L)
    if (income <= 500000) tax = 0;

    return Math.round(tax);
}

function calculateNewRegimeTax(income) {
    if (income <= 400000) return 0;

    let tax = 0;
    const slabs = [
        { min: 400000, max: 800000, rate: 0.05 },
        { min: 800000, max: 1200000, rate: 0.10 },
        { min: 1200000, max: 1600000, rate: 0.15 },
        { min: 1600000, max: 2000000, rate: 0.20 },
        { min: 2000000, max: 2400000, rate: 0.25 },
        { min: 2400000, max: Infinity, rate: 0.30 },
    ];

    for (const slab of slabs) {
        if (income > slab.min) {
            const taxable = Math.min(income, slab.max) - slab.min;
            tax += taxable * slab.rate;
        }
    }

    // Rebate u/s 87A (new regime up to ₹12L taxable income → marginal relief up to ₹12.75L)
    if (income <= 1200000) {
        tax = 0;
    } else if (income <= 1275000) {
        // Marginal relief: tax cannot exceed the income above ₹12L
        const excess = income - 1200000;
        tax = Math.min(tax, excess);
    }

    return Math.round(tax);
}

function getOldRegimeSlabs(income, ageGroup) {
    let exemptionLimit = 250000;
    if (ageGroup === '60_to_80') exemptionLimit = 300000;
    if (ageGroup === 'above_80') exemptionLimit = 500000;

    return [
        { range: `Up to ₹${(exemptionLimit / 100000).toFixed(1)}L`, rate: '0%', tax: 0 },
        { range: `₹${(exemptionLimit / 100000).toFixed(1)}L - ₹5L`, rate: '5%', tax: Math.max(0, Math.min(income, 500000) - exemptionLimit) * 0.05 },
        { range: '₹5L - ₹10L', rate: '20%', tax: income > 500000 ? Math.max(0, Math.min(income, 1000000) - 500000) * 0.20 : 0 },
        { range: 'Above ₹10L', rate: '30%', tax: income > 1000000 ? (income - 1000000) * 0.30 : 0 },
    ];
}

function getNewRegimeSlabs(income) {
    return [
        { range: 'Up to ₹4L', rate: '0%', tax: 0 },
        { range: '₹4L - ₹8L', rate: '5%', tax: income > 400000 ? Math.min(income, 800000) - 400000 : 0 },
        { range: '₹8L - ₹12L', rate: '10%', tax: income > 800000 ? (Math.min(income, 1200000) - 800000) * 0.10 : 0 },
        { range: '₹12L - ₹16L', rate: '15%', tax: income > 1200000 ? (Math.min(income, 1600000) - 1200000) * 0.15 : 0 },
        { range: '₹16L - ₹20L', rate: '20%', tax: income > 1600000 ? (Math.min(income, 2000000) - 1600000) * 0.20 : 0 },
        { range: '₹20L - ₹24L', rate: '25%', tax: income > 2000000 ? (Math.min(income, 2400000) - 2000000) * 0.25 : 0 },
        { range: 'Above ₹24L', rate: '30%', tax: income > 2400000 ? (income - 2400000) * 0.30 : 0 },
    ];
}

// ── TDS Calculator ────────────────────────────────────
const TDS_SECTIONS = {
    '194A': { desc: 'Interest (other than securities)', rate: 10, threshold: 40000 },
    '194C_IND': { desc: 'Contractor Payment (Individual)', rate: 1, threshold: 30000 },
    '194C_OTH': { desc: 'Contractor Payment (Others)', rate: 2, threshold: 30000 },
    '194H': { desc: 'Commission / Brokerage', rate: 5, threshold: 15000 },
    '194I_LAND': { desc: 'Rent - Land/Building', rate: 10, threshold: 240000 },
    '194I_EQUIP': { desc: 'Rent - Plant/Machinery', rate: 2, threshold: 240000 },
    '194J_TECH': { desc: 'Technical Services', rate: 2, threshold: 30000 },
    '194J_PROF': { desc: 'Professional Services', rate: 10, threshold: 30000 },
    '194Q': { desc: 'Purchase of Goods', rate: 0.1, threshold: 5000000 },
    '194R': { desc: 'Benefits/Perquisites', rate: 10, threshold: 20000 },
    '194S': { desc: 'Crypto/VDA Transfer', rate: 1, threshold: 50000 },
    '192': { desc: 'Salary', rate: 0, threshold: 0 },
};

router.post('/tds', (req, res) => {
    try {
        const { section, amount, pan_available = true } = req.body;
        const sec = TDS_SECTIONS[section];
        if (!sec) return res.status(400).json({ error: 'Invalid TDS section.' });

        const rate = pan_available ? sec.rate : 20; // 20% if PAN not available
        const isAboveThreshold = amount > sec.threshold;
        const tdsAmount = isAboveThreshold ? Math.round(amount * rate / 100) : 0;

        res.json({
            section, description: sec.desc, amount, threshold: sec.threshold,
            rate, panAvailable: pan_available, isAboveThreshold, tdsAmount,
            netPayable: amount - tdsAmount,
            allSections: Object.entries(TDS_SECTIONS).map(([k, v]) => ({ section: k, ...v })),
        });
    } catch (err) { res.status(500).json({ error: 'TDS calculation failed.' }); }
});

// ── Gratuity Calculator ──────────────────────────────────
router.post('/gratuity', (req, res) => {
    try {
        const { last_drawn_salary, years_of_service, is_covered = true } = req.body;
        if (years_of_service < 5) return res.json({ eligible: false, message: 'Minimum 5 years of service required.', gratuity: 0 });

        const gratuity = is_covered
            ? Math.round(last_drawn_salary * 15 * years_of_service / 26)
            : Math.round(last_drawn_salary * 15 * years_of_service / 30);

        const taxFreeLimit = 2000000; // ₹20L
        const taxableGratuity = Math.max(0, gratuity - taxFreeLimit);

        res.json({
            eligible: true, lastDrawnSalary: last_drawn_salary, yearsOfService: years_of_service,
            isCovered: is_covered, formula: is_covered ? '(Salary × 15 × Years) / 26' : '(Salary × 15 × Years) / 30',
            gratuity, taxFreeLimit, taxableGratuity, taxFreeAmount: Math.min(gratuity, taxFreeLimit),
        });
    } catch (err) { res.status(500).json({ error: 'Gratuity calculation failed.' }); }
});

// ── NPS Calculator (80CCD) ──────────────────────────────
router.post('/nps', (req, res) => {
    try {
        const { monthly_contribution, employer_contribution = 0, expected_return = 10,
            current_age, retirement_age = 60, annuity_percent = 40 } = req.body;

        const years = retirement_age - current_age;
        const monthlyRate = expected_return / 12 / 100;
        const months = years * 12;

        const totalSelfContribution = monthly_contribution * months;
        const totalEmployerContribution = employer_contribution * months;

        // FV of annuity
        const fv = monthly_contribution * (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate * (1 + monthlyRate);
        const employerFV = employer_contribution > 0 ? employer_contribution * (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate * (1 + monthlyRate) : 0;
        const totalCorpus = fv + employerFV;

        const annuityCorpus = totalCorpus * annuity_percent / 100;
        const lumpSumWithdrawal = totalCorpus - annuityCorpus;

        // Tax benefits
        const sec80CCD_1 = Math.min(monthly_contribution * 12, 150000); // within 80C limit
        const sec80CCD_1B = Math.min(monthly_contribution * 12, 50000); // additional ₹50K
        const sec80CCD_2 = employer_contribution * 12; // no limit (up to 10% of salary)

        res.json({
            monthlyContribution: monthly_contribution, employerContribution: employer_contribution,
            yearsToRetirement: years, expectedReturn: expected_return,
            totalSelfContribution: Math.round(totalSelfContribution),
            totalEmployerContribution: Math.round(totalEmployerContribution),
            totalInvestment: Math.round(totalSelfContribution + totalEmployerContribution),
            estimatedCorpus: Math.round(totalCorpus),
            wealthGained: Math.round(totalCorpus - totalSelfContribution - totalEmployerContribution),
            annuityCorpus: Math.round(annuityCorpus), annuityPercent: annuity_percent,
            lumpSumWithdrawal: Math.round(lumpSumWithdrawal),
            taxBenefit: { sec80CCD_1, sec80CCD_1B, sec80CCD_2, total: sec80CCD_1 + sec80CCD_1B + sec80CCD_2 },
        });
    } catch (err) { res.status(500).json({ error: 'NPS calculation failed.' }); }
});

// ── Capital Gains Calculator (LTCG/STCG) ─────────────────
router.post('/capital-gains', (req, res) => {
    try {
        const { asset_type, purchase_price, sale_price, purchase_date, sale_date,
            improvement_cost = 0, transfer_cost = 0 } = req.body;

        const pDate = new Date(purchase_date);
        const sDate = new Date(sale_date);
        const holdingMonths = (sDate.getFullYear() - pDate.getFullYear()) * 12 + sDate.getMonth() - pDate.getMonth();

        // Holding period thresholds
        const ltcgThreshold = asset_type === 'PROPERTY' ? 24 : asset_type === 'EQUITY' ? 12 : asset_type === 'DEBT_MF' ? 36 : 36;
        const isLongTerm = holdingMonths >= ltcgThreshold;

        const totalCost = purchase_price + improvement_cost + transfer_cost;
        const capitalGain = sale_price - totalCost;

        let tax = 0;
        let taxRate = 0;
        let exemption = 0;

        if (isLongTerm) {
            if (asset_type === 'EQUITY' || asset_type === 'EQUITY_MF') {
                exemption = Math.min(capitalGain, 125000); // ₹1.25L exemption
                tax = Math.round((capitalGain - exemption) * 0.125); // 12.5%
                taxRate = 12.5;
            } else {
                tax = Math.round(capitalGain * 0.125); // 12.5% new rate
                taxRate = 12.5;
            }
        } else {
            if (asset_type === 'EQUITY' || asset_type === 'EQUITY_MF') {
                taxRate = 20;
            } else {
                taxRate = 30; // Added to income, taxed at slab
            }
            tax = Math.round(capitalGain * taxRate / 100);
        }

        const cess = Math.round(tax * 0.04);

        res.json({
            assetType: asset_type, holdingMonths, holdingPeriod: `${Math.floor(holdingMonths / 12)}y ${holdingMonths % 12}m`,
            isLongTerm, ltcgThreshold: `${ltcgThreshold} months`,
            purchasePrice: purchase_price, salePrice: sale_price,
            improvementCost: improvement_cost, transferCost: transfer_cost,
            totalCost, capitalGain, exemption, taxableGain: capitalGain - exemption,
            taxRate, tax, cess, totalTax: tax + cess,
            netProfit: capitalGain - tax - cess,
        });
    } catch (err) { res.status(500).json({ error: 'Capital gains calculation failed.' }); }
});

// ── Fixed Deposit Calculator ─────────────────────────────
router.post('/fd', (req, res) => {
    try {
        const { principal, annual_rate, tenure_months, compounding = 'quarterly' } = req.body;

        const compFreq = compounding === 'monthly' ? 12 : compounding === 'quarterly' ? 4 : compounding === 'half_yearly' ? 2 : 1;
        const r = annual_rate / 100 / compFreq;
        const n = tenure_months / 12 * compFreq;

        const maturityAmount = Math.round(principal * Math.pow(1 + r, n));
        const totalInterest = maturityAmount - principal;

        // Year-wise breakdown
        const yearlyBreakdown = [];
        for (let yr = 1; yr <= Math.ceil(tenure_months / 12); yr++) {
            const periods = Math.min(yr * compFreq, n);
            const amount = Math.round(principal * Math.pow(1 + r, periods));
            yearlyBreakdown.push({ year: yr, amount, interest: amount - principal });
        }

        // TDS applicable if interest > ₹40K (₹50K for seniors)
        const tdsApplicable = totalInterest > 40000;
        const tdsAmount = tdsApplicable ? Math.round(totalInterest * 0.1) : 0;

        res.json({
            principal, annualRate: annual_rate, tenureMonths: tenure_months,
            compounding, maturityAmount, totalInterest,
            effectiveRate: ((Math.pow(1 + r, compFreq) - 1) * 100).toFixed(2),
            tdsApplicable, tdsAmount, netInterest: totalInterest - tdsAmount,
            yearlyBreakdown,
        });
    } catch (err) { res.status(500).json({ error: 'FD calculation failed.' }); }
});

// ── Recurring Deposit Calculator ─────────────────────────
router.post('/rd', (req, res) => {
    try {
        const { monthly_deposit, annual_rate, tenure_months } = req.body;

        const r = annual_rate / 400; // Quarterly rate
        const n = tenure_months;

        // RD maturity formula
        let maturityAmount = 0;
        for (let i = 1; i <= n; i++) {
            maturityAmount += monthly_deposit * Math.pow(1 + r, (n - i + 1) / 3);
        }
        maturityAmount = Math.round(maturityAmount);

        const totalInvested = monthly_deposit * tenure_months;
        const totalInterest = maturityAmount - totalInvested;

        res.json({
            monthlyDeposit: monthly_deposit, annualRate: annual_rate, tenureMonths: tenure_months,
            totalInvested, maturityAmount, totalInterest,
            effectiveReturn: ((totalInterest / totalInvested) * 100).toFixed(2),
        });
    } catch (err) { res.status(500).json({ error: 'RD calculation failed.' }); }
});

// ── Depreciation Calculator ──────────────────────────────
const DEPRECIATION_RATES_IT = {
    'Building - Residential': 5, 'Building - Commercial': 10, 'Furniture & Fittings': 10,
    'Plant & Machinery (General)': 15, 'Motor Car': 15, 'Computer/Software': 40,
    'Books (Annual)': 40, 'Books (Professional)': 60, 'Pollution Control': 100,
    'Scientific Research': 100, 'Intangible Assets': 25,
};

router.post('/depreciation', (req, res) => {
    try {
        const { asset_cost, asset_type = 'Plant & Machinery (General)', method = 'WDV',
            useful_life_years, salvage_value = 0, years_to_calculate = 10 } = req.body;

        const rate = DEPRECIATION_RATES_IT[asset_type] || 15;
        const schedule = [];
        let openingWDV = asset_cost;

        if (method === 'WDV') {
            // Written Down Value method (IT Act)
            for (let yr = 1; yr <= years_to_calculate; yr++) {
                const dep = Math.round(openingWDV * rate / 100);
                const closingWDV = openingWDV - dep;
                schedule.push({ year: yr, openingWDV: Math.round(openingWDV), depreciation: dep, closingWDV: Math.round(closingWDV), rate });
                openingWDV = closingWDV;
                if (openingWDV < 1) break;
            }
        } else {
            // Straight Line Method (Companies Act)
            const annualDep = Math.round((asset_cost - salvage_value) / (useful_life_years || 10));
            for (let yr = 1; yr <= (useful_life_years || 10); yr++) {
                const dep = Math.min(annualDep, openingWDV - salvage_value);
                const closingWDV = openingWDV - dep;
                schedule.push({ year: yr, openingWDV: Math.round(openingWDV), depreciation: dep, closingWDV: Math.round(closingWDV), rate: ((annualDep / asset_cost) * 100).toFixed(2) });
                openingWDV = closingWDV;
                if (openingWDV <= salvage_value) break;
            }
        }

        const totalDepreciation = schedule.reduce((s, r) => s + r.depreciation, 0);

        res.json({
            assetCost: asset_cost, assetType: asset_type, method,
            rate: method === 'WDV' ? rate : ((asset_cost - salvage_value) / (useful_life_years || 10) / asset_cost * 100).toFixed(2),
            salvageValue: salvage_value, totalDepreciation, netBookValue: asset_cost - totalDepreciation,
            schedule,
            availableAssets: Object.entries(DEPRECIATION_RATES_IT).map(([name, rate]) => ({ name, rate })),
        });
    } catch (err) { res.status(500).json({ error: 'Depreciation calculation failed.' }); }
});

// ── Old vs New Regime Tax Optimizer ──────────────────────
router.post('/regime-optimizer', (req, res) => {
    try {
        const {
            gross_salary = 0, other_income = 0, hra_exemption = 0,
            lta = 0, professional_tax = 0,
            section_80c = 0, section_80d_self = 0, section_80d_parents = 0,
            section_80e = 0, section_80tta = 0,
            home_loan_interest = 0, nps_80ccd = 0, nps_employer = 0,
            other_deductions = 0, age_group = 'below_60'
        } = req.body;

        const totalIncome = gross_salary + other_income;

        // Standard deduction
        const oldStdDeduction = 50000;
        const newStdDeduction = 75000;

        // Old regime deductions
        const old80c = Math.min(section_80c, 150000);
        const old80dSelf = Math.min(section_80d_self, age_group === 'below_60' ? 25000 : 50000);
        const old80dParents = Math.min(section_80d_parents, 50000);
        const old80e = section_80e; // no cap
        const old80tta = Math.min(section_80tta, 10000);
        const oldHL = Math.min(home_loan_interest, 200000);
        const oldNPS = Math.min(nps_80ccd, 50000);
        const oldNPSEmp = Math.min(nps_employer, gross_salary * 0.1);
        const oldPT = Math.min(professional_tax, 2500);

        const totalOldDeductions = oldStdDeduction + hra_exemption + lta + oldPT +
            old80c + old80dSelf + old80dParents + old80e + old80tta + oldHL + oldNPS + oldNPSEmp + other_deductions;

        const oldTaxableIncome = Math.max(0, totalIncome - totalOldDeductions);

        // New regime deductions (only std deduction + employer NPS + professional tax)
        const newNPSEmp = Math.min(nps_employer, gross_salary * 0.14);
        const totalNewDeductions = newStdDeduction + newNPSEmp;
        const newTaxableIncome = Math.max(0, totalIncome - totalNewDeductions);

        // Old regime slabs
        function calcOldTax(income) {
            const exemption = age_group === 'below_60' ? 250000 : age_group === '60_to_80' ? 300000 : 500000;
            if (income <= exemption) return 0;
            let tax = 0;
            const slabs = age_group === 'super_senior' ?
                [[500000, 0], [1000000, 0.2], [Infinity, 0.3]] :
                age_group === '60_to_80' ?
                    [[300000, 0], [500000, 0.05], [1000000, 0.2], [Infinity, 0.3]] :
                    [[250000, 0], [500000, 0.05], [1000000, 0.2], [Infinity, 0.3]];
            let prev = 0;
            for (const [limit, rate] of slabs) {
                const taxable = Math.min(income, limit) - prev;
                if (taxable > 0) tax += taxable * rate;
                prev = limit;
                if (income <= limit) break;
            }
            // 87A rebate old regime
            if (income <= 500000) tax = 0;
            return tax;
        }

        // New regime slabs (FY 2025-26)
        function calcNewTax(income) {
            if (income <= 400000) return 0;
            let tax = 0;
            const slabs = [[400000, 0], [800000, 0.05], [1200000, 0.10], [1600000, 0.15], [2000000, 0.20], [2400000, 0.25], [Infinity, 0.30]];
            let prev = 0;
            for (const [limit, rate] of slabs) {
                const taxable = Math.min(income, limit) - prev;
                if (taxable > 0) tax += taxable * rate;
                prev = limit;
                if (income <= limit) break;
            }
            // 87A rebate new regime
            if (income <= 1200000) tax = 0;
            return tax;
        }

        const oldTax = calcOldTax(oldTaxableIncome);
        const newTax = calcNewTax(newTaxableIncome);
        const oldCess = oldTax * 0.04;
        const newCess = newTax * 0.04;
        const oldTotal = Math.round(oldTax + oldCess);
        const newTotal = Math.round(newTax + newCess);
        const savings = Math.abs(oldTotal - newTotal);
        const recommended = oldTotal <= newTotal ? 'OLD' : 'NEW';

        res.json({
            grossIncome: totalIncome,
            oldRegime: {
                deductions: totalOldDeductions,
                taxableIncome: oldTaxableIncome,
                tax: Math.round(oldTax),
                cess: Math.round(oldCess),
                totalTax: oldTotal,
                deductionBreakdown: {
                    standardDeduction: oldStdDeduction, hra: hra_exemption, lta,
                    professionalTax: oldPT, section80C: old80c, section80D_Self: old80dSelf,
                    section80D_Parents: old80dParents, section80E: old80e, section80TTA: old80tta,
                    homeLoanInterest: oldHL, nps80CCD: oldNPS, npsEmployer: oldNPSEmp,
                    other: other_deductions,
                },
            },
            newRegime: {
                deductions: totalNewDeductions,
                taxableIncome: newTaxableIncome,
                tax: Math.round(newTax),
                cess: Math.round(newCess),
                totalTax: newTotal,
                deductionBreakdown: { standardDeduction: newStdDeduction, npsEmployer: newNPSEmp },
            },
            recommended,
            savings,
            message: recommended === 'OLD'
                ? `Old Regime saves you ₹${savings.toLocaleString('en-IN')} — your deductions exceed the new regime benefit.`
                : `New Regime saves you ₹${savings.toLocaleString('en-IN')} — lower slab rates offset the deduction loss.`,
        });
    } catch (err) {
        console.error('Regime optimizer error:', err);
        res.status(500).json({ error: 'Regime optimization failed.' });
    }
});

// ── Advance Tax Calculator (Quarterly) ───────────────
router.post('/advance-tax', (req, res) => {
    try {
        const { total_tax_liability = 0, tds_deducted = 0 } = req.body;
        const netLiability = Math.max(total_tax_liability - tds_deducted, 0);

        // Quarterly instalments: 15%, 45%, 75%, 100%
        const q1 = Math.round(netLiability * 0.15);
        const q2 = Math.round(netLiability * 0.45) - q1;
        const q3 = Math.round(netLiability * 0.75) - q1 - q2;
        const q4 = netLiability - q1 - q2 - q3;

        res.json({
            totalTaxLiability: total_tax_liability,
            tdsDeducted: tds_deducted,
            netLiability,
            instalments: [
                { quarter: 'Q1 (Jun 15)', cumPercent: '15%', amount: q1 },
                { quarter: 'Q2 (Sep 15)', cumPercent: '45%', amount: q2 },
                { quarter: 'Q3 (Dec 15)', cumPercent: '75%', amount: q3 },
                { quarter: 'Q4 (Mar 15)', cumPercent: '100%', amount: q4 },
            ],
            note: netLiability < 10000 ? 'No advance tax required (liability < ₹10,000)' : 'Advance tax applicable',
        });
    } catch (err) {
        res.status(500).json({ error: 'Advance tax calculation failed.' });
    }
});

// ── Professional Tax Calculator ──────────────────────
router.post('/professional-tax', (req, res) => {
    try {
        const { monthly_salary = 0, state = 'maharashtra' } = req.body;

        const rates = {
            maharashtra: [
                { min: 0, max: 7500, tax: 0 },
                { min: 7501, max: 10000, tax: 175 },
                { min: 10001, max: Infinity, tax: 200 }, // Feb: 300
            ],
            karnataka: [
                { min: 0, max: 15000, tax: 0 },
                { min: 15001, max: Infinity, tax: 200 },
            ],
            west_bengal: [
                { min: 0, max: 10000, tax: 0 },
                { min: 10001, max: 15000, tax: 110 },
                { min: 15001, max: 25000, tax: 130 },
                { min: 25001, max: 40000, tax: 150 },
                { min: 40001, max: Infinity, tax: 200 },
            ],
            tamil_nadu: [
                { min: 0, max: 21000, tax: 0 },
                { min: 21001, max: 30000, tax: 135 },
                { min: 30001, max: 45000, tax: 315 },
                { min: 45001, max: 60000, tax: 690 },
                { min: 60001, max: 75000, tax: 1025 },
                { min: 75001, max: Infinity, tax: 1250 },
            ],
            gujarat: [
                { min: 0, max: 5999, tax: 0 },
                { min: 6000, max: 8999, tax: 80 },
                { min: 9000, max: 11999, tax: 150 },
                { min: 12000, max: Infinity, tax: 200 },
            ],
        };

        const stateRates = rates[state] || rates['maharashtra'];
        const slab = stateRates.find(s => monthly_salary >= s.min && monthly_salary <= s.max) || { tax: 200 };
        const monthlyTax = slab.tax;
        const annualTax = monthlyTax * 12;

        res.json({
            monthlySalary: monthly_salary,
            state,
            monthlyTax,
            annualTax,
            maxAllowed: 2500,
            deductibleUnder: 'Section 16(iii)',
        });
    } catch (err) {
        res.status(500).json({ error: 'Professional tax calculation failed.' });
    }
});

// ── Stamp Duty Calculator ────────────────────────────
router.post('/stamp-duty', (req, res) => {
    try {
        const { property_value = 0, state = 'maharashtra', property_type = 'residential', is_female = false } = req.body;

        const rates = {
            maharashtra: { residential: 5, commercial: 6, female_discount: 1 },
            karnataka: { residential: 5, commercial: 5, female_discount: 0 },
            delhi: { residential: 4, commercial: 6, female_discount: 2 },
            tamil_nadu: { residential: 7, commercial: 7, female_discount: 0 },
            uttar_pradesh: { residential: 5, commercial: 5, female_discount: 2 },
            gujarat: { residential: 4.9, commercial: 4.9, female_discount: 0 },
            rajasthan: { residential: 5, commercial: 5, female_discount: 1 },
            west_bengal: { residential: 5, commercial: 6, female_discount: 2 },
            telangana: { residential: 5, commercial: 5, female_discount: 0 },
            kerala: { residential: 8, commercial: 8, female_discount: 0 },
        };

        const stateRate = rates[state] || rates['maharashtra'];
        let dutyRate = stateRate[property_type] || stateRate['residential'];
        if (is_female && stateRate.female_discount) dutyRate -= stateRate.female_discount;
        dutyRate = Math.max(dutyRate, 0);

        const registrationFee = Math.min(property_value * 0.01, 30000);
        const stampDuty = Math.round(property_value * (dutyRate / 100));

        res.json({
            propertyValue: property_value,
            state,
            propertyType: property_type,
            isFemale: is_female,
            stampDutyRate: dutyRate,
            stampDutyAmount: stampDuty,
            registrationFee: Math.round(registrationFee),
            totalCost: stampDuty + Math.round(registrationFee),
        });
    } catch (err) {
        res.status(500).json({ error: 'Stamp duty calculation failed.' });
    }
});

// ── Crypto / VDA Tax Calculator (Section 115BBH) ─────
router.post('/crypto-tax', (req, res) => {
    try {
        const { buy_price = 0, sell_price = 0, quantity = 0 } = req.body;
        const totalBuy = buy_price * quantity;
        const totalSell = sell_price * quantity;
        const profit = totalSell - totalBuy;

        // 30% flat tax on gains, no deductions allowed (Section 115BBH)
        const taxRate = 0.30;
        const tax = profit > 0 ? Math.round(profit * taxRate) : 0;
        const cess = Math.round(tax * 0.04);
        const tds = Math.round(totalSell * 0.01); // 1% TDS on sale (Section 194S)

        res.json({
            buyPrice: buy_price,
            sellPrice: sell_price,
            quantity,
            totalBuyCost: totalBuy,
            totalSaleValue: totalSell,
            profit: Math.max(profit, 0),
            loss: profit < 0 ? Math.abs(profit) : 0,
            taxRate: '30%',
            tax,
            cess,
            totalTax: tax + cess,
            tdsOnSale: tds,
            netTaxPayable: Math.max(tax + cess - tds, 0),
            note: profit <= 0 ? 'No tax on losses. Losses cannot be set off against other income.' : 'Flat 30% tax + 4% cess. No deductions allowed except cost of acquisition.',
        });
    } catch (err) {
        res.status(500).json({ error: 'Crypto tax calculation failed.' });
    }
});

module.exports = router;


