'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await api.login(email, password);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', padding: 24 }}>
            <div className="glass-card animate-fadeIn" style={{ padding: 48, maxWidth: 440, width: '100%' }}>
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 16px' }}>⚡</div>
                    <h1 style={{ fontSize: 28, fontWeight: 800 }} className="gradient-text">Welcome Back</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>Sign in to CA Mega Suite</p>
                </div>

                {error && <div style={{ padding: 12, borderRadius: 12, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: 14, marginBottom: 24, textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleLogin}>
                    <div style={{ marginBottom: 20 }}>
                        <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)' }}>Email</label>
                        <input className="input-field" type="email" placeholder="you@firm.com" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div style={{ marginBottom: 28 }}>
                        <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)' }}>Password</label>
                        <input className="input-field" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>
                    <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', fontSize: 16, padding: '14px 0' }}>
                        {loading ? '⏳ Signing in...' : '🔐 Sign In'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-secondary)', fontSize: 14 }}>
                    Don&apos;t have an account?{' '}
                    <span style={{ color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600 }} onClick={() => router.push('/register')}>Register here</span>
                </p>
            </div>
        </div>
    );
}
