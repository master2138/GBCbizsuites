// API Route: /api/gov/itr — ITR Upload & Status via ERI
import { NextRequest, NextResponse } from 'next/server';
import { uploadITR, getITRStatus, recommendITRForm, ayFromFY, type ITRFormType } from '@/lib/gov-apis';
import { saveITRFiling, logGovAPI } from '@/lib/firestore';

// POST: Upload ITR
export async function POST(req: NextRequest) {
    const eriClientId = process.env.ERI_CLIENT_ID;
    if (!eriClientId) {
        return NextResponse.json({
            success: true, demo: true,
            data: { ack_no: `DEMO-${Date.now()}`, ack_date: new Date().toISOString().slice(0, 10), status: 'FILED' }
        });
    }

    try {
        const body = await req.json();
        const result = await uploadITR(body, body.companyId || 'default');
        if (result.success && result.data) {
            await saveITRFiling({ ackNo: result.data.ack_no, pan: body.pan, ay: body.ay, itrForm: body.itr_form, companyId: body.companyId || 'default' });
            await logGovAPI({ service: 'ERI', endpoint: '/itr/upload', method: 'POST', responseCode: 200, responseStatus: 'OK', companyId: body.companyId || 'default' });
        }
        return NextResponse.json(result);
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

// GET: ITR Status
export async function GET(req: NextRequest) {
    const pan = req.nextUrl.searchParams.get('pan');
    const ay = req.nextUrl.searchParams.get('ay');
    if (!pan || !ay) return NextResponse.json({ success: false, error: 'pan and ay required' }, { status: 400 });

    if (!process.env.ERI_CLIENT_ID) {
        return NextResponse.json({
            success: true, demo: true,
            data: { ack_no: 'DEMO-ACK-12345', filing_date: '2026-07-15', itr_form: 'ITR-1', status: 'FILED', verification_status: 'VERIFIED' }
        });
    }

    try {
        const result = await getITRStatus(pan, ay);
        return NextResponse.json(result);
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
