const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api';

// Token getter function — set by the app when Clerk session is available
let getSessionToken: (() => Promise<string | null>) | null = null;

export function setTokenGetter(fn: () => Promise<string | null>) {
    getSessionToken = fn;
}

class ApiClient {
    private legacyToken: string | null = null;

    constructor() {
        if (typeof window !== 'undefined') {
            this.legacyToken = localStorage.getItem('token');
        }
    }

    setToken(token: string) {
        this.legacyToken = token;
        if (typeof window !== 'undefined') {
            localStorage.setItem('token', token);
        }
    }

    clearToken() {
        this.legacyToken = null;
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    }

    getUser() {
        if (typeof window !== 'undefined') {
            const u = localStorage.getItem('user');
            return u ? JSON.parse(u) : null;
        }
        return null;
    }

    setUser(user: any) {
        if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(user));
        }
    }

    private async request(endpoint: string, options: RequestInit = {}) {
        const headers: Record<string, string> = {
            ...(options.headers as Record<string, string> || {}),
        };

        // Try Clerk token first, then legacy
        let token: string | null = null;
        if (getSessionToken) {
            try {
                token = await getSessionToken();
            } catch { }
        }
        if (!token) token = this.legacyToken;

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        // Don't set Content-Type for FormData
        if (!(options.body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }

        const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || `Request failed with status ${res.status}`);
        }

        return data;
    }

    // Auth (legacy - still works for backward compat)
    async register(email: string, password: string, name: string, firm_name?: string) {
        const data = await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, name, firm_name }),
        });
        this.setToken(data.token);
        this.setUser(data.user);
        return data;
    }

    async login(email: string, password: string) {
        const data = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        this.setToken(data.token);
        this.setUser(data.user);
        return data;
    }

    async getMe() {
        return this.request('/auth/me');
    }

    logout() {
        this.clearToken();
    }

    // Dashboard
    async getDashboardStats() {
        return this.request('/dashboard/stats');
    }

    async getActivity(limit = 20) {
        return this.request(`/dashboard/activity?limit=${limit}`);
    }

    // Clients
    async getClients(params?: { search?: string; page?: number; limit?: number }) {
        const q = new URLSearchParams();
        if (params?.search) q.set('search', params.search);
        if (params?.page) q.set('page', String(params.page));
        if (params?.limit) q.set('limit', String(params.limit));
        return this.request(`/clients?${q.toString()}`);
    }

    async createClient(data: any) {
        return this.request('/clients', { method: 'POST', body: JSON.stringify(data) });
    }

    async updateClient(id: string, data: any) {
        return this.request(`/clients/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    }

    async deleteClient(id: string) {
        return this.request(`/clients/${id}`, { method: 'DELETE' });
    }

    // Bank Statements
    async uploadStatement(file: File, clientId?: string, bankName?: string) {
        const formData = new FormData();
        formData.append('file', file);
        if (clientId) formData.append('client_id', clientId);
        if (bankName) formData.append('bank_name', bankName);
        return this.request('/bank-statements/upload', { method: 'POST', body: formData });
    }

    async getStatements(page = 1) {
        return this.request(`/bank-statements?page=${page}`);
    }

    async getStatement(id: string) {
        return this.request(`/bank-statements/${id}`);
    }

    async deleteStatement(id: string) {
        return this.request(`/bank-statements/${id}`, { method: 'DELETE' });
    }

    async updateTransaction(statementId: string, txnId: string, data: any) {
        return this.request(`/bank-statements/${statementId}/transactions/${txnId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    getTallyXmlUrl(id: string) {
        return `${API_BASE}/bank-statements/${id}/export/tally-xml`;
    }

    getExcelUrl(id: string) {
        return `${API_BASE}/bank-statements/${id}/export/excel`;
    }

    // Download with auth
    async downloadFile(url: string, filename: string) {
        let token: string | null = null;
        if (getSessionToken) try { token = await getSessionToken(); } catch { }
        if (!token) token = this.legacyToken;

        const res = await fetch(url, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const blob = await res.blob();
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        a.click();
        URL.revokeObjectURL(a.href);
    }

    // Calculators
    async calcIncomeTax(data: any) {
        return this.request('/calculators/income-tax', { method: 'POST', body: JSON.stringify(data) });
    }

    async calcHRA(data: any) {
        return this.request('/calculators/hra', { method: 'POST', body: JSON.stringify(data) });
    }

    async calcEMI(data: any) {
        return this.request('/calculators/emi', { method: 'POST', body: JSON.stringify(data) });
    }

    async calcSIP(data: any) {
        return this.request('/calculators/sip', { method: 'POST', body: JSON.stringify(data) });
    }

    async calcPPF(data: any) {
        return this.request('/calculators/ppf', { method: 'POST', body: JSON.stringify(data) });
    }

    async calcGST(data: any) {
        return this.request('/calculators/gst', { method: 'POST', body: JSON.stringify(data) });
    }

    async calcTDS(data: any) {
        return this.request('/calculators/tds', { method: 'POST', body: JSON.stringify(data) });
    }

    async calcGratuity(data: any) {
        return this.request('/calculators/gratuity', { method: 'POST', body: JSON.stringify(data) });
    }

    async calcNPS(data: any) {
        return this.request('/calculators/nps', { method: 'POST', body: JSON.stringify(data) });
    }

    async calcCapitalGains(data: any) {
        return this.request('/calculators/capital-gains', { method: 'POST', body: JSON.stringify(data) });
    }

    async calcFD(data: any) {
        return this.request('/calculators/fd', { method: 'POST', body: JSON.stringify(data) });
    }

    async calcRD(data: any) {
        return this.request('/calculators/rd', { method: 'POST', body: JSON.stringify(data) });
    }

    async calcDepreciation(data: any) {
        return this.request('/calculators/depreciation', { method: 'POST', body: JSON.stringify(data) });
    }

    async calcRegimeOptimizer(data: any) {
        return this.request('/calculators/regime-optimizer', { method: 'POST', body: JSON.stringify(data) });
    }

    async calcAdvanceTax(data: any) {
        return this.request('/calculators/advance-tax', { method: 'POST', body: JSON.stringify(data) });
    }

    async calcProfessionalTax(data: any) {
        return this.request('/calculators/professional-tax', { method: 'POST', body: JSON.stringify(data) });
    }

    async calcStampDuty(data: any) {
        return this.request('/calculators/stamp-duty', { method: 'POST', body: JSON.stringify(data) });
    }

    async calcCryptoTax(data: any) {
        return this.request('/calculators/crypto-tax', { method: 'POST', body: JSON.stringify(data) });
    }

    // GSTIN
    async verifyGSTIN(gstin: string) {
        return this.request(`/gstin/verify/${gstin}`);
    }

    // E-Commerce
    async uploadEcomReport(file: File, platform?: string) {
        const formData = new FormData();
        formData.append('file', file);
        if (platform) formData.append('platform', platform);
        return this.request('/ecommerce/upload', { method: 'POST', body: formData });
    }

    async getEcomReports() {
        return this.request('/ecommerce/reports');
    }

    async getEcomReport(id: string) {
        return this.request(`/ecommerce/reports/${id}`);
    }

    async getEcomGSTR1(id: string) {
        return this.request(`/ecommerce/reports/${id}/gstr1`);
    }

    async deleteEcomReport(id: string) {
        return this.request(`/ecommerce/reports/${id}`, { method: 'DELETE' });
    }

    getEcomTallyXmlUrl(id: string) {
        return `${API_BASE}/ecommerce/reports/${id}/tally-xml`;
    }

    getEcomCsvUrl(id: string) {
        return `${API_BASE}/ecommerce/reports/${id}/export-csv`;
    }

    // Invoices
    async createInvoice(data: any) {
        return this.request('/invoices', { method: 'POST', body: JSON.stringify(data) });
    }

    async getInvoices() {
        return this.request('/invoices');
    }

    async getInvoice(id: string) {
        return this.request(`/invoices/${id}`);
    }

    async updateInvoice(id: string, data: any) {
        return this.request(`/invoices/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    }

    async updateInvoiceStatus(id: string, status: string) {
        return this.request(`/invoices/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
    }

    async recordPayment(id: string, data: any) {
        return this.request(`/invoices/${id}/payment`, { method: 'POST', body: JSON.stringify(data) });
    }

    async deleteInvoice(id: string) {
        return this.request(`/invoices/${id}`, { method: 'DELETE' });
    }

    // Compliance Calendar
    async getComplianceCalendar(params?: { month?: number; year?: number; category?: string }) {
        const q = new URLSearchParams();
        if (params?.month) q.set('month', String(params.month));
        if (params?.year) q.set('year', String(params.year));
        if (params?.category) q.set('category', params.category);
        return this.request(`/compliance/calendar?${q.toString()}`);
    }

    async getUpcomingDeadlines(days = 30) {
        return this.request(`/compliance/upcoming?days=${days}`);
    }

    async createComplianceTask(data: any) {
        return this.request('/compliance/tasks', { method: 'POST', body: JSON.stringify(data) });
    }

    async updateComplianceTask(id: string, data: any) {
        return this.request(`/compliance/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    }

    async deleteComplianceTask(id: string) {
        return this.request(`/compliance/tasks/${id}`, { method: 'DELETE' });
    }

    // Client Portal
    async getClientProfile(clientId: string) {
        return this.request(`/clients-portal/${clientId}/profile`);
    }

    async uploadClientDocument(clientId: string, file: File, category: string, notes: string) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', category);
        formData.append('notes', notes);
        return this.request(`/clients-portal/${clientId}/documents`, { method: 'POST', body: formData });
    }

    async getClientDocuments(clientId: string) {
        return this.request(`/clients-portal/${clientId}/documents`);
    }

    async deleteClientDocument(clientId: string, docId: string) {
        return this.request(`/clients-portal/${clientId}/documents/${docId}`, { method: 'DELETE' });
    }

    getClientDocumentUrl(clientId: string, docId: string) {
        return `${API_BASE}/clients-portal/${clientId}/documents/${docId}/download`;
    }

    async getClientNotes(clientId: string) {
        return this.request(`/clients-portal/${clientId}/notes`);
    }

    async createClientNote(clientId: string, content: string) {
        return this.request(`/clients-portal/${clientId}/notes`, { method: 'POST', body: JSON.stringify({ content }) });
    }

    async toggleNotePin(clientId: string, noteId: string) {
        return this.request(`/clients-portal/${clientId}/notes/${noteId}/pin`, { method: 'PUT' });
    }

    async deleteClientNote(clientId: string, noteId: string) {
        return this.request(`/clients-portal/${clientId}/notes/${noteId}`, { method: 'DELETE' });
    }

    async getClientTimeline(clientId: string) {
        return this.request(`/clients-portal/${clientId}/timeline`);
    }

    // Practice Management
    async getWorkItems(params?: { status?: string; priority?: string; client_id?: string }) {
        const q = new URLSearchParams();
        if (params?.status) q.set('status', params.status);
        if (params?.priority) q.set('priority', params.priority);
        if (params?.client_id) q.set('client_id', params.client_id);
        return this.request(`/practice/work-items?${q.toString()}`);
    }

    async createWorkItem(data: any) {
        return this.request('/practice/work-items', { method: 'POST', body: JSON.stringify(data) });
    }

    async updateWorkItem(id: string, data: any) {
        return this.request(`/practice/work-items/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    }

    async deleteWorkItem(id: string) {
        return this.request(`/practice/work-items/${id}`, { method: 'DELETE' });
    }

    async getPracticeStats() {
        return this.request('/practice/stats');
    }

    async getBillingSummary() {
        return this.request('/practice/billing-summary');
    }

    // Reports
    async getClientSummaryReport() {
        return this.request('/reports/client-summary');
    }

    async getRevenueReport() {
        return this.request('/reports/revenue');
    }

    async getFilingStatusReport() {
        return this.request('/reports/filing-status');
    }

    getExportUrl(type: string) {
        return `${API_BASE}/reports/export/${type}`;
    }
}

export const api = new ApiClient();
export default api;
