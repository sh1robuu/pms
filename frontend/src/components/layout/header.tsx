'use client';

import { useAlertsStore } from '@/store/alerts-store';
import { Bell } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeaderProps {
    title: string;
}

export function Header({ title }: HeaderProps) {
    const unreadCount = useAlertsStore((s) => s.unreadCount);

    return (
        <header className="sticky top-0 z-30 h-16 border-b border-pms-border bg-pms-bg/80 backdrop-blur-xl flex items-center justify-between px-8">
            <h2 className="text-lg font-semibold text-pms-text">{title}</h2>
            <div className="flex items-center gap-4">
                <div className="relative">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Bell className="w-5 h-5 text-pms-text-muted hover:text-pms-text-secondary transition-colors cursor-pointer" />
                    </motion.div>
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </div>
            </div>
        </header>
    );
}
