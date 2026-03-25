'use client';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import { UserButton, useUser } from '@clerk/nextjs';
import ClerkApiProvider from '@/components/ClerkApiProvider';

const NAV_ITEMS = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
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

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, isLoaded } = useUser();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    if (!isLoaded) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}><div className="gradient-text" style={{ fontSize: 24, fontWeight: 700 }}>Loading...</div></div>;

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
                <nav style={{ flex: 1, padding: '16px 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {NAV_ITEMS.map(item => (
                        <div key={item.path} className={`sidebar-link ${pathname === item.path ? 'active' : ''}`} onClick={() => router.push(item.path)} style={{ cursor: 'pointer' }}>
                            <span style={{ fontSize: 20, flexShrink: 0 }}>{item.icon}</span>
                            {sidebarOpen && <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>}
                        </div>
                    ))}
                </nav>

                {/* User Profile with Clerk */}
                <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <UserButton
                        appearance={{
                            elements: {
                                avatarBox: { width: 36, height: 36 },
                            }
                        }}
                    />
                    {sidebarOpen && user && (
                        <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {user.fullName || user.firstName || 'User'}
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {user.primaryEmailAddress?.emailAddress || ''}
                            </div>
                        </div>
                    )}
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, overflow: 'auto' }}>
                <ClerkApiProvider>
                    <div style={{ padding: '32px 40px', maxWidth: 1400 }}>
                        {children}
                    </div>
                </ClerkApiProvider>
            </main>
        </div>
    );
}
