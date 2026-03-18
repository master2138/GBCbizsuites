const express = require('express');
const router = express.Router();

/**
 * GSTIN Verifier
 * Validates GSTIN format and computes check digit.
 * GSTIN Format: 2 digits state code + 10 char PAN + 1 entity code + 1 Z (default) + 1 check digit
 * Example: 27AAPFU0939F1ZV
 */

// ── Verify GSTIN ─────────────────────────────────────
router.get('/verify/:gstin', (req, res) => {
    try {
        const gstin = (req.params.gstin || '').toUpperCase().trim();

        if (!gstin) {
            return res.status(400).json({ error: 'GSTIN is required.', valid: false });
        }

        const result = validateGSTIN(gstin);
        res.json(result);
    } catch (err) {
        console.error('GSTIN verify error:', err);
        res.status(500).json({ error: 'Verification failed.', valid: false });
    }
});

// ── Bulk Verify ──────────────────────────────────────
router.post('/verify-bulk', (req, res) => {
    try {
        const { gstins = [] } = req.body;

        if (!Array.isArray(gstins) || gstins.length === 0) {
            return res.status(400).json({ error: 'Provide an array of GSTINs.' });
        }

        if (gstins.length > 50) {
            return res.status(400).json({ error: 'Maximum 50 GSTINs per request.' });
        }

        const results = gstins.map(g => validateGSTIN((g || '').toUpperCase().trim()));
        const validCount = results.filter(r => r.valid).length;

        res.json({
            total: results.length,
            valid: validCount,
            invalid: results.length - validCount,
            results,
        });
    } catch (err) {
        console.error('Bulk verify error:', err);
        res.status(500).json({ error: 'Bulk verification failed.' });
    }
});

// ── State Code Lookup ────────────────────────────────
router.get('/states', (req, res) => {
    res.json({ states: STATE_CODES });
});

// ── Validation Logic ─────────────────────────────────

const STATE_CODES = {
    '01': 'Jammu & Kashmir', '02': 'Himachal Pradesh', '03': 'Punjab',
    '04': 'Chandigarh', '05': 'Uttarakhand', '06': 'Haryana',
    '07': 'Delhi', '08': 'Rajasthan', '09': 'Uttar Pradesh',
    '10': 'Bihar', '11': 'Sikkim', '12': 'Arunachal Pradesh',
    '13': 'Nagaland', '14': 'Manipur', '15': 'Mizoram',
    '16': 'Tripura', '17': 'Meghalaya', '18': 'Assam',
    '19': 'West Bengal', '20': 'Jharkhand', '21': 'Odisha',
    '22': 'Chhattisgarh', '23': 'Madhya Pradesh', '24': 'Gujarat',
    '25': 'Daman & Diu', '26': 'Dadra & Nagar Haveli',
    '27': 'Maharashtra', '28': 'Andhra Pradesh (Old)',
    '29': 'Karnataka', '30': 'Goa', '31': 'Lakshadweep',
    '32': 'Kerala', '33': 'Tamil Nadu', '34': 'Puducherry',
    '35': 'Andaman & Nicobar', '36': 'Telangana',
    '37': 'Andhra Pradesh', '38': 'Ladakh',
    '97': 'Other Territory',
};

function validateGSTIN(gstin) {
    const result = {
        gstin,
        valid: false,
        errors: [],
        details: null,
    };

    // Length check
    if (gstin.length !== 15) {
        result.errors.push('GSTIN must be exactly 15 characters.');
        return result;
    }

    // Format check: 2 digits + 5 alpha + 4 digits + 1 alpha + 1 alphanumeric + Z + 1 alphanumeric
    const formatRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}Z[A-Z0-9]{1}$/;
    if (!formatRegex.test(gstin)) {
        result.errors.push('Invalid GSTIN format. Expected: 2-digit state code + 10-char PAN + entity code + Z + check digit.');
        return result;
    }

    // State code validation
    const stateCode = gstin.substring(0, 2);
    if (!STATE_CODES[stateCode]) {
        result.errors.push(`Invalid state code: ${stateCode}`);
        return result;
    }

    // Extract PAN
    const pan = gstin.substring(2, 12);
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(pan)) {
        result.errors.push('Invalid PAN embedded in GSTIN.');
        return result;
    }

    // PAN 4th character indicates entity type
    const entityTypes = {
        'A': 'Association of Persons (AOP)',
        'B': 'Body of Individuals (BOI)',
        'C': 'Company',
        'F': 'Firm / LLP',
        'G': 'Government',
        'H': 'Hindu Undivided Family (HUF)',
        'J': 'Artificial Juridical Person',
        'L': 'Local Authority',
        'P': 'Individual (Person)',
        'T': 'Trust',
        'K': 'Krishi / Farmer',
    };

    const entityCode = pan.charAt(3);
    const entityType = entityTypes[entityCode] || 'Unknown';

    // Check digit validation
    const computedCheckDigit = computeGSTINCheckDigit(gstin.substring(0, 14));
    const actualCheckDigit = gstin.charAt(14);

    if (computedCheckDigit && computedCheckDigit !== actualCheckDigit) {
        result.errors.push(`Check digit mismatch. Expected: ${computedCheckDigit}, Found: ${actualCheckDigit}`);
        return result;
    }

    result.valid = true;
    result.details = {
        gstin,
        state_code: stateCode,
        state_name: STATE_CODES[stateCode],
        pan,
        pan_holder_type: entityType,
        entity_number: gstin.charAt(12),
        entity_type: entityType,
        check_digit: actualCheckDigit,
        check_digit_valid: !computedCheckDigit || computedCheckDigit === actualCheckDigit,
    };

    return result;
}

function computeGSTINCheckDigit(gstin14) {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let factor = 1;
    let total = 0;

    for (let i = 0; i < 14; i++) {
        const idx = chars.indexOf(gstin14.charAt(i));
        if (idx === -1) return null;

        let product = (idx * factor);
        let quotient = Math.floor(product / 36);
        let remainder = product % 36;
        total += quotient + remainder;
        factor = factor === 1 ? 2 : 1;
    }

    const remainder = total % 36;
    const checkDigitIdx = (36 - remainder) % 36;
    return chars.charAt(checkDigitIdx);
}

module.exports = router;
