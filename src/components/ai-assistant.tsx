'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X, Bot, User, Sparkles, ArrowDown } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export function AIAssistant() {
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'assistant',
            content: '🤖 Xin chào! Tôi là trợ lý Prisma PMS.\n\nGõ **"help"** để xem danh sách lệnh.\n\nVí dụ: *"Phòng 101?"*, *"Phòng trống?"*, *"Check-in hôm nay?"*',
            timestamp: new Date(),
        },
    ]);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const token = useAuthStore((s) => s.token);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (open) inputRef.current?.focus();
    }, [open]);

    const sendMessage = async () => {
        if (!input.trim() || loading) return;
        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input.trim(), timestamp: new Date() };
        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const res = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ query: userMsg.content }),
            });
            const data = await res.json();
            const botMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: data.answer || 'Không nhận được phản hồi.', timestamp: new Date() };
            setMessages((prev) => [...prev, botMsg]);
        } catch {
            setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: '❌ Lỗi kết nối. Vui lòng thử lại.', timestamp: new Date() }]);
        } finally {
            setLoading(false);
        }
    };

    const formatContent = (content: string) => {
        return content.split('\n').map((line, i) => {
            // Bold
            let formatted = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
            // Italic
            formatted = formatted.replace(/\*(.+?)\*/g, '<em>$1</em>');
            return <p key={i} className="leading-relaxed" dangerouslySetInnerHTML={{ __html: formatted || '&nbsp;' }} />;
        });
    };

    return (
        <>
            {/* Floating Button */}
            <AnimatePresence>
                {!open && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setOpen(true)}
                        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-2xl shadow-blue-500/30 flex items-center justify-center group"
                    >
                        <MessageSquare className="w-6 h-6 group-hover:hidden" />
                        <Sparkles className="w-6 h-6 hidden group-hover:block animate-pulse" />
                        {/* Pulse ring */}
                        <span className="absolute inset-0 rounded-2xl bg-blue-500/20 animate-ping" />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Panel */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="fixed bottom-6 right-6 z-50 w-[420px] h-[600px] bg-pms-sidebar/95 backdrop-blur-2xl border border-pms-border rounded-3xl shadow-2xl shadow-black/20 dark:shadow-black/50 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center gap-3 px-5 py-4 border-b border-pms-border bg-gradient-to-r from-blue-600/10 to-violet-600/10">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-semibold text-pms-text">Trợ lý AI</h3>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400">Đang hoạt động</span>
                                </div>
                            </div>
                            <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-lg hover:bg-pms-surface-hover flex items-center justify-center text-pms-text-muted hover:text-pms-text transition-all">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin">
                            {messages.map((msg, idx) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx === messages.length - 1 ? 0.1 : 0 }}
                                    className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                                >
                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${msg.role === 'assistant'
                                            ? 'bg-gradient-to-br from-blue-500/20 to-violet-500/20'
                                            : 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20'
                                        }`}>
                                        {msg.role === 'assistant'
                                            ? <Bot className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                            : <User className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                        }
                                    </div>
                                    <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-[12.5px] ${msg.role === 'assistant'
                                            ? 'bg-pms-surface border border-pms-border text-pms-text-secondary rounded-tl-sm'
                                            : 'bg-blue-600 text-white rounded-tr-sm'
                                        }`}>
                                        {formatContent(msg.content)}
                                    </div>
                                </motion.div>
                            ))}

                            {loading && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2.5">
                                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500/20 to-violet-500/20 flex items-center justify-center">
                                        <Bot className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-pms-surface border border-pms-border">
                                        <div className="flex gap-1">
                                            <div className="w-2 h-2 rounded-full bg-blue-500/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <div className="w-2 h-2 rounded-full bg-blue-500/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <div className="w-2 h-2 rounded-full bg-blue-500/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Quick Actions */}
                        <div className="px-4 py-2 flex gap-1.5 overflow-x-auto scrollbar-thin">
                            {['Phòng trống', 'Check-in hôm nay', 'Phòng chưa dọn', 'Tổng quan'].map((q) => (
                                <button
                                    key={q}
                                    onClick={() => { setInput(q); setTimeout(() => { setInput(q); sendMessageDirect(q); }, 0); }}
                                    className="px-3 py-1.5 rounded-lg bg-pms-surface border border-pms-border text-[10px] text-pms-text-muted hover:text-pms-text hover:bg-pms-surface-hover whitespace-nowrap transition-all"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>

                        {/* Input */}
                        <div className="px-4 py-3 border-t border-pms-border bg-pms-inset/50">
                            <div className="flex gap-2">
                                <input
                                    ref={inputRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                    placeholder="Hỏi về phòng, khách, tình trạng..."
                                    className="flex-1 h-10 px-4 bg-pms-surface border border-pms-border rounded-xl text-sm text-pms-text placeholder:text-pms-text-faint focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/20 transition-all"
                                    disabled={loading}
                                />
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={sendMessage}
                                    disabled={!input.trim() || loading}
                                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 disabled:opacity-40 transition-all"
                                >
                                    <Send className="w-4 h-4" />
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );

    function sendMessageDirect(text: string) {
        if (!text.trim() || loading) return;
        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text.trim(), timestamp: new Date() };
        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        fetch('/api/ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ query: text.trim() }),
        })
            .then((res) => res.json())
            .then((data) => {
                setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: data.answer || 'Không nhận được phản hồi.', timestamp: new Date() }]);
            })
            .catch(() => {
                setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: '❌ Lỗi kết nối.', timestamp: new Date() }]);
            })
            .finally(() => setLoading(false));
    }
}
