'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, updateDoc, doc, query, orderBy, serverTimestamp } from 'firebase/firestore';

type Client = { id?: string; name: string; pan: string; gstin: string; type: string; status: string; phone: string; email: string; };

const CLIENT_TYPES = ['Individual', 'HUF', 'Pvt Ltd', 'LLP', 'Firm', 'Trust', 'AOP/BOI', 'Company'];

const SEED_CLIENTS: Omit<Client, 'id'>[] = [
    { name: 'Rajesh Sharma (HUF)', pan: 'ABCPS1234D', gstin: '27ABCPS1234D1ZP', type: 'HUF', status: 'Active', phone: '98765-43210', email: 'rajesh@email.com' },
    { name: 'M/s Fresh Foods Pvt Ltd', pan: 'AABCF5678K', gstin: '27AABCF5678K1ZR', type: 'Pvt Ltd', status: 'Active', phone: '98765-11111', email: 'fresh@foods.com' },
    { name: 'Priya Gupta', pan: 'BCDPG9876H', gstin: '—', type: 'Individual', status: 'Active', phone: '98765-22222', email: 'priya@email.com' },
    { name: 'Tech Solutions LLP', pan: 'AABCT4567J', gstin: '27AABCT4567J1ZS', type: 'LLP', status: 'Active', phone: '98765-33333', email: 'info@techsol.com' },
    { name: 'NRI Holdings Ltd', pan: 'CDEPN2345L', gstin: '—', type: 'Company', status: 'Inactive', phone: '98765-44444', email: 'nri@holdings.com' },
    { name: 'Sharma & Sons Partnership', pan: 'AADFS7890M', gstin: '27AADFS7890M1ZT', type: 'Firm', status: 'Active', phone: '98765-55555', email: 'sharma@sons.com' },
    { name: 'Anita Desai Trust', pan: 'AAATD3456N', gstin: '—', type: 'Trust', status: 'Active', phone: '98765-66666', email: 'trust@desai.com' },
    { name: 'Green Earth NGO', pan: 'AAAPG6789P', gstin: '—', type: 'AOP/BOI', status: 'Active', phone: '98765-77777', email: 'info@greenearth.org' },
];

export default function ClientsPage() {
    const [clients, setClients] = useState<Client[]>(SEED_CLIENTS);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [showForm, setShowForm] = useState(false);
    const [newClient, setNewClient] = useState<Omit<Client, 'id'>>({ name: '', pan: '', gstin: '', type: 'Individual', status: 'Active', phone: '', email: '' });
    const [firebaseLoaded, setFirebaseLoaded] = useState(false);

    // Try to load from Firebase, fallback to seed data
    useEffect(() => {
        (async () => {
            try {
                const snap = await getDocs(query(collection(db, 'clients'), orderBy('name')));
                if (snap.docs.length > 0) {
                    setClients(snap.docs.map(d => ({ id: d.id, ...d.data() } as Client)));
                }
                setFirebaseLoaded(true);
            } catch { setFirebaseLoaded(false); }
        })();
    }, []);

    const handleAdd = async () => {
        if (!newClient.name || !newClient.pan) return;
        try {
            const docRef = await addDoc(collection(db, 'clients'), { ...newClient, createdAt: serverTimestamp() });
            setClients(prev => [{ ...newClient, id: docRef.id }, ...prev]);
        } catch {
            setClients(prev => [{ ...newClient, id: String(Date.now()) }, ...prev]);
        }
        setNewClient({ name: '', pan: '', gstin: '', type: 'Individual', status: 'Active', phone: '', email: '' });
        setShowForm(false);
    };

    const types = ['all', ...CLIENT_TYPES];
    const filtered = clients.filter(c =>
        (typeFilter === 'all' || c.type === typeFilter) &&
        (c.name.toLowerCase().includes(search.toLowerCase()) || c.pan.includes(search.toUpperCase()))
    );

    const inputStyle: React.CSSProperties = { padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.04)', color: 'var(--text-primary)', fontSize: 13, width: '100%' };

    return (
        <div className="animate-fadeIn">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }} className="gradient-text">Client Master</h1>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                        {clients.length} clients · PAN · GSTIN · TAN Registry
                        {firebaseLoaded && <span style={{ color: '#22c55e', marginLeft: 8 }}>🔥 Firebase</span>}
                    </p>
                </div>
                <button onClick={() => setShowForm(!showForm)} style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: 'var(--accent-gradient)', color: '#07091A', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                    {showForm ? '✕ Cancel' : '+ Add Client'}
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10, marginBottom: 16 }}>
                {[
                    { label: 'Total', value: clients.length, color: '#C9A84C' },
                    { label: 'Active', value: clients.filter(c => c.status === 'Active').length, color: '#22c55e' },
                    { label: 'Companies', value: clients.filter(c => ['Pvt Ltd', 'Company', 'LLP'].includes(c.type)).length, color: '#8B5CF6' },
                    { label: 'Individuals', value: clients.filter(c => c.type === 'Individual' || c.type === 'HUF').length, color: '#0D7B7B' },
                ].map(c => (
                    <div key={c.label} className="glass-card" style={{ padding: 14, borderLeft: `3px solid ${c.color}`, textAlign: 'center' }}>
                        <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'monospace', color: c.color }}>{c.value}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{c.label}</div>
                    </div>
                ))}
            </div>

            {showForm && (
                <div className="glass-card" style={{ padding: 18, marginBottom: 14 }}>
                    <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Add New Client</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 8 }}>
                        <input value={newClient.name} onChange={e => setNewClient(p => ({ ...p, name: e.target.value }))} placeholder="Client Name *" style={inputStyle} />
                        <input value={newClient.pan} onChange={e => setNewClient(p => ({ ...p, pan: e.target.value.toUpperCase() }))} placeholder="PAN *" maxLength={10} style={inputStyle} />
                        <input value={newClient.gstin} onChange={e => setNewClient(p => ({ ...p, gstin: e.target.value.toUpperCase() }))} placeholder="GSTIN" maxLength={15} style={inputStyle} />
                        <select value={newClient.type} onChange={e => setNewClient(p => ({ ...p, type: e.target.value }))} style={inputStyle}>
                            {CLIENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <input value={newClient.phone} onChange={e => setNewClient(p => ({ ...p, phone: e.target.value }))} placeholder="Phone" style={inputStyle} />
                        <input value={newClient.email} onChange={e => setNewClient(p => ({ ...p, email: e.target.value }))} placeholder="Email" style={inputStyle} />
                    </div>
                    <button onClick={handleAdd} disabled={!newClient.name || !newClient.pan} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: 'var(--accent-gradient)', color: '#07091A', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>✅ Save Client</button>
                </div>
            )}

            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or PAN..."
                    style={{ flex: 1, padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.04)', color: 'var(--text-primary)', fontSize: 13 }} />
                {types.map(t => (
                    <button key={t} onClick={() => setTypeFilter(t)} style={{
                        padding: '6px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600,
                        background: typeFilter === t ? 'var(--accent-gradient)' : 'rgba(255,255,255,0.04)',
                        color: typeFilter === t ? '#07091A' : 'var(--text-secondary)',
                    }}>{t === 'all' ? 'All' : t}</button>
                ))}
            </div>

            <div className="glass-card" style={{ padding: 16 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead><tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                        {['Client', 'PAN', 'GSTIN', 'Type', 'Phone', 'Email', 'Status'].map(h =>
                            <th key={h} style={{ textAlign: 'left', padding: '8px', fontSize: 11, color: 'var(--text-secondary)', fontWeight: 700 }}>{h}</th>
                        )}
                    </tr></thead>
                    <tbody>{filtered.map((c, i) => (
                        <tr key={c.id || i} style={{ borderBottom: '1px solid var(--border-color)', cursor: 'pointer' }}>
                            <td style={{ padding: '10px 8px', fontWeight: 600 }}>{c.name}</td>
                            <td style={{ padding: '10px 8px', fontFamily: 'monospace', fontSize: 12 }}>{c.pan}</td>
                            <td style={{ padding: '10px 8px', fontFamily: 'monospace', fontSize: 11 }}>{c.gstin}</td>
                            <td style={{ padding: '10px 8px' }}><span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: 'rgba(201,168,76,0.12)' }}>{c.type}</span></td>
                            <td style={{ padding: '10px 8px', fontSize: 12 }}>{c.phone}</td>
                            <td style={{ padding: '10px 8px', fontSize: 12 }}>{c.email}</td>
                            <td style={{ padding: '10px 8px' }}>
                                <span style={{
                                    padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700,
                                    background: c.status === 'Active' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                                    color: c.status === 'Active' ? '#22c55e' : '#ef4444'
                                }}>{c.status}</span>
                            </td>
                        </tr>
                    ))}</tbody>
                </table>
            </div>
        </div>
    );
}
