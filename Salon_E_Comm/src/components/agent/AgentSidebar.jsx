import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
    LayoutDashboard,
    ShoppingBag,
    DollarSign,
    LogOut,
    Bell,
    User,
    Home,
    Store,
    Settings
} from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '../ui/tooltip';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { cn } from '@/lib/utils';

export default function AgentSidebar() {
    const { logout, user } = useAuth();
    const { unreadCount } = useSocket();

    const navGroups = [
        {
            title: "Overview",
            items: [
                { icon: LayoutDashboard, label: 'Dashboard', path: '/agent-dashboard' },
                { icon: Home, label: 'Homepage', path: '/' },
            ]
        },
        {
            title: "Management",
            items: [
                { icon: ShoppingBag, label: 'Orders', path: '/agent-dashboard/orders' },
                { icon: Store, label: 'Customers', path: '/agent-dashboard/customers' },
            ]
        },
        {
            title: "Finance",
            items: [
                { icon: DollarSign, label: 'Earnings', path: '/agent-dashboard/payouts' },
            ]
        }
    ];

    return (
        <aside className="w-64 bg-white border-r border-neutral-100 flex flex-col h-screen fixed left-0 top-0 z-20 shadow-sm print:hidden">
            {/* Header */}
            <div className="px-8 py-4 flex items-center gap-3">
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 bg-neutral-900 rounded-xl flex items-center justify-center shadow-lg shadow-neutral-900/20 group-hover:scale-105 transition-transform duration-300">
                        <span className="text-white font-black text-xl">S</span>
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-lg font-black text-neutral-900 tracking-tighter leading-none group-hover:text-emerald-600 transition-colors">SALON</h1>
                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest leading-none mt-1">Agent Panel</span>
                    </div>
                </Link>
            </div>

            {/* Scrollable Navigation Area */}
            <div className="flex-1 overflow-y-auto px-4 scrollbar-hide">
                {navGroups.map((group, idx) => (
                    <div key={idx} className="">
                        <p className="px-4 mt-4 text-xs font-bold text-neutral-400 tracking-widest uppercase">{group.title}</p>
                        {group.items.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.path === '/agent-dashboard' || item.path === '/'}
                                className={({ isActive }) => cn(
                                    "flex items-center gap-3 px-4 py-2 rounded-md transition-all group",
                                    isActive
                                        ? "bg-emerald-50 text-emerald-700 shadow-sm"
                                        : "text-neutral-500 hover:bg-emerald-500/10 hover:text-neutral-900"
                                )}
                            >
                                <item.icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                                <span className="font-bold text-xs uppercase tracking-wider">{item.label}</span>
                            </NavLink>
                        ))}
                    </div>
                ))}
            </div>

            {/* Fixed Footer Area */}
            <div className="p-4 border-t border-neutral-50 space-y-4">
                <NavLink
                    to="/agent-dashboard/notifications"
                    className={({ isActive }) => cn(
                        "flex items-center justify-between px-4 py-2 rounded-md transition-all group",
                        isActive
                            ? "bg-emerald-500/10 text-emerald-700"
                            : "text-neutral-500 hover:bg-emerald-500/10 hover:text-neutral-900"
                    )}
                >
                    <div className="flex items-center gap-3">
                        <Bell className="w-4 h-4 transition-transform group-hover:scale-110" />
                        <span className="font-bold text-xs uppercase tracking-wider">Notifications</span>
                    </div>
                    {unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full flex items-center justify-center min-w-[18px]">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </NavLink>

                <NavLink
                    to="/agent-dashboard/settings"
                    className={({ isActive }) => cn(
                        "flex items-center gap-3 px-4 py-2 rounded-md transition-all group",
                        isActive
                            ? "bg-emerald-500/10 text-emerald-700"
                            : "text-neutral-500 hover:bg-emerald-500/10 hover:text-neutral-900"
                    )}
                >
                    <Settings className="w-4 h-4 transition-transform group-hover:scale-110" />
                    <span className="font-bold text-xs uppercase tracking-wider">Settings</span>
                </NavLink>

                {/* Profile Card */}
                <div className="p-2 bg-neutral-50 rounded-lg border border-neutral-100 flex items-center gap-3 group/profile">
                    <div className="w-10 h-10 rounded-xl bg-white text-emerald-600 flex items-center justify-center font-black text-sm border border-neutral-100 shadow-sm ring-2 ring-transparent group-hover/profile:ring-emerald-500/20 transition-all">
                        {user?.firstName?.[0] || 'A'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs capitalize font-bold text-neutral-900 tracking-wide truncate">{user?.firstName} {user?.lastName}</p>
                        <p className="text-[9px] font-bold text-neutral-400 truncate uppercase tracking-widest">{user?.role?.replace('_', ' ')}</p>
                    </div>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                onClick={logout}
                                className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                            <p>Logout Session</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
            </div>
        </aside>
    );
}
