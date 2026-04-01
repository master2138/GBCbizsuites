'use client';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';

let UserButton: React.ComponentType<{ appearance?: Record<string, unknown> }> | null = null;
let useUserHook: (() => { user: Record<string, unknown> | null | undefined; isLoaded: boolean }) | null = null;

try {
    // Dynamic require so the dashboard works even without Clerk
    const clerk = require('@clerk/nextjs');
    UserButton = clerk.UserButton;
    useUserHook = clerk.useUser;
} catch {
    // Clerk not available — fallback
}

const NAV_ITEMS = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/dashboard/income-tax', label: 'Income Tax', icon: '⚡' },
    { path: '/dashboard/upload', label: 'Bank Statements', icon: '📄' },
    { path: '/dashboard/ecommerce', label: 'E-Commerce', icon: '🛒' },
    { path: '/dashboard/invoices', label: 'Invoices', icon: '🧾' },
    { path: '/dashboard/gst-tools', label: 'GST Tools', icon: '🏛️' },
    { path: '/dashboard/reconciliation', label: 'Reconciliation', icon: '🔄' },
    { path: '/dashboard/tally', label: 'Tally Integration', icon: '🔗' },
    { path: '/dashboard/compliance', label: 'Compliance', icon: '📅' },
    { path: '/dashboard/mca-forms', label: 'MCA Forms', icon: '🏢' },
    { path: '/dashboard/gem-portal', label: 'GeM Portal', icon: '🏪' },
    { path: '/dashboard/rera-calculator', label: 'RERA Calculator', icon: '🏠' },
    { path: '/dashboard/modules', label: 'CorpCA/CyberCA', icon: '🧩' },
    { path: '/dashboard/ai-assistant', label: 'AI Assistant', icon: '🤖' },
    { path: '/dashboard/practice', label: 'Practice Mgmt', icon: '📋' },
    { path: '/dashboard/reports', label: 'Reports', icon: '📈' },
    { path: '/dashboard/clients', label: 'Clients', icon: '👥' },
    { path: '/dashboard/calculators', label: 'Calculators', icon: '🧮' },
    { path: '/dashboard/gstin', label: 'GSTIN Verifier', icon: '🔍' },
    { path: '/dashboard/notifications', label: 'Notifications', icon: '🔔' },
];

function UserProfile({ sidebarOpen }: { sidebarOpen: boolean }) {
    if (!useUserHook || !UserButton) return null;
    try {
        const { user, isLoaded } = useUserHook();
        if (!isLoaded) return <div style={{ padding: 16, fontSize: 12, color: 'var(--text-secondary)' }}>Loading...</div>;
        return (
            <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <UserButton appearance={{ elements: { avatarBox: { width: 36, height: 36 } } }} />
                {sidebarOpen && user && (
                    <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {(user as Record<string, unknown>).fullName as string || (user as Record<string, unknown>).firstName as string || 'User'}
                        </div>
                    </div>
                )}
            </div>
        );
    } catch {
        return null;
    }
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
            {/* Sidebar */}
            <aside style={{ width: sidebarOpen ? 260 : 72, background: 'var(--bg-secondary)', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', transition: 'width 0.3s ease', overflow: 'hidden', flexShrink: 0 }}>
                {/* Logo */}
                <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0, cursor: 'pointer' }} onClick={() => setSidebarOpen(v => !v)}>⚡</div>
                    {sidebarOpen && <span style={{ fontSize: 18, fontWeight: 800, whiteSpace: 'nowrap' }} className="gradient-text">CA Mega Suite</span>}
                </div>

                {/* Nav */}
                <nav style={{ flex: 1, padding: '16px 8px', display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto' }}>
                    {NAV_ITEMS.map(item => (
                        <div key={item.path} className={`sidebar-link ${pathname === item.path ? 'active' : ''}`} onClick={() => router.push(item.path)} style={{ cursor: 'pointer' }}>
                            <span style={{ fontSize: 20, flexShrink: 0 }}>{item.icon}</span>
                            {sidebarOpen && <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>}
                        </div>
                    ))}
                </nav>

                {/* User Profile */}
                <UserProfile sidebarOpen={sidebarOpen} />
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, overflow: 'auto' }}>
                <div style={{ padding: '32px 40px', maxWidth: 1400 }}>
                    {children}
                </div>
            </main>
        </div>
    );
}

