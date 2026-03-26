'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    CalendarArrowDown,
    CalendarArrowUp,
    BedDouble,
    KeyRound,
    ShieldAlert,
    AlertTriangle,
    Users,
    SprayCan,
    BarChart3,
    Hotel,
    LogOut,
    Sun,
    Moon,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { motion } from 'framer-motion';

const navSections = [
    {
        title: 'Operations',
        items: [
            { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { href: '/arrivals', label: 'Arrivals', icon: CalendarArrowDown },
            { href: '/departures', label: 'Departures', icon: CalendarArrowUp },
            { href: '/rooms', label: 'Room Board', icon: BedDouble },
            { href: '/keys', label: 'Key Mgmt', icon: KeyRound },
        ],
    },
    {
        title: 'People',
        items: [
            { href: '/guests', label: 'Guests', icon: Users },
        ],
    },
    {
        title: 'Monitoring',
        items: [
            { href: '/housekeeping', label: 'Housekeeping', icon: SprayCan },
            { href: '/incidents', label: 'Incidents', icon: ShieldAlert },
            { href: '/alerts', label: 'Alerts', icon: AlertTriangle },
            { href: '/reports', label: 'Reports', icon: BarChart3 },
        ],
    },
];

export function Sidebar() {
    const pathname = usePathname();
    const logout = useAuthStore((s) => s.logout);
    const user = useAuthStore((s) => s.user);
    const { theme, setTheme } = useTheme();

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-pms-border bg-pms-sidebar backdrop-blur-xl flex flex-col">
            {/* Logo */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-pms-border">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Hotel className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h1 className="text-sm font-semibold text-pms-text tracking-tight">Prisma PMS</h1>
                    <p className="text-[10px] text-pms-text-muted font-medium uppercase tracking-widest">Operations</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto scrollbar-thin">
                {navSections.map((section) => (
                    <div key={section.title}>
                        <p className="px-3 mb-2 text-[9px] font-bold text-pms-text-faint uppercase tracking-[0.2em]">{section.title}</p>
                        <div className="space-y-0.5">
                            {section.items.map((item) => {
                                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                                return (
                                    <Link key={item.href} href={item.href}>
                                        <motion.div
                                            whileHover={{ x: 2 }}
                                            whileTap={{ scale: 0.98 }}
                                            className={cn(
                                                'flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-200',
                                                isActive
                                                    ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-sm shadow-blue-500/5'
                                                    : 'text-pms-text-muted hover:text-pms-text-secondary hover:bg-pms-surface-hover'
                                            )}
                                        >
                                            <item.icon className={cn('w-4 h-4', isActive ? 'text-blue-600 dark:text-blue-400' : 'text-pms-text-faint')} />
                                            {item.label}
                                            {isActive && (
                                                <motion.div
                                                    layoutId="sidebar-active"
                                                    className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500"
                                                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                                />
                                            )}
                                        </motion.div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Theme Toggle + User section */}
            <div className="border-t border-pms-border p-4 space-y-3">
                {/* Theme Toggle */}
                <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-xs text-pms-text-muted hover:text-pms-text-secondary hover:bg-pms-surface-hover transition-all"
                >
                    {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                    {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </button>

                {/* User */}
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-emerald-500/20">
                        {user?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-pms-text-secondary truncate">{user?.name || 'User'}</p>
                        <p className="text-[10px] text-pms-text-faint uppercase tracking-wide">{user?.role?.replace('_', ' ') || 'Staff'}</p>
                    </div>
                </div>
                <button
                    onClick={() => { logout(); window.location.href = '/login'; }}
                    className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs text-pms-text-muted hover:text-red-500 hover:bg-red-500/5 transition-all"
                >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign out
                </button>
            </div>
        </aside>
    );
}
