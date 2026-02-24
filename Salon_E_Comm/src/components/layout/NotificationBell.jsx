import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle2, Package, CreditCard, Sparkles, Clock, ChevronRight, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import { notificationAPI } from '../../services/apiService';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function NotificationBell() {
    const navigate = useNavigate();
    const { notifications, setNotifications, unreadCount, setUnreadCount } = useSocket();
    const [loading, setLoading] = useState(false);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [notifRes, countRes] = await Promise.all([
                notificationAPI.getAll({ limit: 5 }),
                notificationAPI.getCount()
            ]);
            setNotifications(notifRes.data.notifications || []);
            setUnreadCount(countRes.data.unreadCount || 0);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    const markAllRead = async () => {
        try {
            await notificationAPI.markAllAsRead();
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const handleRead = async (notif) => {
        try {
            if (!notif.isRead) {
                await notificationAPI.markAsRead(notif._id);
                setUnreadCount(prev => Math.max(0, prev - 1));
                setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
            }
            if (notif.actionLink) {
                navigate(notif.actionLink);
            }
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'ORDER': return <Package size={16} />;
            case 'PAYMENT': return <CreditCard size={16} />;
            case 'REWARD': return <Sparkles size={16} />;
            case 'COMMISSION': return <CreditCard size={16} />;
            case 'REGISTRATION': return <CheckCircle2 size={16} />;
            case 'SECURITY': return <Shield size={16} />;
            default: return <Bell size={16} />;
        }
    };

    const getColor = (type) => {
        switch (type) {
            case 'ORDER': return 'text-blue-600 bg-blue-50';
            case 'PAYMENT': return 'text-emerald-600 bg-emerald-50';
            case 'REWARD': return 'text-amber-600 bg-amber-50';
            case 'SECURITY': return 'text-red-600 bg-red-50';
            default: return 'text-neutral-600 bg-neutral-50';
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="relative p-2 text-neutral-600 hover:bg-neutral-100 rounded-full transition-colors focus:outline-none">
                    <Bell size={20} />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-black flex items-center justify-center rounded-full border border-white animate-in zoom-in">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 mt-2 p-2 rounded-[24px] shadow-2xl border-neutral-100" align="end">
                <DropdownMenuLabel className="p-4 flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-widest text-neutral-900 leading-none">Notifications</span>
                    {unreadCount > 0 && (
                        <button
                            onClick={(e) => { e.preventDefault(); markAllRead(); }}
                            className="text-[10px] font-black text-emerald-600 uppercase hover:underline"
                        >
                            Mark all read
                        </button>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="mx-2" />
                <div className="max-h-[400px] overflow-y-auto py-2">
                    {notifications.length > 0 ? (
                        notifications.map((notif) => (
                            <DropdownMenuItem
                                key={notif._id}
                                className={cn(
                                    "p-3 rounded-2xl cursor-pointer transition-all mb-1 mx-1",
                                    !notif.isRead ? "bg-emerald-50/30 hover:bg-emerald-50/50" : "hover:bg-neutral-50"
                                )}
                                onSelect={() => handleRead(notif)}
                            >
                                <div className="flex gap-4">
                                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", getColor(notif.type))}>
                                        {getIcon(notif.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={cn("text-[11px] font-black leading-none mb-1 truncate", !notif.isRead ? "text-neutral-900" : "text-neutral-500")}>
                                            {notif.title}
                                        </p>
                                        <p className="text-[10px] font-medium text-neutral-400 line-clamp-2 leading-tight">
                                            {notif.description}
                                        </p>
                                        <div className="flex items-center gap-1 mt-2 text-[9px] font-bold text-neutral-300 uppercase tracking-tighter">
                                            <Clock size={8} />
                                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                    {!notif.isRead && (
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full self-center shrink-0" />
                                    )}
                                </div>
                            </DropdownMenuItem>
                        ))
                    ) : (
                        <div className="py-12 text-center">
                            <Bell className="text-neutral-200 mx-auto mb-3" size={32} />
                            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">No notifications yet</p>
                        </div>
                    )}
                </div>
                <DropdownMenuSeparator className="mx-2" />
                <DropdownMenuItem asChild className="p-0 rounded-b-2xl overflow-hidden mt-1">
                    <Link to="/notifications" className="w-full p-4 flex items-center justify-center gap-2 text-[10px] font-black text-neutral-900 uppercase tracking-widest hover:bg-neutral-50">
                        View All Activity <ChevronRight size={14} />
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
