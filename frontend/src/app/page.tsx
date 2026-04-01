import Link from 'next/link';

const MODULES = [
  { icon: '💰', name: 'TaxOne Pro', sub: 'GST Automation', color: '#C9A84C', features: ['AI OCR Invoice Entry', 'GSTR-1/3B/9 Filing', 'E-invoicing & e-Way Bill', 'AI Notice Drafter'] },
  { icon: '🛒', name: 'EcomCA', sub: 'E-Commerce GST', color: '#8B5CF6', features: ['15+ Marketplace Parsers', 'TCS Reconciliation', 'Bank PDF → Tally XML', 'Seller Analytics'] },
  { icon: '📋', name: 'ClearCA', sub: 'ITR + Compliance', color: '#0D7B7B', features: ['ITR-1 to ITR-7', 'AI Form 16 Reader', 'Old vs New Regime', 'AI Tax Chatbot'] },
  { icon: '🏛️', name: 'CorpCA', sub: 'MCA · RERA · IPR', color: '#D4700A', features: ['SPICe+ AI Autofill', 'MCA Annual Returns', 'RERA 28 States', 'Trademark Search'] },
  { icon: '🏪', name: 'CyberCA', sub: 'Govt Certificates', color: '#0F9B6A', features: ['Income/Caste/Domicile', 'PAN & Aadhaar Services', '28 State e-District', 'CSC Dashboard'] },
  { icon: '🚢', name: 'TradeCA', sub: 'IEC · GeM · DGFT', color: '#B8352E', features: ['IEC Registration', 'GeM Bid Management', 'RoDTEP/Duty Drawback', 'Export Documentation'] },
];

const PLANS = [
  { name: 'CyberCA Starter', price: '₹499', period: '/month', modules: 'Module 5', highlight: false },
  { name: 'Tax Starter', price: '₹999', period: '/month', modules: 'M1 + M2', highlight: false },
  { name: 'CA Professional', price: '₹2,999', period: '/month', modules: 'M1 + M2 + M3', highlight: true },
  { name: 'CA Enterprise', price: '₹11,999', period: '/month', modules: 'All 6 Modules', highlight: false },
];

const STATS = [
  { value: '6', label: 'Modules' },
  { value: '75+', label: 'Products' },
  { value: '30+', label: 'Govt APIs' },
  { value: '28', label: 'States' },
  { value: '50+', label: 'Calculators' },
];

export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh', background: '#07091A', color: '#E8EEF8', fontFamily: "'Inter', 'Segoe UI', sans-serif", overflowX: 'hidden' }}>

      {/* Floating orbs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '10%', left: '20%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.06), transparent 70%)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', bottom: '20%', right: '15%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.05), transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 200, background: 'rgba(7,9,26,0.92)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(201,168,76,0.15)', height: 64, display: 'flex', alignItems: 'center', padding: '0 40px', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 24 }}>⚡</span>
          <span style={{ fontSize: 20, fontWeight: 800, background: 'linear-gradient(135deg, #fff, #C9A84C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CA Mega Suite</span>
          <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 12, background: 'linear-gradient(135deg, #C9A84C, #E8CC7D)', color: '#07091A', letterSpacing: 1 }}>v3.0</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link href="/dashboard" style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid rgba(201,168,76,0.3)', color: '#C9A84C', fontSize: 13, fontWeight: 600, textDecoration: 'none', transition: 'all 0.2s' }}>
            Sign In
          </Link>
          <Link href="/dashboard" style={{ padding: '8px 20px', borderRadius: 8, background: 'linear-gradient(135deg, #C9A84C, #E8CC7D)', color: '#07091A', fontSize: 13, fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 16px rgba(201,168,76,0.3)' }}>
            Start Free Trial
          </Link>
        </div>
      </nav>

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* HERO */}
        <section style={{ textAlign: 'center', padding: '80px 24px 60px', maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', padding: '5px 16px', borderRadius: 20, marginBottom: 28, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' as const, color: '#C9A84C' }}>
            ⚡ AI-Powered Platform
          </div>
          <h1 style={{ fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 900, lineHeight: 1.1, marginBottom: 20, background: 'linear-gradient(135deg, #fff 0%, #E8CC7D 50%, #C9A84C 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            India&apos;s First Unified<br />CA Practice Platform
          </h1>
          <p style={{ fontSize: 16, color: '#6B7A9F', maxWidth: 600, margin: '0 auto 32px', lineHeight: 1.7 }}>
            6-in-1 AI platform for Chartered Accountants, Company Secretaries, CSC operators, and Exporters.
            Replace 5-8 tools with one powerful suite.
          </p>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' as const, marginBottom: 40 }}>
            {STATS.map(s => (
              <div key={s.label} style={{ padding: '10px 20px', borderRadius: 28, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,168,76,0.15)', fontSize: 13, fontWeight: 600 }}>
                <span style={{ color: '#C9A84C', marginRight: 6 }}>{s.value}</span>{s.label}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
            <Link href="/dashboard" style={{ padding: '14px 36px', borderRadius: 10, background: 'linear-gradient(135deg, #C9A84C, #E8CC7D)', color: '#07091A', fontSize: 15, fontWeight: 700, textDecoration: 'none', boxShadow: '0 8px 32px rgba(201,168,76,0.3)', transition: 'transform 0.2s' }}>
              Start Free Trial →
            </Link>
            <Link href="/dashboard" style={{ padding: '14px 36px', borderRadius: 10, border: '1px solid rgba(201,168,76,0.3)', color: '#C9A84C', fontSize: 15, fontWeight: 600, textDecoration: 'none' }}>
              View Demo
            </Link>
          </div>
        </section>

        {/* MODULES */}
        <section style={{ padding: '60px 24px', maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8, background: 'linear-gradient(135deg, #fff, #E8CC7D)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              6 Powerful Modules
            </h2>
            <p style={{ color: '#6B7A9F', fontSize: 14 }}>From GST filing to GeM bids — one platform handles everything</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
            {MODULES.map(m => (
              <div key={m.name} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(201,168,76,0.12)', borderRadius: 16, borderTop: `3px solid ${m.color}`, padding: 24, transition: 'all 0.25s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <span style={{ fontSize: 28 }}>{m.icon}</span>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>{m.name}</div>
                    <div style={{ fontSize: 12, color: m.color, fontWeight: 600 }}>{m.sub}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
                  {m.features.map(f => (
                    <div key={f} style={{ fontSize: 13, color: '#8A95B0', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: m.color, flexShrink: 0 }} />
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FEATURES HIGHLIGHT */}
        <section style={{ padding: '60px 24px', maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8, background: 'linear-gradient(135deg, #fff, #E8CC7D)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Why CAs Choose Us
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 20 }}>
            {[
              { icon: '🤖', title: 'AI-Powered', desc: 'Claude API for notice drafting, tax chatbot, form auto-fill, and 3CD clause suggestions' },
              { icon: '🔒', title: 'Bank-Grade Security', desc: 'Clerk SSO, MFA, encrypted data, SOC 2 compliant infrastructure' },
              { icon: '📊', title: '50+ Calculators', desc: 'Income Tax, HRA, EMI, SIP, PPF, GST, TDS, Capital Gains, Crypto, and more' },
              { icon: '🔗', title: 'Tally Integration', desc: 'Bi-directional sync with Tally Prime — XML export, trial balance import' },
              { icon: '📱', title: 'Cloud-Native', desc: 'Access from anywhere — web app + mobile. No desktop install needed.' },
              { icon: '⚡', title: 'Filing Season Ready', desc: 'Optimised for peak loads — July ITR, Oct GSTR-9, Mar TDS deadlines' },
            ].map(f => (
              <div key={f.title} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(201,168,76,0.1)', borderRadius: 14, padding: 24, textAlign: 'center' }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>{f.icon}</div>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{f.title}</div>
                <div style={{ fontSize: 13, color: '#6B7A9F', lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* PRICING */}
        <section style={{ padding: '60px 24px', maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8, background: 'linear-gradient(135deg, #fff, #E8CC7D)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Simple, Transparent Pricing
            </h2>
            <p style={{ color: '#6B7A9F', fontSize: 14 }}>Start free. Scale as your practice grows.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
            {PLANS.map(p => (
              <div key={p.name} style={{
                background: p.highlight ? 'linear-gradient(135deg, rgba(201,168,76,0.12), rgba(201,168,76,0.04))' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${p.highlight ? 'rgba(201,168,76,0.4)' : 'rgba(201,168,76,0.1)'}`,
                borderRadius: 16, padding: 32, textAlign: 'center', position: 'relative' as const,
              }}>
                {p.highlight && <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #C9A84C, #E8CC7D)', color: '#07091A', fontSize: 10, fontWeight: 800, padding: '4px 14px', borderRadius: 20, letterSpacing: 1, textTransform: 'uppercase' as const }}>Most Popular</div>}
                <div style={{ fontSize: 14, fontWeight: 600, color: '#8A95B0', marginBottom: 8 }}>{p.name}</div>
                <div style={{ fontSize: 36, fontWeight: 800, marginBottom: 4 }}>
                  {p.price}<span style={{ fontSize: 14, fontWeight: 400, color: '#6B7A9F' }}>{p.period}</span>
                </div>
                <div style={{ fontSize: 12, color: '#C9A84C', marginBottom: 24 }}>{p.modules}</div>
                <Link href="/dashboard" style={{
                  display: 'block', padding: '12px 24px', borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: 13,
                  background: p.highlight ? 'linear-gradient(135deg, #C9A84C, #E8CC7D)' : 'rgba(201,168,76,0.1)',
                  color: p.highlight ? '#07091A' : '#C9A84C',
                  border: p.highlight ? 'none' : '1px solid rgba(201,168,76,0.2)',
                }}>
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{ padding: '48px 24px', borderTop: '1px solid rgba(201,168,76,0.1)', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 16 }}>
            <span style={{ fontSize: 20 }}>⚡</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#C9A84C' }}>CA Mega Suite</span>
          </div>
          <p style={{ fontSize: 12, color: '#4A5578' }}>
            © 2026 GBC & Associates. Built with ❤️ for Indian CAs.
          </p>
          <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 16 }}>
            {['Privacy', 'Terms', 'Contact', 'Support'].map(l => (
              <a key={l} href="#" style={{ fontSize: 12, color: '#6B7A9F', textDecoration: 'none' }}>{l}</a>
            ))}
          </div>
        </footer>
      </div>
    </div>
  );
}
