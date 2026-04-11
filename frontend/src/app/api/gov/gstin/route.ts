// API Route: /api/gov/gstin — GSTIN Verification via TaxOne GSP
import { NextRequest, NextResponse } from 'next/server';
import { verifyGSTIN, computeTDS, type TaxOneCredentials } from '@/lib/gov-apis';
import { logGovAPI } from '@/lib/firestore';

export async function GET(req: NextRequest) {
    const gstin = req.nextUrl.searchParams.get('gstin');
    if (!gstin || gstin.length !== 15) {
        return NextResponse.json({ success: false, error: 'Invalid GSTIN' }, { status: 400 });
    }

    // Check for configured credentials
    const username = process.env.TAXONE_USERNAME;
    const password = process.env.TAXONE_PASSWORD;
    if (!username || !password) {
        // Demo mode — return mock data
        return NextResponse.json({
            success: true,
            demo: true,
            data: {
                gstin, legal_name: 'DEMO BUSINESS PVT LTD', trade_name: 'Demo Biz',
                status: 'Active', tax_payer_type: 'Regular', registration_date: '2020-01-01',
                state_code: gstin.slice(0, 2),
            }
        });
    }

    const creds: TaxOneCredentials = { username, password, gstin };
    try {
        const result = await verifyGSTIN(gstin, creds);
        await logGovAPI({ service: 'TAXONE', endpoint: '/gstin/verify', method: 'GET', responseCode: result.success ? 200 : 400, responseStatus: result.success ? 'OK' : 'ERROR', companyId: 'default' });
        return NextResponse.json(result);
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

// POST: TDS Computation (local, no API call)
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const result = computeTDS(body);
        return NextResponse.json({ success: true, data: result });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 400 });
    }
}
