// API Route: /api/gov/tds — TDS Filing & Challan via TRACES
import { NextRequest, NextResponse } from 'next/server';
import { verifyChallan, getTDSFilingStatus, requestForm16, type TRACESCredentials } from '@/lib/gov-apis';
import { saveTDSReturn, logGovAPI } from '@/lib/firestore';

// POST: Challan Verification / Form 16 Request
export async function POST(req: NextRequest) {
    const tracesUser = process.env.TRACES_USER_ID;
    if (!tracesUser) {
        const body = await req.json();
        if (body.action === 'verify_challan') {
            return NextResponse.json({
                success: true, demo: true,
                data: (body.challans || []).map((c: any) => ({ is_valid: true, status: 'MATCHED', amount_deposited: c.amount }))
            });
        }
        if (body.action === 'form16') {
            return NextResponse.json({
                success: true, demo: true,
                data: { request_id: `DEMO-F16-${Date.now()}`, status: 'SUBMITTED' }
            });
        }
        return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
    }

    try {
        const body = await req.json();
        const creds: TRACESCredentials = {
            user_id: tracesUser, password: process.env.TRACES_PASSWORD || '',
            user_type: 'TAX_PROFESSIONAL', tan: body.tan || '',
        };

        if (body.action === 'verify_challan') {
            const result = await verifyChallan(body.challans, creds);
            await logGovAPI({ service: 'TRACES', endpoint: '/challan/verify', method: 'POST', responseCode: 200, responseStatus: 'OK', companyId: 'default' });
            return NextResponse.json(result);
        }

        if (body.action === 'form16') {
            const result = await requestForm16(body.params, creds);
            return NextResponse.json(result);
        }

        return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

// GET: TDS Filing Status
export async function GET(req: NextRequest) {
    const tan = req.nextUrl.searchParams.get('tan');
    const fy = req.nextUrl.searchParams.get('fy');
    const quarter = req.nextUrl.searchParams.get('quarter');
    const form = req.nextUrl.searchParams.get('form');
    if (!tan || !fy || !quarter || !form) {
        return NextResponse.json({ success: false, error: 'tan, fy, quarter, form required' }, { status: 400 });
    }

    if (!process.env.TRACES_USER_ID) {
        return NextResponse.json({
            success: true, demo: true,
            data: { filing_status: 'FILED', filing_date: '2026-01-31', rrr_no: 'DEMO-RRR-12345', processing_status: 'PROCESSED' }
        });
    }

    try {
        const creds: TRACESCredentials = {
            user_id: process.env.TRACES_USER_ID, password: process.env.TRACES_PASSWORD || '',
            user_type: 'TAX_PROFESSIONAL', tan,
        };
        const result = await getTDSFilingStatus(tan, fy, quarter as any, form as any, creds);
        return NextResponse.json(result);
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
