'use client';
import { useState, useRef, useEffect } from 'react';

type Message = { role: 'user' | 'assistant'; content: string; timestamp: Date };

const QUICK_PROMPTS = [
    'What is Section 80C deduction limit for FY 2025-26?',
    'How to claim HRA exemption?',
    'What are the due dates for GSTR-1 filing?',
    'Explain old vs new tax regime comparison',
    'What is TDS rate on professional fees u/s 194J?',
    'How to compute advance tax instalments?',
    'What is the penalty for late filing of ITR?',
    'Explain ITC reversal under Rule 42 and 43',
];

const TAX_KNOWLEDGE: Record<string, string> = {
    '80c': `**Section 80C Deductions (FY 2025-26)**\n\n📌 Maximum limit: **₹1,50,000**\n\n**Eligible Investments:**\n- PPF (Public Provident Fund)\n- ELSS Mutual Funds (3-year lock-in)\n- NSC (National Savings Certificate)\n- Tax-saving FD (5-year lock-in)\n- Life Insurance Premium\n- EPF/VPF contributions\n- Sukanya Samriddhi Yojana\n- Home Loan Principal repayment\n- Tuition fees (max 2 children)\n- Senior Citizens Saving Scheme\n\n⚠️ **Note:** This deduction is available only under the **Old Tax Regime**. The New Regime does not allow Section 80C deductions.`,
    'hra': `**HRA Exemption Calculation**\n\n📌 **Exempt HRA** is the minimum of:\n1. Actual HRA received\n2. 50% of salary (metro) or 40% (non-metro)\n3. Rent paid − 10% of salary\n\n**Salary** = Basic + DA (if forming part of retirement benefits)\n\n**Example:** Basic ₹50,000, HRA ₹20,000, Rent ₹18,000 (Delhi)\n- Min(₹20,000, ₹25,000, ₹13,000) = **₹13,000 exempt**\n\n📋 **Documents needed:** Rent receipts, landlord PAN (if rent > ₹1L/year)`,
    'gstr': `**GSTR-1 Filing Due Dates (FY 2025-26)**\n\n📅 **Monthly filers** (turnover > ₹5 Cr): 11th of next month\n📅 **Quarterly (QRMP)** (turnover ≤ ₹5 Cr): \n- Q1 (Apr-Jun): 13 Jul\n- Q2 (Jul-Sep): 13 Oct\n- Q3 (Oct-Dec): 13 Jan\n- Q4 (Jan-Mar): 13 Apr\n\n📅 **GSTR-3B**: 20th of next month (monthly) or 22nd/24th (quarterly)\n📅 **GSTR-9**: 31 Dec (annual return)\n📅 **GSTR-9C**: 31 Dec (reconciliation statement, turnover > ₹5 Cr)`,
    'regime': `**Old vs New Tax Regime (FY 2025-26)**\n\n| Slab | Old Regime | New Regime |\n|------|-----------|------------|\n| 0–3L | Nil | Nil |\n| 3–7L | 5-20% | 5% |\n| 7–10L | 20% | 10% |\n| 10–12L | 30% | 15% |\n| 12–15L | 30% | 20% |\n| 15L+ | 30% | 30% |\n\n✅ **New Regime**: Standard deduction ₹75,000, no 80C/80D\n✅ **Old Regime**: All deductions (80C, 80D, HRA, LTA) available\n\n💡 **Tip**: New regime is better if total deductions < ₹3.75L`,
    'tds': `**TDS Rate on Professional Fees — Section 194J**\n\n📌 **Rate**: **10%** on professional/technical fees\n📌 **Threshold**: TDS applicable if payment > ₹30,000 in a year\n\n**Covered services:**\n- Professional fees (CA, lawyer, doctor, engineer)\n- Technical services\n- Royalty\n- Non-compete fees\n\n⚠️ **Section 194J(a)**: 2% for technical services (call center, etc.)\n⚠️ **Section 194J(b)**: 10% for professional fees\n\n📋 TDS return: **Form 26Q** (quarterly)`,
    'advance': `**Advance Tax Instalments**\n\n📅 Due dates & cumulative payment:\n| Due Date | % of Tax |\n|----------|----------|\n| 15 Jun | 15% |\n| 15 Sep | 45% |\n| 15 Dec | 75% |\n| 15 Mar | 100% |\n\n⚠️ Interest u/s 234C for shortfall\n📌 Not applicable if total tax < ₹10,000`,
    'penalty': `**Penalty for Late Filing of ITR**\n\n📌 **Section 234F:**\n- Filed after due date but before 31 Dec: **₹5,000**\n- Filed after 31 Dec: **₹10,000**\n- If total income ≤ ₹5L: **₹1,000** (capped)\n\n📌 **Section 234A** — Interest on unpaid tax: **1% per month**\n📌 Loss of carry-forward: Cannot carry forward losses (except house property loss) if ITR filed late`,
    'itc': `**ITC Reversal — Rule 42 & 43**\n\n**Rule 42 (Input Services & Inputs):**\n- Common ITC for taxable + exempt supplies\n- Formula: ITC × (exempt turnover / total turnover)\n- Must reverse monthly, reconcile annually\n\n**Rule 43 (Capital Goods):**\n- ITC spread over 60 months (5 years)\n- Proportionate reversal for exempt use\n- Full reversal if sold/scrapped\n\n⚠️ Block credit u/s 17(5): Motor vehicles, food, health, travel, construction`,
};

export default function AIChatbotPage() {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: '👋 Welcome to **AI CA Assistant**!\n\nI can help you with:\n- 📊 Tax computations & deductions\n- 🏛️ GST filing rules & ITC\n- 📅 Compliance deadlines\n- 📋 Section references & explanations\n\nAsk me anything about Indian tax law!', timestamp: new Date() },
    ]);
    const [input, setInput] = useState('');
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const getResponse = (query: string): string => {
        const q = query.toLowerCase();
        for (const [key, value] of Object.entries(TAX_KNOWLEDGE)) {
            if (q.includes(key) || (key === '80c' && q.includes('section 80')) || (key === 'hra' && q.includes('hra')) ||
                (key === 'gstr' && (q.includes('gstr') || q.includes('gst') && q.includes('due'))) ||
                (key === 'regime' && (q.includes('regime') || q.includes('old') && q.includes('new'))) ||
                (key === 'tds' && q.includes('194j')) || (key === 'advance' && q.includes('advance tax')) ||
                (key === 'penalty' && q.includes('penalty') || key === 'penalty' && q.includes('late')) ||
                (key === 'itc' && (q.includes('itc') || q.includes('rule 42') || q.includes('rule 43')))) {
                return value;
            }
        }
        return `I understand you're asking about: **"${query}"**\n\nThis is a demo of the AI CA Assistant interface. In production, this would be powered by **Claude AI + RAG** on:\n- Income Tax Act, 1961\n- GST Act, 2017\n- CBDT/CBIC Circulars & Notifications\n- ICAI Technical Guides\n\n💡 **Try these topics for instant answers:**\n- Section 80C, HRA, TDS rates\n- GSTR filing due dates\n- Old vs New regime comparison\n- Advance tax instalments\n- ITC reversal rules`;
    };

    const sendMessage = () => {
        if (!input.trim()) return;
        const userMsg: Message = { role: 'user', content: input, timestamp: new Date() };
        const response = getResponse(input);
        const botMsg: Message = { role: 'assistant', content: response, timestamp: new Date() };
        setMessages(prev => [...prev, userMsg, botMsg]);
        setInput('');
    };

    return (
        <div className="animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
            <div style={{ marginBottom: 16 }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>🤖 AI CA Assistant</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Ask tax law questions — powered by Claude AI + RAG on IT Act, GST Act & CBDT circulars</p>
            </div>

            {/* Chat Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {messages.map((m, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                        <div style={{
                            maxWidth: '75%', padding: '12px 16px', borderRadius: 14,
                            background: m.role === 'user' ? 'linear-gradient(135deg, #C9A84C, #E8CC7D)' : 'var(--bg-secondary)',
                            color: m.role === 'user' ? '#0f172a' : 'var(--text-primary)',
                            border: m.role === 'assistant' ? '1px solid var(--border-color)' : 'none',
                            borderBottomRightRadius: m.role === 'user' ? 4 : 14,
                            borderBottomLeftRadius: m.role === 'assistant' ? 4 : 14,
                        }}>
                            <div style={{ fontSize: 13, lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>
                                {m.content.split('\n').map((line, j) => {
                                    const bold = line.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
                                    return <div key={j} dangerouslySetInnerHTML={{ __html: bold || '&nbsp;' }} />;
                                })}
                            </div>
                            <div style={{ fontSize: 10, opacity: 0.5, marginTop: 4, textAlign: 'right' }}>
                                {m.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={endRef} />
            </div>

            {/* Quick Prompts */}
            {messages.length <= 1 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                    {QUICK_PROMPTS.map(p => (
                        <button key={p} onClick={() => { setInput(p); }} style={{
                            padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', fontSize: 11, cursor: 'pointer', fontWeight: 500,
                        }}>{p}</button>
                    ))}
                </div>
            )}

            {/* Input */}
            <div style={{ display: 'flex', gap: 10, padding: '12px 0' }}>
                <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()}
                    placeholder="Ask about tax law, GST, ITR, TDS, compliance..."
                    style={{ flex: 1, padding: '14px 18px', borderRadius: 12, border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 14, outline: 'none' }} />
                <button onClick={sendMessage} style={{ padding: '14px 28px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #C9A84C, #E8CC7D)', color: '#0f172a', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                    Send 📤
                </button>
            </div>
        </div>
    );
}
