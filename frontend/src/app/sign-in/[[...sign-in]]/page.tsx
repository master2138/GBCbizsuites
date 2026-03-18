import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0d1117 100%)',
        }}>
            <div style={{ textAlign: 'center' }}>
                <h1 style={{
                    fontSize: 32, fontWeight: 800, marginBottom: 8,
                    background: 'linear-gradient(135deg, #fff, #60a5fa, #a78bfa)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>
                    CA Mega Suite
                </h1>
                <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 32 }}>
                    Sign in to your practice dashboard
                </p>
                <SignIn
                    appearance={{
                        elements: {
                            rootBox: { margin: '0 auto' },
                            card: {
                                background: 'rgba(15, 23, 42, 0.8)',
                                border: '1px solid rgba(99, 102, 241, 0.2)',
                                borderRadius: '16px',
                                backdropFilter: 'blur(20px)',
                            },
                        }
                    }}
                />
            </div>
        </div>
    );
}
