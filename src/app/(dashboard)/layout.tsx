'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { Sidebar } from '@/components/layout/sidebar';
import { AIAssistant } from '@/components/ai-assistant';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const hydrate = useAuthStore((s) => s.hydrate);
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        hydrate();
        setMounted(true);
    }, [hydrate]);

    useEffect(() => {
        if (!mounted) return;
        if (!isAuthenticated) {
            router.replace('/login');
        }
    }, [isAuthenticated, router, mounted]);

    if (!mounted || !isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-pms-bg">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-pms-bg">
            <Sidebar />
            <main className="pl-64 min-h-screen">
                {children}
            </main>
            <AIAssistant />
        </div>
    );
}
