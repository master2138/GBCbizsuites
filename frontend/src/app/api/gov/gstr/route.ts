// API Route: /api/gov/gstr — GST Returns via TaxOne GSP (GSTR-1 save/file, GSTR-2B pull, e-Invoice)
import { NextRequest, NextResponse } from 'next/server';
import { saveGSTR1, fileGSTR1, getGSTR2B, generateIRN, cancelIRN, type TaxOneCredentials } from '@/lib/gov-apis';
import { saveIRN, logGovAPI } from '@/lib/firestore';

export async function POST(req: NextRequest) {
    const username = process.env.TAXONE_USERNAME;
    const password = process.env.TAXONE_PASSWORD;

    const body = await req.json();

    if (!username || !password) {
        // Demo mode
        if (body.action === 'save_gstr1') return NextResponse.json({ success: true, demo: true, data: { reference_id: `DEMO-REF-${Date.now()}` } });
        if (body.action === 'file_gstr1') return NextResponse.json({ success: true, demo: true, data: { arn: `DEMO-ARN-${Date.now()}`, status: 'FILED' } });
        if (body.action === 'generate_irn') return NextResponse.json({ success: true, demo: true, data: { irn: `DEMO-IRN-${Date.now()}`, ack_no: `DEMO-ACK-${Date.now()}`, ack_dt: new Date().toISOString() } });
        if (body.action === 'cancel_irn') return NextResponse.json({ success: true, demo: true, data: { irn: body.irn, cancel_date: new Date().toISOString() } });
        return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
    }

    const creds: TaxOneCredentials = { username, password, gstin: body.gstin };

    try {
        if (body.action === 'save_gstr1') {
            const result = await saveGSTR1(body.payload, creds);
            await logGovAPI({ service: 'TAXONE', endpoint: '/gstr1/save', method: 'PUT', responseCode: 200, responseStatus: 'OK', companyId: body.companyId || 'default' });
            return NextResponse.json(result);
        }

        if (body.action === 'file_gstr1') {
            const result = await fileGSTR1(body.gstin, body.retPeriod, body.pan, body.evcOtp, creds);
            await logGovAPI({ service: 'TAXONE', endpoint: '/gstr1/file', method: 'POST', responseCode: 200, responseStatus: 'OK', companyId: body.companyId || 'default' });
            return NextResponse.json(result);
        }

        if (body.action === 'generate_irn') {
            const result = await generateIRN(body.payload, creds, body.companyId || 'default');
            if (result.success && result.data) {
                await saveIRN({ irn: result.data.irn, ackNo: result.data.ack_no, gstin: body.gstin, docNo: body.docNo || '', companyId: body.companyId || 'default' });
            }
            return NextResponse.json(result);
        }

        if (body.action === 'cancel_irn') {
            const result = await cancelIRN(body.irn, body.reason, body.remarks, creds);
            return NextResponse.json(result);
        }

        return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

// GET: Pull GSTR-2B
export async function GET(req: NextRequest) {
    const gstin = req.nextUrl.searchParams.get('gstin');
    const retPeriod = req.nextUrl.searchParams.get('ret_period');
    if (!gstin || !retPeriod) return NextResponse.json({ success: false, error: 'gstin and ret_period required' }, { status: 400 });

    if (!process.env.TAXONE_USERNAME) {
        return NextResponse.json({ success: true, demo: true, data: { gstin, ret_period: retPeriod, b2b: [], message: 'Demo mode — connect TaxOne credentials' } });
    }

    try {
        const creds: TaxOneCredentials = { username: process.env.TAXONE_USERNAME, password: process.env.TAXONE_PASSWORD!, gstin };
        const result = await getGSTR2B(gstin, retPeriod, creds);
        return NextResponse.json(result);
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
