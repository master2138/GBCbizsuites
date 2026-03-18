// Test Kotak amount extraction logic - v2 with first-group truncation
function extractAmounts(text) {
    const results = [];
    // Greedily match any digits+commas before .XX(Dr/Cr)
    const re = /(\d[\d,]*\.\d{2})\(([DC]r)\)/g;
    let m;
    while ((m = re.exec(text)) !== null) {
        let raw = m[1];
        let type = m[2];

        const parts = raw.split('.');
        const intStr = parts[0];
        const groups = intStr.split(',');

        let cleaned = raw;
        if (groups.length > 1) {
            // Has commas — validate Indian format from RIGHT
            // Last group before decimal: 3 digits; intermediate groups: 2 digits; first group: 1-2 digits
            const lastG = groups[groups.length - 1];
            if (lastG.length !== 3) {
                // Invalid last group, try treating as plain number
                const numVal = parseFloat(raw.replace(/,/g, ''));
                if (numVal > 0 && numVal < 100000) {
                    results.push({ value: numVal, type, raw, cleaned: raw });
                }
                continue;
            }

            // Walk from right to left, find valid groups
            let validFrom = groups.length - 1;
            for (let i = groups.length - 2; i >= 0; i--) {
                if (groups[i].length >= 1 && groups[i].length <= 2) {
                    validFrom = i;
                } else if (groups[i].length > 2) {
                    // Oversized group — likely ref number bleed
                    // Truncate: keep only last 1-2 digits of this group as the leading group
                    const truncated = groups[i].slice(-2); // Keep last 2 digits
                    // But for Indian format, leading group can be 1-2 digits
                    // Check if last 1 or last 2 makes more sense
                    const tryTwo = truncated;
                    const tryOne = groups[i].slice(-1);

                    // Use 1 or 2 digits — both are valid for Indian leading group
                    // Prefer 2 digits for better accuracy
                    validFrom = i;
                    groups[i] = tryTwo;
                    break;
                } else {
                    break;
                }
            }

            const validGroups = groups.slice(validFrom);
            cleaned = validGroups.join(',') + '.' + parts[1];
        }

        const value = parseFloat(cleaned.replace(/,/g, ''));
        if (value > 0) {
            results.push({ value, type, raw, cleaned });
        }
    }
    return results;
}

const tests = [
    { input: 'UPI/CredClub/3091312872331,412.00(Dr)8,343.73(Cr)', expected: '1,412.00 Dr | 8,343.73 Cr' },
    { input: 'CASH DEPOSIT AT MIRA RD40,000.00(Cr)40,012.23(Cr)', expected: '40,000.00 Cr | 40,012.23 Cr' },
    { input: 'NACH-VEDANTA-1704230017361,920.50(Cr)32,032.73(Cr)', expected: '1,920.50 Cr | 32,032.73 Cr' },
    { input: '3092667523111,342.50(Dr)0.73(Cr)', expected: '1,342.50 Dr | 0.73 Cr' },
    { input: '7,000.00(Dr)3,012.23(Cr)', expected: '7,000.00 Dr | 3,012.23 Cr' },
    { input: 'NEFT YESB30968066935570,254.66(Cr)11.50(Cr)', expected: '570,254.66 Cr | 11.50 Cr' },
    { input: 'SomeText412.00(Dr)8,343.73(Cr)', expected: '412.00 Dr | 8,343.73 Cr' },
    { input: 'EDNOVATE LEARN/5,000.00(Dr)1,343.73(Cr)', expected: '5,000.00 Dr | 1,343.73 Cr' },
    { input: 'FD MATURITY1,00,000.00(Cr)1,40,012.23(Cr)', expected: '1,00,000.00 Cr | 1,40,012.23 Cr' },
];

let pass = 0, fail = 0;
for (const test of tests) {
    const r = extractAmounts(test.input);
    const actual = r.map(a => `${a.cleaned} ${a.type}`).join(' | ');
    const ok = actual === test.expected;
    if (ok) pass++; else fail++;
    console.log(`${ok ? '✅' : '❌'} Input: ...${test.input.slice(-55)}`);
    if (!ok) {
        console.log(`   Expected: ${test.expected}`);
        console.log(`   Actual:   ${actual}`);
    }
}
console.log(`\n${pass}/${pass + fail} tests passed`);
