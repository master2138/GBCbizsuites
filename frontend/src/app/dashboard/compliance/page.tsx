'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

const CATEGORIES = ['ALL', 'GST', 'TDS', 'INCOME_TAX', 'MCA', 'CUSTOM', 'OTHER'];
const CAT_COLORS: Record<string, string> = {
    GST: '#3b82f6', TDS: '#10b981', INCOME_TAX: '#f59e0b', MCA: '#8b5cf6', CUSTOM: '#ec4899', OTHER: '#6b7280',
};
const CAT_ICONS: Record<string, string> = {
    GST: '🏛️', TDS: '📊', INCOME_TAX: '💰', MCA: '🏢', CUSTOM: '📌', OTHER: '📋',
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function CompliancePage() {
    const [deadlines, setDeadlines] = useState<any[]>([]);
    const [upcoming, setUpcoming] = useState<any[]>([]);
    const [category, setCategory] = useState('ALL');
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [view, setView] = useState<'calendar' | 'list'>('list');
    const [showAdd, setShowAdd] = useState(false);
    const [newTask, setNewTask] = useState({ title: '', category: 'OTHER', due_date: '', description: '' });
    const [loading, setLoading] = useState(false);

    const loadData = async () => {
        try {
            const [cal, up] = await Promise.all([
                api.getComplianceCalendar({ month, year, category: category !== 'ALL' ? category : undefined }),
                api.getUpcomingDeadlines(60),
            ]);
            setDeadlines(cal);
            setUpcoming(up);
        } catch { }
    };

    useEffect(() => { loadData(); }, [month, year, category]);

    const addTask = async () => {
        if (!newTask.title || !newTask.due_date) return;
        setLoading(true);
        try {
            await api.createComplianceTask(newTask);
            setNewTask({ title: '', category: 'OTHER', due_date: '', description: '' });
            setShowAdd(false);
            loadData();
        } catch { }
        setLoading(false);
    };

    const completeTask = async (id: string) => {
        try {
            await api.updateComplianceTask(id, { status: 'COMPLETED' });
            loadData();
        } catch { }
    };

    const deleteTask = async (id: string) => {
        try {
            await api.deleteComplianceTask(id);
            loadData();
        } catch { }
    };

    const daysUntil = (dateStr: string) => {
        const d = new Date(dateStr);
        const now = new Date();
        return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    };

    const urgencyColor = (days: number) => {
        if (days < 0) return '#ef4444';
        if (days <= 7) return '#f59e0b';
        if (days <= 15) return '#3b82f6';
        return '#10b981';
    };

    // Group deadlines by week for calendar view
    const calendarDays = Array.from({ length: 35 }, (_, i) => {
        const firstDay = new Date(year, month - 1, 1);
        const startOffset = firstDay.getDay();
        const day = i - startOffset + 1;
        const date = new Date(year, month - 1, day);
        const dateStr = date.toISOString().split('T')[0];
        const tasks = deadlines.filter(t => t.due_date === dateStr);
        return { day, date, dateStr, tasks, isCurrentMonth: date.getMonth() === month - 1 };
    });

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
                <div>
                    <h1 className="gradient-text" style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>📅 Compliance Calendar</h1>
                    <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0', fontSize: 14 }}>Track GST, TDS, IT, MCA deadlines — never miss a filing</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setShowAdd(!showAdd)} className="btn-primary" style={{ padding: '8px 16px', fontSize: 13 }}>
                        {showAdd ? '✕ Cancel' : '+ Add Task'}
                    </button>
                    <button onClick={() => setView(view === 'list' ? 'calendar' : 'list')} className="btn-secondary" style={{ padding: '8px 16px', fontSize: 13 }}>
                        {view === 'list' ? '📅 Calendar' : '📋 List'}
                    </button>
                </div>
            </div>

            {/* Upcoming Deadlines Pills */}
            {upcoming.length > 0 && (
                <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 20, paddingBottom: 4 }}>
                    {upcoming.slice(0, 6).map((t: any, i: number) => {
                        const days = daysUntil(t.due_date);
                        return (
                            <div key={i} className="glass-card" style={{ padding: '10px 16px', minWidth: 200, flexShrink: 0, borderLeft: `3px solid ${CAT_COLORS[t.category] || '#6b7280'}` }}>
                                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{CAT_ICONS[t.category]} {t.title}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{new Date(t.due_date).toLocaleDateString('en-IN')}</div>
                                <div style={{ fontSize: 11, fontWeight: 700, color: urgencyColor(days), marginTop: 2 }}>
                                    {days < 0 ? `⚠️ ${Math.abs(days)}d overdue` : days === 0 ? '🔴 Due today!' : `${days}d remaining`}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add Task Form */}
            {showAdd && (
                <div className="glass-card" style={{ padding: 20, marginBottom: 20 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>📌 Add Custom Compliance Task</h3>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <input placeholder="Task title *" value={newTask.title} onChange={e => setNewTask(t => ({ ...t, title: e.target.value }))} style={{ ...inputStyle, flex: 2, minWidth: 200 }} />
                        <select value={newTask.category} onChange={e => setNewTask(t => ({ ...t, category: e.target.value }))} style={{ ...inputStyle, width: 130 }}>
                            {CATEGORIES.filter(c => c !== 'ALL').map(c => <option key={c} value={c}>{CAT_ICONS[c]} {c}</option>)}
                        </select>
                        <input type="date" value={newTask.due_date} onChange={e => setNewTask(t => ({ ...t, due_date: e.target.value }))} style={{ ...inputStyle, width: 150 }} />
                        <input placeholder="Description" value={newTask.description} onChange={e => setNewTask(t => ({ ...t, description: e.target.value }))} style={{ ...inputStyle, flex: 2, minWidth: 200 }} />
                        <button onClick={addTask} className="btn-primary" disabled={loading} style={{ padding: '8px 16px', fontSize: 13 }}>✅ Add</button>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                {CATEGORIES.map(c => (
                    <button key={c} onClick={() => setCategory(c)} style={{ padding: '4px 12px', borderRadius: 8, border: '1px solid var(--border-color)', background: category === c ? (CAT_COLORS[c] || 'var(--accent-primary)') : 'transparent', color: category === c ? '#fff' : 'var(--text-secondary)', cursor: 'pointer', fontSize: 12, fontWeight: 500 }}>
                        {CAT_ICONS[c] || '📋'} {c}
                    </button>
                ))}
                <span style={{ padding: '0 8px', color: 'var(--text-secondary)' }}>|</span>
                <button onClick={() => { if (month === 1) { setMonth(12); setYear(y => y - 1); } else setMonth(m => m - 1); }} style={navBtn}>◀</button>
                <span style={{ fontSize: 14, fontWeight: 600, minWidth: 100, textAlign: 'center' }}>{MONTHS[month - 1]} {year}</span>
                <button onClick={() => { if (month === 12) { setMonth(1); setYear(y => y + 1); } else setMonth(m => m + 1); }} style={navBtn}>▶</button>
            </div>

            {/* Calendar View */}
            {view === 'calendar' ? (
                <div className="glass-card" style={{ padding: 16 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                            <div key={d} style={{ padding: '6px 4px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>{d}</div>
                        ))}
                        {calendarDays.map((d, i) => (
                            <div key={i} style={{ minHeight: 80, padding: 4, border: '1px solid var(--border-color)', borderRadius: 6, opacity: d.isCurrentMonth ? 1 : 0.3, background: d.tasks.length > 0 ? 'rgba(99,102,241,0.05)' : 'transparent' }}>
                                <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 2, color: d.date.toDateString() === new Date().toDateString() ? 'var(--accent-primary)' : 'var(--text-primary)' }}>{d.date.getDate()}</div>
                                {d.tasks.map((t: any, j: number) => (
                                    <div key={j} style={{ padding: '2px 4px', borderRadius: 4, marginBottom: 2, fontSize: 10, background: CAT_COLORS[t.category] + '20', color: CAT_COLORS[t.category], overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {t.title}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                /* List View */
                <div className="glass-card" style={{ padding: 16 }}>
                    {deadlines.length === 0 ? (
                        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 40 }}>No deadlines for {MONTHS[month - 1]} {year}.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {deadlines.map((t: any, i: number) => {
                                const days = daysUntil(t.due_date);
                                return (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 8, borderLeft: `3px solid ${CAT_COLORS[t.category] || '#6b7280'}`, background: t.status === 'COMPLETED' ? 'rgba(16,185,129,0.05)' : 'transparent' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                                            <span style={{ fontSize: 18 }}>{CAT_ICONS[t.category] || '📋'}</span>
                                            <div>
                                                <div style={{ fontSize: 13, fontWeight: 600, textDecoration: t.status === 'COMPLETED' ? 'line-through' : 'none' }}>{t.title}</div>
                                                {t.description && <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{t.description}</div>}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: CAT_COLORS[t.category] + '20', color: CAT_COLORS[t.category] }}>{t.category}</span>
                                            <span style={{ fontSize: 12, color: 'var(--text-secondary)', minWidth: 80, textAlign: 'right' }}>{new Date(t.due_date).toLocaleDateString('en-IN')}</span>
                                            <span style={{ fontSize: 11, fontWeight: 700, color: urgencyColor(days), minWidth: 80, textAlign: 'right' }}>
                                                {t.status === 'COMPLETED' ? '✅ Done' : days < 0 ? `⚠️ ${Math.abs(days)}d overdue` : days === 0 ? '🔴 Today!' : `${days}d left`}
                                            </span>
                                            {!t.isStatutory && t.status !== 'COMPLETED' && (
                                                <div style={{ display: 'flex', gap: 4 }}>
                                                    <button onClick={() => completeTask(t.id)} style={{ background: 'none', border: '1px solid var(--border-color)', borderRadius: 6, padding: '2px 6px', cursor: 'pointer', fontSize: 11 }}>✅</button>
                                                    <button onClick={() => deleteTask(t.id)} style={{ background: 'none', border: '1px solid var(--border-color)', borderRadius: 6, padding: '2px 6px', cursor: 'pointer', fontSize: 11, color: '#ef4444' }}>🗑️</button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

const inputStyle: React.CSSProperties = {
    padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-color)',
    background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 13, outline: 'none',
};

const navBtn: React.CSSProperties = {
    background: 'none', border: '1px solid var(--border-color)', borderRadius: 6,
    padding: '4px 10px', cursor: 'pointer', fontSize: 12, color: 'var(--text-primary)',
};
