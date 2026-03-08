import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, HelpCircle, MailOpen, User, Info, AlertCircle, ShoppingBag, Menu } from 'lucide-react';
import { notificationAPI } from '../../services/apiService';
import { formatDistanceToNow } from 'date-fns';
import { SidebarTrigger } from "@/components/ui/sidebar"

export default function DashboardHeader({ title }) {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const notificationRef = useRef(null);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await notificationAPI.getAll();
            const data = res.data?.notifications || [];
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.isRead).length);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await notificationAPI.markAsRead(id);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const markAllRead = async () => {
        try {
            await notificationAPI.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setIsNotificationOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getIcon = (type) => {
        switch (type) {
            case 'ORDER': return <ShoppingBag className="w-4 h-4 text-blue-500" />;
            case 'USER': return <User className="w-4 h-4 text-primary" />;
            case 'ALERT': return <AlertCircle className="w-4 h-4 text-amber-500" />;
            default: return <Info className="w-4 h-4 text-blue-500" />;
        }
    };

    return (
        <header className="h-12 bg-white border-b border-neutral-100 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30 shadow-sm transition-all duration-300">
            <div className="flex items-center gap-4">
                <SidebarTrigger className="md:hidden p-2 text-neutral-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-all">
                    {/* <Menu className="w-5 h-5" /> */}
                </SidebarTrigger>
                <h2 className="text-lg md:text-xl font-black text-neutral-900 tracking-tighter uppercase truncate max-w-[150px] md:max-w-none">{title}</h2>
            </div>

            <div className="flex items-center gap-2 md:gap-6">
                {/* <div className="relative group hidden lg:block">
                    <Search className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search system..."
                        className="pl-12 pr-4 py-2.5 bg-neutral-50 border border-neutral-100 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all w-48 xl:w-72 text-xs font-bold"
                    />
                </div> */}

                <div className="flex items-center gap-2 md:gap-3">
                    <div className="relative" ref={notificationRef}>
                        <button
                            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                            className={`p-2.5 rounded-xl transition-all relative group ${isNotificationOpen ? 'bg-primary/10 text-primary' : 'text-neutral-400 hover:text-neutral-900 hover:bg-neutral-50'}`}
                        >
                            <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'animate-swing' : ''}`} />
                            {unreadCount > 0 && (
                                <span className="absolute top-2 right-2 w-4 h-4 bg-primary text-white text-[10px] font-black rounded-full border-2 border-white flex items-center justify-center animate-in zoom-in">
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        {isNotificationOpen && (
                            <div className="absolute right-0 md:right-0 mt-4 w-[280px] md:w-96 bg-white border border-neutral-100 rounded-[24px] md:rounded-[32px] shadow-2xl shadow-neutral-900/10 overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
                                <div className="p-4 md:p-6 border-b border-neutral-50 flex items-center justify-between bg-neutral-50/50">
                                    <div>
                                        <h3 className="text-xs font-black text-neutral-900 uppercase tracking-widest">Notifications</h3>
                                        <p className="text-[9px] md:text-[10px] font-bold text-neutral-400 mt-1 uppercase tracking-widest">System Updates</p>
                                    </div>
                                    <button
                                        onClick={markAllRead}
                                        className="p-2 text-primary hover:bg-primary/10 rounded-xl transition-all"
                                        title="Mark all as read"
                                    >
                                        <MailOpen className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="max-h-[300px] md:max-h-[400px] overflow-y-auto custom-scrollbar">
                                    {loading && notifications.length === 0 ? (
                                        <div className="p-8 text-center">
                                            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                                        </div>
                                    ) : notifications.length === 0 ? (
                                        <div className="p-12 text-center">
                                            <Bell className="w-8 h-8 text-neutral-200 mx-auto mb-4" />
                                            <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">No notifications</p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-neutral-50">
                                            {notifications.map((n) => (
                                                <div
                                                    key={n._id}
                                                    onClick={() => !n.isRead && markAsRead(n._id)}
                                                    className={`p-4 md:p-6 flex gap-4 hover:bg-neutral-50 transition-all cursor-pointer relative group ${!n.isRead ? 'bg-primary/5' : ''}`}
                                                >
                                                    {!n.isRead && (
                                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                                                    )}
                                                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center shrink-0 ${!n.isRead ? 'bg-white shadow-sm ring-1 ring-primary-muted' : 'bg-neutral-50'}`}>
                                                        {getIcon(n.type)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <h4 className={`text-xs font-black truncate ${!n.isRead ? 'text-neutral-900' : 'text-neutral-500'}`}>
                                                                {n.title}
                                                            </h4>
                                                            <span className="text-[8px] md:text-[9px] font-bold text-neutral-400 whitespace-nowrap ml-2">
                                                                {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                                                            </span>
                                                        </div>
                                                        <p className={`text-[10px] md:text-[11px] leading-relaxed line-clamp-2 ${!n.isRead ? 'text-neutral-600 font-bold' : 'text-neutral-400 font-medium'}`}>
                                                            {n.message}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <button className="hidden sm:flex p-2.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-50 rounded-xl transition-all">
                        <HelpCircle className="w-5 h-5" />
                    </button>

                    {/* <div className="w-px h-6 md:h-8 bg-neutral-100 mx-0.5 md:mx-1" />

                    <button className="flex items-center gap-2 p-1 md:p-1.5 md:pl-3 bg-neutral-50 border border-neutral-100 rounded-xl md:rounded-2xl hover:border-primary-muted transition-all group">
                        <div className="hidden xl:flex flex-col items-end">
                            <span className="text-[10px] font-black text-neutral-900 uppercase tracking-tighter leading-none">Console</span>
                            <span className="text-[8px] font-black text-primary uppercase tracking-widest leading-none mt-1">Status: Active</span>
                        </div>
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-lg md:rounded-xl flex items-center justify-center shadow-sm group-hover:bg-primary/10 transition-colors">
                            <User className="text-neutral-400 group-hover:text-primary" size={18} />
                        </div>
                    </button> */}
                </div>
            </div>
        </header>
    );
}
