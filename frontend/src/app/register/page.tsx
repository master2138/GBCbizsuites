'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function RegisterPage() {
    const router = useRouter();
    const [form, setForm] = useState({ name: '', email: '', password: '', firm_name: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await api.register(form.email, form.password, form.name, form.firm_name);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const update = (field: string, value: string) => setForm(p => ({ ...p, [field]: value }));

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', padding: 24 }}>
            <div className="glass-card animate-fadeIn" style={{ padding: 48, maxWidth: 440, width: '100%' }}>
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 16px' }}>⚡</div>
                    <h1 style={{ fontSize: 28, fontWeight: 800 }} className="gradient-text">Create Account</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>Join CA Mega Suite — Free to start</p>
                </div>

                {error && <div style={{ padding: 12, borderRadius: 12, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: 14, marginBottom: 24, textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleRegister}>
                    <div style={{ marginBottom: 16 }}>
                        <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)' }}>Full Name*</label>
                        <input className="input-field" placeholder="CA Rajesh Sharma" value={form.name} onChange={e => update('name', e.target.value)} required />
                    </div>
                    <div style={{ marginBottom: 16 }}>
                        <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)' }}>Firm Name</label>
                        <input className="input-field" placeholder="GBC & Associates" value={form.firm_name} onChange={e => update('firm_name', e.target.value)} />
                    </div>
                    <div style={{ marginBottom: 16 }}>
                        <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)' }}>Email*</label>
                        <input className="input-field" type="email" placeholder="ca@firm.com" value={form.email} onChange={e => update('email', e.target.value)} required />
                    </div>
                    <div style={{ marginBottom: 28 }}>
                        <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)' }}>Password*</label>
                        <input className="input-field" type="password" placeholder="Min 6 characters" value={form.password} onChange={e => update('password', e.target.value)} required minLength={6} />
                    </div>
                    <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', fontSize: 16, padding: '14px 0' }}>
                        {loading ? '⏳ Creating account...' : '🚀 Create Account'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-secondary)', fontSize: 14 }}>
                    Already registered?{' '}
                    <span style={{ color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600 }} onClick={() => router.push('/login')}>Sign in</span>
                </p>
            </div>
        </div>
    );
}
