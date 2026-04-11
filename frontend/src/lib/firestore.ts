// Firebase Firestore Service — Data persistence layer
import { db } from './firebase';
import { collection, doc, addDoc, updateDoc, deleteDoc, getDocs, getDoc, query, where, orderBy, limit, serverTimestamp, Timestamp } from 'firebase/firestore';

// ─── COLLECTIONS ───────────────────────────────────────────

const COLLECTIONS = {
    clients: 'clients',
    invoices: 'invoices',
    filings: 'filings',
    itrFilings: 'itr_filings',
    tdsReturns: 'tds_returns',
    govApiLogs: 'gov_api_logs',
    irnRecords: 'irn_records',
    notifications: 'notifications',
} as const;

// ─── CLIENT OPERATIONS ─────────────────────────────────────

export async function saveClient(data: Record<string, any>) {
    return addDoc(collection(db, COLLECTIONS.clients), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
}

export async function getClients() {
    const snap = await getDocs(query(collection(db, COLLECTIONS.clients), orderBy('createdAt', 'desc')));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function updateClient(id: string, data: Record<string, any>) {
    return updateDoc(doc(db, COLLECTIONS.clients, id), { ...data, updatedAt: serverTimestamp() });
}

// ─── INVOICE OPERATIONS ────────────────────────────────────

export async function saveInvoice(data: Record<string, any>) {
    const invNo = `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    return addDoc(collection(db, COLLECTIONS.invoices), {
        ...data, invoice_number: invNo, status: 'DRAFT',
        createdAt: serverTimestamp(), updatedAt: serverTimestamp()
    });
}

export async function getInvoices() {
    const snap = await getDocs(query(collection(db, COLLECTIONS.invoices), orderBy('createdAt', 'desc'), limit(100)));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function updateInvoiceStatus(id: string, status: string) {
    return updateDoc(doc(db, COLLECTIONS.invoices, id), { status, updatedAt: serverTimestamp() });
}

// ─── FILING OPERATIONS ─────────────────────────────────────

export async function logFiling(data: { type: string; form: string; client: string; status: string; arn?: string;[key: string]: any }) {
    return addDoc(collection(db, COLLECTIONS.filings), { ...data, filedAt: serverTimestamp() });
}

export async function getFilings(type?: string) {
    const q = type
        ? query(collection(db, COLLECTIONS.filings), where('type', '==', type), orderBy('filedAt', 'desc'), limit(50))
        : query(collection(db, COLLECTIONS.filings), orderBy('filedAt', 'desc'), limit(50));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ─── GOV API LOG ───────────────────────────────────────────

export async function logGovAPI(data: {
    service: 'TAXONE' | 'ERI' | 'TRACES'; endpoint: string; method: string;
    responseCode: number; responseStatus: string; companyId: string;
}) {
    return addDoc(collection(db, COLLECTIONS.govApiLogs), { ...data, calledAt: serverTimestamp() });
}

// ─── IRN RECORDS ───────────────────────────────────────────

export async function saveIRN(data: { irn: string; ackNo: string; gstin: string; docNo: string; companyId: string; }) {
    return addDoc(collection(db, COLLECTIONS.irnRecords), { ...data, createdAt: serverTimestamp() });
}

// ─── ITR FILINGS ───────────────────────────────────────────

export async function saveITRFiling(data: { ackNo: string; pan: string; ay: string; itrForm: string; companyId: string; }) {
    return addDoc(collection(db, COLLECTIONS.itrFilings), { ...data, createdAt: serverTimestamp() });
}

// ─── TDS RETURNS ───────────────────────────────────────────

export async function saveTDSReturn(data: { tan: string; fy: string; quarter: string; formType: string; status: string; companyId: string; }) {
    return addDoc(collection(db, COLLECTIONS.tdsReturns), { ...data, createdAt: serverTimestamp() });
}
