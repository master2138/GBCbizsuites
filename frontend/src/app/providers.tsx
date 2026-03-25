'use client';

import { ClerkProvider } from '@clerk/nextjs';

const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default function Providers({ children }: { children: React.ReactNode }) {
    if (!clerkKey) {
        return <>{children}</>;
    }

    return <ClerkProvider publishableKey={clerkKey}>{children}</ClerkProvider>;
}
