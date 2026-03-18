'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { api } from '@/lib/api';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const user = api.getUser();
    if (user) router.push('/dashboard');
  }, [router]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Hero */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 48px', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18 }}>⚡</div>
          <span style={{ fontSize: 22, fontWeight: 800 }} className="gradient-text">CA Mega Suite</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn-secondary" onClick={() => router.push('/login')}>Login</button>
          <button className="btn-primary" onClick={() => router.push('/register')}>Get Started Free</button>
        </div>
      </nav>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
        <div className="animate-fadeIn">
          <div style={{ display: 'inline-block', padding: '8px 20px', borderRadius: 20, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', marginBottom: 24, fontSize: 14, fontWeight: 600, color: 'var(--accent-primary)' }}>
            🚀 AI-Powered 5-in-1 Platform for CAs
          </div>
          <h1 style={{ fontSize: 56, fontWeight: 900, lineHeight: 1.1, marginBottom: 24, maxWidth: 800, margin: '0 auto 24px' }}>
            The <span className="gradient-text">Smartest Platform</span> Every CA in India Needs
          </h1>
          <p style={{ fontSize: 20, color: 'var(--text-secondary)', marginBottom: 48, maxWidth: 600, margin: '0 auto 48px', lineHeight: 1.6 }}>
            Bank Statement → Tally XML in one click. 6 financial calculators. Client management. GSTIN verification. All in one powerful dashboard.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 80 }}>
            <button className="btn-primary" style={{ fontSize: 18, padding: '16px 40px' }} onClick={() => router.push('/register')}>
              Start Free Trial →
            </button>
            <button className="btn-secondary" style={{ fontSize: 18, padding: '16px 40px' }} onClick={() => router.push('/login')}>
              Login
            </button>
          </div>
        </div>

        {/* Feature Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginBottom: 80 }}>
          {[
            { icon: '📊', title: 'Bank Statement Processor', desc: 'Upload PDF/Excel bank statements. Auto-detect bank format, categorize transactions, and export to Tally XML.' },
            { icon: '📁', title: 'Tally XML Export', desc: 'Generate Tally Prime-compatible XML with ledger masters and voucher entries. One-click import ready.' },
            { icon: '🧮', title: 'Financial Calculators', desc: 'Income Tax (Old vs New), HRA, EMI, SIP, PPF, GST — 6 precise calculators for CA professionals.' },
            { icon: '🔍', title: 'GSTIN Verifier', desc: 'Validate GSTIN format, verify check digit, extract PAN, identify entity type — with bulk verification.' },
            { icon: '👥', title: 'Client Management', desc: 'Full client database with GSTIN, PAN, contact details. Search, filter, and manage all your clients.' },
            { icon: '📈', title: 'Smart Dashboard', desc: 'Real-time stats, recent activity, transaction analytics — everything at a glance for your practice.' },
          ].map((f, i) => (
            <div key={i} className="glass-card" style={{ padding: 32, textAlign: 'left' }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>{f.icon}</div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: 14 }}>{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Modules Section */}
        <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16 }}>5 Modules. <span className="gradient-text">60+ Products.</span></h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 48, fontSize: 16 }}>One unified AI ecosystem for every CA, CS, and Tax Professional in India.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 80 }}>
          {[
            { name: 'TaxOne Pro', desc: 'GST + AI Automation', color: '#6366f1', count: '12 Products' },
            { name: 'EcomCA', desc: 'E-Commerce GST', color: '#8b5cf6', count: '10 Products' },
            { name: 'ClearCA', desc: 'ITR + Compliance', color: '#a78bfa', count: '18 Products' },
            { name: 'CorpCA', desc: 'MCA · RERA · IPR', color: '#c084fc', count: '16 Products' },
            { name: 'CyberCA', desc: 'Govt Certs & CSC', color: '#e879f9', count: '14 Products' },
          ].map((m, i) => (
            <div key={i} style={{ padding: 24, borderRadius: 16, background: `${m.color}15`, border: `1px solid ${m.color}30`, textAlign: 'center' }}>
              <h4 style={{ fontSize: 18, fontWeight: 700, color: m.color, marginBottom: 4 }}>{m.name}</h4>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>{m.desc}</p>
              <span style={{ fontSize: 12, fontWeight: 600, color: m.color }}>{m.count}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 32, color: 'var(--text-secondary)', fontSize: 14 }}>
          <p>© 2026 CA Mega Suite by GBC Associates. Built for every CA in India. 🇮🇳</p>
        </div>
      </main>
    </div>
  );
}
