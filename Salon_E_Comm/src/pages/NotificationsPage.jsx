import React, { useState, useEffect } from 'react';
import {
    Bell,
    Package,
    CreditCard,
    MessageSquare,
    Tag,
    CheckCircle2,
    Clock,
    Trash2,
    ChevronRight,
    Sparkles,
    Loader2,
    Shield
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { notificationAPI } from '../services/apiService';
import { useSocket } from '../context/SocketContext';
import { toast } from 'react-hot-toast';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function NotificationsPage() {
    const navigate = useNavigate();
    const { setUnreadCount } = useSocket();
    const location = useLocation();
    const isDashboard = location.pathname.startsWith('/admin') || location.pathname.startsWith('/agent-dashboard');

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchNotifications = async (pagenum = 1, append = false) => {
        try {
            setLoading(true);
            const res = await notificationAPI.getAll({ page: pagenum, limit: 10 });
            const newNotifs = res.data.notifications || [];

            if (append) {
                setNotifications(prev => [...prev, ...newNotifs]);
            } else {
                setNotifications(newNotifs);
            }

            setHasMore(newNotifs.length === 10);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
            toast.error('Failed to load notifications');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markAllRead = async () => {
        try {
            await notificationAPI.markAllAsRead();
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
            toast.success('All notifications marked as read');
        } catch (error) {
            toast.error('Failed to mark all as read');
        }
    };

    const markSingleRead = async (notif) => {
        try {
            if (!notif.isRead) {
                await notificationAPI.markAsRead(notif._id);
                setNotifications(notifications.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
            if (notif.actionLink) {
                navigate(notif.actionLink);
            }
        } catch (error) {
            console.error('Failed to mark as read');
        }
    };

    const deleteNotification = (id) => {
        // Option to implement delete if backend supports it
        setNotifications(notifications.filter(n => n._id !== id));
    };

    const getIcon = (type) => {
        switch (type) {
            case 'ORDER': return Package;
            case 'PAYMENT': return CreditCard;
            case 'REWARD': return Sparkles;
            case 'COMMISSION': return CreditCard;
            case 'REGISTRATION': return CheckCircle2;
            case 'SECURITY': return Shield;
            default: return Bell;
        }
    };

    const getColor = (type) => {
        switch (type) {
            case 'ORDER': return 'blue';
            case 'PAYMENT': return 'emerald';
            case 'REWARD': return 'amber';
            case 'SECURITY': return 'red';
            default: return 'emerald';
        }
    };

    return (
        <div className={cn(
            "min-h-screen bg-neutral-50/50 px-4",
            isDashboard ? "py-0 bg-transparent min-h-0 px-0" : "py-20"
        )}>
            <div className={cn("mx-auto", !isDashboard && "max-w-4xl")}>
                <div className={cn(
                    "flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12",
                    isDashboard && "mb-8"
                )}>
                    <div>
                        <h1 className={cn(
                            "text-4xl font-black text-neutral-900 tracking-tight",
                            isDashboard && "text-2xl"
                        )}>System <span className="text-emerald-600">Notifications</span></h1>
                        <p className="text-neutral-400 font-bold uppercase tracking-widest text-[10px] mt-2">Stay updated with your professional activity</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={markAllRead}
                            className="rounded-xl border-neutral-200 text-[10px] font-black uppercase tracking-widest px-6 h-12 hover:bg-white active:scale-[0.98] transition-all"
                        >
                            Mark all as read
                        </Button>
                        {!isDashboard && (
                            <Button
                                className="rounded-xl bg-neutral-900 text-white text-[10px] font-black uppercase tracking-widest px-6 h-12 shadow-lg shadow-neutral-900/20 active:scale-[0.98] transition-all"
                            >
                                Preferences
                            </Button>
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    {loading && notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[40px] border border-neutral-100">
                            <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
                            <p className="text-sm font-black text-neutral-400 uppercase tracking-widest">Loading notifications...</p>
                        </div>
                    ) : notifications.length > 0 ? (
                        <>
                            {notifications.map((notif) => {
                                const Icon = getIcon(notif.type);
                                const colorClass = getColor(notif.type);
                                return (
                                    <div
                                        key={notif._id}
                                        className={`group relative bg-white p-6 rounded-[32px] border ${notif.isRead ? 'border-neutral-100' : 'border-emerald-100 bg-emerald-50/10'} shadow-sm hover:shadow-xl hover:shadow-neutral-900/5 transition-all duration-500 cursor-pointer`}
                                        onClick={() => markSingleRead(notif)}
                                    >
                                        {!notif.isRead && (
                                            <div className="absolute top-6 right-6 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                        )}

                                        <div className="flex gap-6">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${colorClass === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                                                colorClass === 'blue' ? 'bg-blue-50 text-blue-600' :
                                                    'bg-amber-50 text-amber-600'
                                                }`}>
                                                <Icon size={24} />
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h3 className={`font-black uppercase tracking-tight ${notif.isRead ? 'text-neutral-900' : 'text-emerald-900'}`}>
                                                        {notif.title}
                                                    </h3>
                                                    <span className="flex items-center gap-1 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                                                        <Clock size={10} />
                                                        {new Date(notif.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="text-sm font-semibold text-neutral-500 leading-relaxed max-w-2xl">
                                                    {notif.description}
                                                </p>

                                                <div className="mt-4 flex items-center gap-4">
                                                    {notif.actionLink && (
                                                        <div className="px-5 py-2.5 bg-neutral-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-600 transition-all flex items-center gap-2">
                                                            {notif.actionText || 'View Details'} <ChevronRight size={14} />
                                                        </div>
                                                    )}
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); deleteNotification(notif._id); }}
                                                        className="text-[10px] font-black text-neutral-400 uppercase tracking-widest flex items-center gap-1 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                                    >
                                                        <Trash2 size={12} />
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {hasMore && (
                                <Button
                                    variant="ghost"
                                    onClick={() => { setPage(p => p + 1); fetchNotifications(page + 1, true); }}
                                    className="w-full py-8 text-[10px] font-black text-neutral-400 uppercase tracking-widest hover:text-emerald-600"
                                >
                                    Load More History
                                </Button>
                            )}
                        </>
                    ) : (
                        <div className="py-20 text-center bg-white rounded-[40px] border border-neutral-100">
                            <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6 text-neutral-300">
                                <Bell size={40} />
                            </div>
                            <h3 className="text-xl font-black text-neutral-900 uppercase tracking-widest mb-2">Clean Slate</h3>
                            <p className="text-neutral-400 font-bold">You're all caught up with your notifications.</p>
                        </div>
                    )}
                </div>

                {!isDashboard && (
                    <div className="mt-12 p-8 bg-neutral-900 rounded-[40px] border border-neutral-800 text-white relative overflow-hidden">
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="text-center md:text-left">
                                <h3 className="text-xl font-black tracking-tight mb-2">Automated Procurement?</h3>
                                <p className="text-neutral-400 text-sm font-semibold max-w-md">Enable smart notifications to get alerted when your best-selling professional inventory is running low.</p>
                            </div>
                            <Button className="h-14 px-8 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] border-none">
                                Configure Alerts
                            </Button>
                        </div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
                    </div>
                )}
            </div>
        </div>
    );
}
