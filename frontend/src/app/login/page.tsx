'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { Hotel, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function LoginPage() {
    const [email, setEmail] = useState('front1@hotelpms.com');
    const [password, setPassword] = useState('password123');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const login = useAuthStore((s) => s.login);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await authApi.login(email, password);
            login(res.access_token, res.user);
            toast.success('Welcome back, ' + res.user.name);
            router.push('/dashboard');
        } catch {
            toast.error('Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-pms-bg relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-3xl" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-md"
            >
                <div className="bg-pms-sidebar/80 backdrop-blur-xl border border-pms-border rounded-3xl p-8 shadow-2xl shadow-black/10 dark:shadow-black/30">
                    {/* Logo */}
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                            <Hotel className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-pms-text">Prisma PMS</h1>
                            <p className="text-xs text-pms-text-muted">Property Management System</p>
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-pms-text mb-1">Welcome back</h2>
                    <p className="text-sm text-pms-text-muted mb-8">Sign in to access operations</p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-xs font-medium text-pms-text-muted mb-2 uppercase tracking-wider">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full h-11 px-4 bg-pms-surface border border-pms-border rounded-xl text-sm text-pms-text placeholder:text-pms-text-faint focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/20 transition-all"
                                placeholder="you@hotel.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-pms-text-muted mb-2 uppercase tracking-wider">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full h-11 px-4 pr-10 bg-pms-surface border border-pms-border rounded-xl text-sm text-pms-text placeholder:text-pms-text-faint focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/20 transition-all"
                                    placeholder="Enter password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-pms-text-faint hover:text-pms-text-muted"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            type="submit"
                            disabled={loading}
                            className="w-full h-11 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-50 transition-all"
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    Sign in
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </motion.button>
                    </form>

                    {/* Demo credentials */}
                    <div className="mt-6 pt-6 border-t border-pms-border">
                        <p className="text-[10px] text-pms-text-faint uppercase tracking-wider mb-3">Demo Credentials</p>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { label: 'Admin', email: 'admin@hotelpms.com' },
                                { label: 'Manager', email: 'manager@hotelpms.com' },
                                { label: 'Front Desk', email: 'front1@hotelpms.com' },
                                { label: 'Housekeeping', email: 'housekeeping@hotelpms.com' },
                            ].map((cred) => (
                                <button
                                    key={cred.email}
                                    type="button"
                                    onClick={() => { setEmail(cred.email); setPassword('password123'); }}
                                    className="px-3 py-2 bg-pms-surface border border-pms-border rounded-lg text-left hover:bg-pms-surface-hover transition-all"
                                >
                                    <p className="text-[10px] text-pms-text-muted">{cred.label}</p>
                                    <p className="text-[11px] text-pms-text-secondary truncate">{cred.email}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
