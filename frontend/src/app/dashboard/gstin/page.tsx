'use client';
import { useState } from 'react';
import { api } from '@/lib/api';

export default function GSTINPage() {
    const [gstin, setGstin] = useState('');
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState<any[]>([]);

    const verify = async () => {
        if (!gstin.trim()) return;
        setLoading(true); setError(''); setResult(null);
        try {
            const r = await api.verifyGSTIN(gstin.toUpperCase().trim());
            setResult(r);
            setHistory(prev => [{ gstin: gstin.toUpperCase(), ...r, timestamp: new Date().toLocaleString() }, ...prev].slice(0, 20));
        } catch (err: any) { setError(err.message); }
        setLoading(false);
    };

    return (
        <div className="animate-fadeIn">
            <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 4 }}>GSTIN Verifier</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>Validate GSTIN format, verify check digit, extract PAN and entity type</p>

            {/* Input */}
            <div className="glass-card" style={{ padding: 32, marginBottom: 24 }}>
                <div style={{ display: 'flex', gap: 12 }}>
                    <input className="input-field" value={gstin} onChange={e => setGstin(e.target.value.toUpperCase())} placeholder="Enter GSTIN (e.g. 27AADCB2230M1ZA)" style={{ fontFamily: 'monospace', fontSize: 18, letterSpacing: 2, flex: 1 }} maxLength={15} onKeyDown={e => e.key === 'Enter' && verify()} />
                    <button className="btn-primary" onClick={verify} disabled={loading || gstin.length !== 15} style={{ fontSize: 16, padding: '14px 32px' }}>
                        {loading ? '⏳' : '🔍 Verify'}
                    </button>
                </div>
                <div style={{ marginTop: 12, fontSize: 13, color: 'var(--text-secondary)' }}>
                    Format: 2 digits (State) + 10 chars (PAN) + 1 digit (Entity) + 1 char (Z) + 1 check digit
                </div>
            </div>

            {error && <div style={{ padding: 16, borderRadius: 12, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', marginBottom: 24 }}>{error}</div>}

            {/* Result */}
            {result && (
                <div className="glass-card" style={{ padding: 32, marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: result.valid ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                            {result.valid ? '✅' : '❌'}
                        </div>
                        <div>
                            <h2 style={{ fontSize: 22, fontWeight: 700 }}>{result.valid ? 'Valid GSTIN' : 'Invalid GSTIN'}</h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{result.message}</p>
                        </div>
                    </div>

                    {result.details && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                            <ResultItem label="GSTIN" value={result.details.gstin} mono />
                            <ResultItem label="State" value={`${result.details.state_code} — ${result.details.state_name}`} />
                            <ResultItem label="PAN" value={result.details.pan} mono />
                            <ResultItem label="PAN Holder Type" value={result.details.pan_holder_type} />
                            <ResultItem label="Entity Number" value={result.details.entity_number} />
                            <ResultItem label="Check Digit" value={result.details.check_digit_valid ? '✅ Valid' : '❌ Invalid'} color={result.details.check_digit_valid ? '#22c55e' : '#ef4444'} />
                        </div>
                    )}

                    {result.errors && result.errors.length > 0 && (
                        <div style={{ marginTop: 20 }}>
                            <h4 style={{ fontWeight: 600, marginBottom: 8, color: '#ef4444' }}>Errors:</h4>
                            <ul style={{ paddingLeft: 20, color: '#ef4444', fontSize: 14 }}>
                                {result.errors.map((e: string, i: number) => <li key={i}>{e}</li>)}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {/* History */}
            {history.length > 0 && (
                <div className="glass-card" style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>📋 Verification History</h3>
                    <div className="table-container">
                        <table>
                            <thead><tr><th>GSTIN</th><th>Valid</th><th>State</th><th>PAN</th><th>Time</th></tr></thead>
                            <tbody>
                                {history.map((h, i) => (
                                    <tr key={i}>
                                        <td style={{ fontFamily: 'monospace' }}>{h.gstin}</td>
                                        <td>{h.valid ? <span className="badge badge-success">✅ Yes</span> : <span className="badge badge-danger">❌ No</span>}</td>
                                        <td>{h.details?.state_name || '-'}</td>
                                        <td style={{ fontFamily: 'monospace' }}>{h.details?.pan || '-'}</td>
                                        <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{h.timestamp}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

function ResultItem({ label, value, mono, color }: { label: string; value: string; mono?: boolean; color?: string }) {
    return (
        <div style={{ padding: 16, borderRadius: 12, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 16, fontWeight: 600, fontFamily: mono ? 'monospace' : 'inherit', color: color || 'var(--text-primary)' }}>{value}</div>
        </div>
    );
}
