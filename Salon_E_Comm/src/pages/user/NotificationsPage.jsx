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
import { Button } from '../../components/ui/button';
import { notificationAPI } from '../../services/apiService';
import { useLoading } from '../../context/LoadingContext';
import { useSocket } from '../../context/SocketContext';
import { toast } from 'react-hot-toast';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function NotificationsPage() {
    const navigate = useNavigate();
    const { setUnreadCount } = useSocket();
    const location = useLocation();
    const isDashboard = location.pathname.startsWith('/admin') || location.pathname.startsWith('/agent-dashboard');

    const [notifications, setNotifications] = useState([]);
    const { startLoading, finishLoading } = useLoading();
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
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
            toast.error('Failed to load notifications');
        } finally {
            setLoading(false);
            if (!append) finishLoading();
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
            case 'PAYMENT': return 'primary';
            case 'REWARD': return 'amber';
            case 'SECURITY': return 'red';
            default: return 'primary';
        }
    };

    return (
        <div className={cn(
            "min-h-screen bg-white px-4",
            isDashboard ? "py-0 bg-transparent min-h-0 px-0" : "py-20"
        )}>
            <div className={cn("mx-auto", !isDashboard && "max-w-4xl")}>
                <div className={cn(
                    "flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12",
                    isDashboard && "mb-8"
                )}>
                    <div>
                        <h1 className={cn(
                            "text-4xl font-black text-foreground tracking-tight",
                            isDashboard && "text-2xl"
                        )}>System <span className="text-primary">Notifications</span></h1>
                        <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px] mt-2">Stay updated with your professional activity</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={markAllRead}
                            className="rounded-md border-border text-[10px] font-black uppercase tracking-widest px-6 h-12 hover:bg-muted active:scale-[0.98] transition-all"
                        >
                            Mark all as read
                        </Button>
                    </div>
                </div>

                <div className="space-y-4">
                    {loading && notifications.length === 0 ? (
                        <div className="py-20 text-center">
                            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                            <p className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Fetching Notifications...</p>
                        </div>
                    ) : notifications.length > 0 ? (
                        <>
                            {notifications.map((notif) => {
                                const Icon = getIcon(notif.type);
                                const colorClass = getColor(notif.type);
                                return (
                                    <div
                                        key={notif._id}
                                        className={`group relative bg-card p-4 rounded-lg border ${notif.isRead ? 'border-border' : 'border-primary/20 bg-primary/5'} shadow-sm hover:shadow-xl hover:shadow-foreground/5 transition-all duration-500 cursor-pointer`}
                                        onClick={() => markSingleRead(notif)}
                                    >
                                        {!notif.isRead && (
                                            <div className="absolute top-6 right-6 w-2 h-2 bg-primary rounded-full animate-pulse" />
                                        )}

                                        <div className="flex gap-6">
                                            <div className={`w-14 h-14 rounded-md flex items-center justify-center shrink-0 ${colorClass === 'primary' ? 'bg-primary/5 text-primary' :
                                                colorClass === 'blue' ? 'bg-blue-50 text-blue-600' :
                                                    'bg-amber-50 text-amber-600'
                                                }`}>
                                                <Icon size={24} />
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h3 className={`font-black uppercase tracking-tight ${notif.isRead ? 'text-foreground' : 'text-primary'}`}>
                                                        {notif.title}
                                                    </h3>
                                                    <span className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                                        <Clock size={10} />
                                                        {new Date(notif.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="text-sm font-semibold text-muted-foreground leading-relaxed max-w-2xl">
                                                    {notif.description}
                                                </p>

                                                <div className="mt-4 flex items-center justify-between gap-4">
                                                    {notif.actionLink && (
                                                        <div className="px-5 py-2.5 bg-foreground text-background text-[10px] font-black uppercase tracking-widest rounded-md hover:bg-primary transition-all flex items-center gap-2">
                                                            {notif.actionText || 'View Details'} <ChevronRight size={14} />
                                                        </div>
                                                    )}
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); deleteNotification(notif._id); }}
                                                        className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1 hover:text-destructive opacity-0 group-hover:opacity-100 transition-all ml-auto"
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
                                    className="w-full py-8 text-[10px] font-black text-muted-foreground uppercase tracking-widest hover:text-primary"
                                >
                                    Load More History
                                </Button>
                            )}
                        </>
                    ) : (
                        <div className="py-20 text-center bg-card rounded-lg border border-border mt-8">
                            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6 text-muted-foreground/30">
                                <Bell size={40} />
                            </div>
                            <h3 className="text-xl font-black text-foreground uppercase tracking-widest mb-2">Clean Slate</h3>
                            <p className="text-muted-foreground font-bold">You're all caught up with your notifications.</p>
                        </div>
                    )}
                </div>

                {!isDashboard && (
                    <div className="mt-12 p-8 bg-foreground rounded-lg border border-border text-background relative overflow-hidden">
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="text-center md:text-left">
                                <h3 className="text-xl font-black tracking-tight mb-2">Automated Procurement?</h3>
                                <p className="text-muted-foreground text-sm font-semibold max-w-md">Enable smart notifications to get alerted when your best-selling professional inventory is running low.</p>
                            </div>
                            <Button className="h-14 px-8 bg-primary hover:bg-primary-hover text-background rounded-md font-black uppercase tracking-widest text-[10px] border-none">
                                Configure Alerts
                            </Button>
                        </div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
                    </div>
                )}
            </div>
        </div>
    );
}
