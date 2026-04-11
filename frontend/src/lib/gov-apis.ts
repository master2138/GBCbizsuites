// ============================================================
// CA Mega Suite — Government API Integration Layer
// Wraps TaxOne GSP, ERI ITR, and TRACES TDS services
// ============================================================

// ─── TYPES ─────────────────────────────────────────────────

export type GSTIN = string;              // 15-char GSTIN
export type PAN = string;                // 10-char PAN
export type TAN = string;                // 10-char TAN
export type FinancialYear = string;      // e.g. "2024-25"
export type AssessmentYear = string;     // e.g. "2025-26"
export type ReturnPeriod = string;       // e.g. "032025"
export type ITRFormType = 'ITR-1' | 'ITR-2' | 'ITR-3' | 'ITR-4' | 'ITR-5' | 'ITR-6' | 'ITR-7';
export type TDSReturnType = '24Q' | '26Q' | '27Q' | '27EQ';
export type Quarter = 'Q1' | 'Q2' | 'Q3' | 'Q4';

export interface APIResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    code?: string;
    timestamp: string;
}

// ─── CREDENTIALS ───────────────────────────────────────────

export interface TaxOneCredentials {
    username: string;
    password: string;
    gstin: GSTIN;
}

export interface ERICredentials {
    eriUserId: string;
    eriPassword: string;
    eriTan?: string;
}

export interface TRACESCredentials {
    user_id: string;
    password: string;
    user_type: 'DEDUCTOR' | 'TAX_PROFESSIONAL';
    tan: TAN;
}

// ─── ENVIRONMENT ───────────────────────────────────────────

const isSandbox = () => process.env.GST_SANDBOX === 'true' || process.env.NODE_ENV !== 'production';

const TAXONE_BASE = 'https://api.taxone.irisirp.com/v1';
const TAXONE_SANDBOX = 'https://api.sandbox.taxone.irisirp.com/v1';
const ITD_BASE = 'https://www.incometax.gov.in/api/v1';
const ITD_SANDBOX = 'https://sandbox.incometax.gov.in/api/v1';
const TRACES_BASE = 'https://www.tdscpc.gov.in/api/v1';
const TRACES_SANDBOX = 'https://sandbox.tdscpc.gov.in/api/v1';

function getGSTBase() { return isSandbox() ? TAXONE_SANDBOX : TAXONE_BASE; }
function getITDBase() { return isSandbox() ? ITD_SANDBOX : ITD_BASE; }
function getTRACESBase() { return isSandbox() ? TRACES_SANDBOX : TRACES_BASE; }

// ─── HTTP CLIENT ───────────────────────────────────────────

async function govFetch<T>(url: string, options: RequestInit): Promise<APIResponse<T>> {
    const ts = new Date().toISOString();
    try {
        const res = await fetch(url, { ...options, headers: { 'Content-Type': 'application/json', ...options.headers } });
        const body = await res.json();
        if (!res.ok) return { success: false, error: body.message || `HTTP ${res.status}`, code: String(res.status), timestamp: ts };
        return { success: true, data: body.data || body, timestamp: ts };
    } catch (err: any) {
        return { success: false, error: err.message, timestamp: ts };
    }
}

// ─── TOKEN CACHE ───────────────────────────────────────────

const tokenCache = new Map<string, { token: string; expiry: number }>();

async function getGSTToken(creds: TaxOneCredentials): Promise<string> {
    const key = `gst:${creds.gstin}`;
    const cached = tokenCache.get(key);
    if (cached && cached.expiry > Date.now()) return cached.token;

    const res = await govFetch<{ access_token: string; expires_in: number }>(
        `${getGSTBase()}/auth/token`,
        { method: 'POST', body: JSON.stringify({ username: creds.username, password: creds.password, gstin: creds.gstin }) }
    );
    if (res.success && res.data) {
        tokenCache.set(key, { token: res.data.access_token, expiry: Date.now() + (res.data.expires_in - 60) * 1000 });
        return res.data.access_token;
    }
    throw new Error(res.error || 'GST auth failed');
}

// ═══════════════════════════════════════════════════════════
// TAXONE GSP — GST Services
// ═══════════════════════════════════════════════════════════

export async function verifyGSTIN(gstin: GSTIN, creds: TaxOneCredentials): Promise<APIResponse<{
    gstin: string; legal_name: string; trade_name: string; status: string;
    tax_payer_type: string; registration_date: string; state_code: string;
}>> {
    const token = await getGSTToken(creds);
    return govFetch(`${getGSTBase()}/gstin/${gstin}`, { method: 'GET', headers: { Authorization: `Bearer ${token}`, gstin: creds.gstin } });
}

export async function generateIRN(payload: any, creds: TaxOneCredentials, companyId: string): Promise<APIResponse<{
    irn: string; ack_no: string; ack_dt: string; signed_qr_code: string;
}>> {
    const token = await getGSTToken(creds);
    return govFetch(`${getGSTBase()}/einvoice/generate`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, gstin: creds.gstin }, body: JSON.stringify(payload) });
}

export async function cancelIRN(irn: string, reason: 1 | 2 | 3 | 4, remarks: string, creds: TaxOneCredentials): Promise<APIResponse<{ irn: string; cancel_date: string }>> {
    const token = await getGSTToken(creds);
    return govFetch(`${getGSTBase()}/einvoice/cancel`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, gstin: creds.gstin }, body: JSON.stringify({ irn, cnl_rsn: String(reason), cnl_rem: remarks }) });
}

export async function saveGSTR1(payload: any, creds: TaxOneCredentials): Promise<APIResponse<{ reference_id: string }>> {
    const token = await getGSTToken(creds);
    return govFetch(`${getGSTBase()}/gstr1/save`, { method: 'PUT', headers: { Authorization: `Bearer ${token}`, gstin: creds.gstin }, body: JSON.stringify(payload) });
}

export async function fileGSTR1(gstin: GSTIN, retPeriod: ReturnPeriod, pan: PAN, evcOtp: string, creds: TaxOneCredentials): Promise<APIResponse<{ arn: string; status: string }>> {
    const token = await getGSTToken(creds);
    return govFetch(`${getGSTBase()}/gstr1/file`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, gstin: creds.gstin }, body: JSON.stringify({ gstin, ret_period: retPeriod, pan, evc_otp: evcOtp }) });
}

export async function getGSTR2B(gstin: GSTIN, retPeriod: ReturnPeriod, creds: TaxOneCredentials): Promise<APIResponse<any>> {
    const token = await getGSTToken(creds);
    return govFetch(`${getGSTBase()}/gstr2b/${gstin}?ret_period=${retPeriod}`, { method: 'GET', headers: { Authorization: `Bearer ${token}`, gstin: creds.gstin } });
}

// ═══════════════════════════════════════════════════════════
// ERI — Income Tax Services
// ═══════════════════════════════════════════════════════════

export async function uploadITR(payload: {
    pan: PAN; fy: FinancialYear; ay: AssessmentYear; itr_form: ITRFormType;
    filing_type: 'ORIGINAL' | 'REVISED' | 'BELATED' | 'UPDATED';
    xml_data: string; xml_hash: string; is_139_9_applicable: boolean;
}, companyId: string): Promise<APIResponse<{ ack_no: string; ack_date: string; status: string }>> {
    return govFetch(`${getITDBase()}/itr/upload`, {
        method: 'POST',
        headers: { 'X-ERI-Client-Id': process.env.ERI_CLIENT_ID || '', 'X-ERI-Secret': process.env.ERI_SECRET || '' },
        body: JSON.stringify(payload),
    });
}

export async function getITRStatus(pan: PAN, ay: AssessmentYear): Promise<APIResponse<{
    ack_no: string; filing_date: string; itr_form: string; status: string; verification_status: string;
}>> {
    return govFetch(`${getITDBase()}/itr/status?pan=${pan}&ay=${ay}`, {
        method: 'GET',
        headers: { 'X-ERI-Client-Id': process.env.ERI_CLIENT_ID || '', 'X-ERI-Secret': process.env.ERI_SECRET || '' },
    });
}

export async function get26AS(pan: PAN, ay: AssessmentYear): Promise<APIResponse<any>> {
    return govFetch(`${getITDBase()}/form26as/${pan}?ay=${ay}`, {
        method: 'GET',
        headers: { 'X-ERI-Client-Id': process.env.ERI_CLIENT_ID || '', 'X-ERI-Secret': process.env.ERI_SECRET || '' },
    });
}

export function ayFromFY(fy: FinancialYear): AssessmentYear {
    const [start] = fy.split('-').map(Number);
    return `${start + 1}-${String(start + 2).slice(-2)}`;
}

export function recommendITRForm(profile: {
    is_individual: boolean; has_business_income: boolean; has_capital_gains: boolean;
    has_foreign_income: boolean; total_income: number; is_presumptive: boolean;
}): ITRFormType {
    if (!profile.is_individual) return 'ITR-5';
    if (profile.has_foreign_income) return 'ITR-2';
    if (profile.has_business_income) return profile.is_presumptive ? 'ITR-4' : 'ITR-3';
    if (profile.has_capital_gains) return 'ITR-2';
    if (profile.total_income <= 5000000) return 'ITR-1';
    return 'ITR-2';
}

// ═══════════════════════════════════════════════════════════
// TRACES — TDS Services
// ═══════════════════════════════════════════════════════════

export function computeTDS(params: {
    section: string; amount_paid: number; is_company: boolean; has_pan: boolean;
}): { applicable: boolean; tds_amount: number; effective_rate: number; section_used: string } {
    const RATES: Record<string, { ind: number; corp: number; no_pan: number; threshold: number }> = {
        '194A': { ind: 10, corp: 10, no_pan: 20, threshold: 40000 },
        '194C': { ind: 1, corp: 2, no_pan: 20, threshold: 30000 },
        '194H': { ind: 5, corp: 5, no_pan: 20, threshold: 15000 },
        '194I_RENT': { ind: 10, corp: 10, no_pan: 20, threshold: 240000 },
        '194J': { ind: 10, corp: 10, no_pan: 20, threshold: 30000 },
        '194J_TECH': { ind: 2, corp: 2, no_pan: 20, threshold: 30000 },
        '194Q': { ind: 0.1, corp: 0.1, no_pan: 5, threshold: 5000000 },
        '192': { ind: 0, corp: 0, no_pan: 30, threshold: 0 },
    };

    const rate = RATES[params.section] || { ind: 10, corp: 10, no_pan: 20, threshold: 0 };
    if (params.amount_paid < rate.threshold) return { applicable: false, tds_amount: 0, effective_rate: 0, section_used: params.section };

    const pct = !params.has_pan ? rate.no_pan : params.is_company ? rate.corp : rate.ind;
    return { applicable: true, tds_amount: Math.round(params.amount_paid * pct / 100), effective_rate: pct, section_used: params.section };
}

export async function verifyChallan(challans: Array<{
    bsr_code: string; challan_date: string; challan_serial_no: string; amount: number;
}>, creds: TRACESCredentials): Promise<APIResponse<Array<{
    is_valid: boolean; status: string; amount_deposited: number;
}>>> {
    return govFetch(`${getTRACESBase()}/challan/verify`, {
        method: 'POST',
        headers: { 'X-TRACES-User': creds.user_id, 'X-TRACES-TAN': creds.tan },
        body: JSON.stringify({ challans }),
    });
}

export async function requestForm16(params: {
    tan: TAN; financial_year: FinancialYear; quarter?: Quarter; deductee_pan: PAN; bulk: boolean;
}, creds: TRACESCredentials): Promise<APIResponse<{ request_id: string; status: string }>> {
    return govFetch(`${getTRACESBase()}/form16/request`, {
        method: 'POST',
        headers: { 'X-TRACES-User': creds.user_id, 'X-TRACES-TAN': creds.tan },
        body: JSON.stringify(params),
    });
}

export async function getTDSFilingStatus(tan: TAN, fy: FinancialYear, quarter: Quarter, formType: TDSReturnType, creds: TRACESCredentials): Promise<APIResponse<{
    filing_status: string; filing_date?: string; rrr_no?: string; processing_status?: string;
}>> {
    return govFetch(`${getTRACESBase()}/returns/status?tan=${tan}&fy=${fy}&quarter=${quarter}&form=${formType}`, {
        method: 'GET',
        headers: { 'X-TRACES-User': creds.user_id, 'X-TRACES-TAN': creds.tan },
    });
}
