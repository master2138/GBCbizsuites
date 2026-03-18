'use client';
import { useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { setTokenGetter } from '@/lib/api';

/**
 * ClerkApiProvider — wires Clerk session tokens into our API client.
 * Place this inside ClerkProvider (e.g., in the dashboard layout).
 */
export default function ClerkApiProvider({ children }: { children: React.ReactNode }) {
    const { getToken } = useAuth();

    useEffect(() => {
        setTokenGetter(async () => {
            try {
                return await getToken();
            } catch {
                return null;
            }
        });
    }, [getToken]);

    return <>{children}</>;
}
