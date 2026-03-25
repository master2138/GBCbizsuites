import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const isProtectedRoute = createRouteMatcher([
    '/dashboard(.*)',
]);

// If Clerk keys are not set, skip auth middleware entirely
const clerkConfigured = !!(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY);

function fallbackMiddleware(req: NextRequest) {
    return NextResponse.next();
}

export default clerkConfigured
    ? clerkMiddleware(async (auth, req) => {
        if (isProtectedRoute(req)) {
            await auth.protect();
        }
    })
    : fallbackMiddleware;

export const config = {
    matcher: [
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        '/(api|trpc)(.*)',
    ],
};
