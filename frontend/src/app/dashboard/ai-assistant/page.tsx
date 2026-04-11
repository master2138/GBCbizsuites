'use client';
import { useState } from 'react';

const SUGGESTIONS = [
    { clause: '16', title: 'Depreciation u/s 32', suggestion: 'Based on Fixed Assets Schedule: Block of Plant & Machinery shows additions of ₹12.5L. WDV method at 15%. Depreciation = ₹4,50,000. Additional depreciation on new assets: ₹1,25,000.', confidence: 95, source: 'Trial Balance → Fixed Assets Schedule' },
    { clause: '18', title: 'Sec 40(a)(ia) — TDS Default', suggestion: 'Professional fees of ₹5,80,000 paid to 3 parties without TDS deduction. Recommend disallowance of 30% = ₹1,74,000 u/s 40(a)(ia).', confidence: 88, source: 'TDS Ledger vs Sec 194J thresholds' },
    { clause: '21', title: 'TDS Deducted & Deposited', suggestion: 'Total TDS deducted: ₹8,45,000. Deposited on time: ₹7,92,000. Late deposit (>30 days): ₹53,000 on 3 challans. Interest u/s 201(1A) applicable: ₹1,590.', confidence: 92, source: '26AS / TDS Returns' },
    { clause: '26', title: 'Sec 43B — Statutory Dues', suggestion: 'PF contribution ₹2,40,000: Employee share deposited late (beyond due date u/s 36(1)(va)). Disallowance: ₹40,000. GST balance ₹1,80,000 paid before due date — allowable.', confidence: 90, source: 'PF Ledger + GST Returns' },
    { clause: '32', title: 'Ch VI-A Deductions', suggestion: 'Sec 80C: EPF ₹1,44,000 + LIC ₹50,000 + PPF ₹6,000 = ₹2,00,000. Cap at ₹1,50,000. Sec 80D: Mediclaim ₹25,000. Sec 80TTA: Interest ₹8,500.', confidence: 97, source: 'Investment Declarations + Bank Statements' },
    { clause: '34', title: 'GST Compliance', suggestion: 'GSTR-3B filed for all 12 months. GSTR-1 filed for all 12 months. GSTR-9 annual return filed. ITC reconciliation shows ₹15,000 excess claim — needs reversal.', confidence: 85, source: 'GST Portal Data + GSTR-2B Recon' },
    { clause: '38', title: 'Net Profit After Adjustments', suggestion: 'Net profit as per P&L: ₹24,50,000. Add back: Depreciation (IT vs Books) ₹85,000 + Sec 40(a)(ia) disallowance ₹1,74,000 + Sec 43B ₹40,000 = ₹26,49,000. Less: Additional depreciation ₹1,25,000. Adjusted Profit: ₹25,24,000.', confidence: 93, source: 'P&L + Computation Sheet' },
];

export default function AIAssistantPage() {
    const [tab, setTab] = useState<'suggestions' | 'chat'>('suggestions');
    const [query, setQuery] = useState('');
    const [chatHistory, setChatHistory] = useState<{ q: string; a: string }[]>([]);

    const handleAsk = () => {
        if (!query.trim()) return;
        const answers: Record<string, string> = {
            'tds': 'TDS u/s 194J must be deducted at 10% on professional fees exceeding ₹30,000. For technical services, the rate is 2%. Based on your ledger, 3 payments crossed the threshold without TDS.',
            'gst': 'GST ITC reconciliation shows: Total ITC claimed ₹18,45,000 vs GSTR-2B available ₹18,30,000. Difference of ₹15,000 needs reversal in GSTR-3B.',
            '43b': 'Section 43B allows deduction only on actual payment basis for: taxes/duties, PF/ESI, bonus, interest on term loans, and leave encashment. Your PF employee share was deposited late — disallowance applies.',
            'depreciation': 'As per IT Act, WDV depreciation applies. Plant & Machinery: 15%, Computer: 40%, Furniture: 10%, Building: 10%. Additional depreciation of 20% on new P&M acquired and put to use.',
        };
        const key = Object.keys(answers).find(k => query.toLowerCase().includes(k));
        setChatHistory(prev => [...prev, { q: query, a: key ? answers[key] : 'Based on the available data, I recommend reviewing the relevant section in the Income Tax Act. Please provide more specific details about the transaction for a precise answer.' }]);
        setQuery('');
    };

    return (
        <div className="animate-fadeIn">
            <div style={{ marginBottom: 20 }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }} className="gradient-text">AI Tax Assistant</h1>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>3CD Auto-Suggestions · Tax Law RAG · Powered by AI</p>
            </div>

            <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
                {(['suggestions', 'chat'] as const).map(t => (
                    <button key={t} onClick={() => setTab(t)} style={{
                        padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                        background: tab === t ? 'var(--accent-gradient)' : 'rgba(255,255,255,0.04)',
                        color: tab === t ? '#07091A' : 'var(--text-secondary)',
                    }}>{t === 'suggestions' ? '🧠 3CD AI Suggestions' : '💬 Ask Tax Question'}</button>
                ))}
            </div>

            {tab === 'suggestions' && (
                <div style={{ display: 'grid', gap: 12 }}>
                    {SUGGESTIONS.map((s, i) => (
                        <div key={i} className="glass-card" style={{ padding: 18, borderLeft: `3px solid ${s.confidence > 90 ? '#22c55e' : '#f59e0b'}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                <div>
                                    <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#C9A84C', marginRight: 8 }}>Clause {s.clause}</span>
                                    <span style={{ fontSize: 13, fontWeight: 600 }}>{s.title}</span>
                                </div>
                                <span style={{
                                    padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700,
                                    background: s.confidence > 90 ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)',
                                    color: s.confidence > 90 ? '#22c55e' : '#f59e0b'
                                }}>{s.confidence}% confident</span>
                            </div>
                            <p style={{ fontSize: 13, lineHeight: 1.6, margin: 0, marginBottom: 6 }}>{s.suggestion}</p>
                            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>📎 Source: {s.source}</div>
                        </div>
                    ))}
                </div>
            )}

            {tab === 'chat' && (
                <div>
                    <div className="glass-card" style={{ padding: 20, minHeight: 300, marginBottom: 12 }}>
                        {chatHistory.length === 0 && (
                            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
                                <div style={{ fontSize: 40, marginBottom: 8 }}>🤖</div>
                                <div style={{ fontSize: 14 }}>Ask any tax question — I'll reference IT Act, GST Law, and your client data</div>
                                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16, flexWrap: 'wrap' }}>
                                    {['TDS on professional fees?', 'GST ITC mismatch?', 'Sec 43B disallowance?', 'Depreciation rates?'].map(q => (
                                        <button key={q} onClick={() => { setQuery(q); }} style={{
                                            padding: '6px 14px', borderRadius: 20, border: '1px solid var(--border-color)',
                                            background: 'rgba(255,255,255,0.04)', color: 'var(--text-primary)', fontSize: 12, cursor: 'pointer'
                                        }}>{q}</button>
                                    ))}
                                </div>
                            </div>
                        )}
                        {chatHistory.map((c, i) => (
                            <div key={i} style={{ marginBottom: 16 }}>
                                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                                    <span style={{ fontSize: 16 }}>👤</span>
                                    <div style={{ padding: '10px 14px', borderRadius: '12px 12px 12px 4px', background: 'rgba(201,168,76,0.1)', fontSize: 13 }}>{c.q}</div>
                                </div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <span style={{ fontSize: 16 }}>🤖</span>
                                    <div style={{ padding: '10px 14px', borderRadius: '12px 12px 12px 4px', background: 'rgba(255,255,255,0.04)', fontSize: 13, lineHeight: 1.6, flex: 1 }}>{c.a}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAsk()}
                            placeholder="Ask: TDS rate for rent? Sec 43B applicability? GST ITC rules?"
                            style={{ flex: 1, padding: '12px 16px', borderRadius: 10, border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.04)', color: 'var(--text-primary)', fontSize: 13 }} />
                        <button onClick={handleAsk} style={{ padding: '12px 24px', borderRadius: 10, border: 'none', background: 'var(--accent-gradient)', color: '#07091A', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Send</button>
                    </div>
                </div>
            )}
        </div>
    );
}
