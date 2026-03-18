// Dump raw PDF text from Kotak statement to analyze the exact format
const fs = require('fs');
const pdfParse = require('pdf-parse');

async function main() {
    const pdfBuffer = fs.readFileSync('c:/GBC Associates/GBC mega App/Attached/01 Apr 2023 - 31 Mar 2024_XX1241.pdf');
    const pdfData = await pdfParse(pdfBuffer);

    const lines = pdfData.text.split('\n');

    // Show first 50 lines that contain dates
    let count = 0;
    const dateRe = /^\d{2}-\d{2}-\d{4}/;

    for (let i = 0; i < lines.length && count < 30; i++) {
        const line = lines[i].trim();
        if (dateRe.test(line)) {
            console.log(`[${i}] >>>${line}<<<`);
            count++;
            // Also show the next 2 lines in case of multi-line entries
            for (let j = 1; j <= 2 && i + j < lines.length; j++) {
                const next = lines[i + j].trim();
                if (next && !dateRe.test(next)) {
                    console.log(`     cont: >>>${next}<<<`);
                }
            }
            console.log();
        }
    }
}

main().catch(console.error);
