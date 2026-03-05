import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    Layers,
    ShoppingBag,
    Users,
    Settings,
    LogOut,
    DollarSign,
    Trophy,
    UserCircle,
    Bell,
    Home,
} from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '../ui/tooltip';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { orderAPI } from '../../services/apiService';
import { cn } from '@/lib/utils';

export default function AdminSidebar() {
    const { logout, user } = useAuth();
    const { unreadCount, unreadOrderCount, setUnreadOrderCount } = useSocket();

    React.useEffect(() => {
        if (user?.role === 'ADMIN') {
            // Listen for custom event from AdminOrders when marked as viewed
            const handleOrdersViewed = () => setUnreadOrderCount(0);
            window.addEventListener('ordersViewed', handleOrdersViewed);
            return () => window.removeEventListener('ordersViewed', handleOrdersViewed);
        }
    }, [user, setUnreadOrderCount]);

    const navGroups = [
        {
            title: "Overview",
            items: [
                { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
                { icon: Home, label: 'HomePage', path: '/' },
            ]
        },
        {
            title: "Users",
            items: [
                { icon: Users, label: 'Salons', path: '/admin/users' },
                { icon: UserCircle, label: 'Agents', path: '/admin/agents' },
            ]
        },
        {
            title: "Management",
            items: [
                { icon: Layers, label: 'Categories', path: '/admin/categories' },
                { icon: Package, label: 'Products', path: '/admin/products' },
                { icon: ShoppingBag, label: 'Orders', path: '/admin/orders' },
            ]
        },
        {
            title: "Payments",
            items: [
                { icon: Trophy, label: 'Commissions', path: '/admin/commissions' },
                { icon: DollarSign, label: 'Payout', path: '/admin/payouts' },
            ]
        }
    ];

    return (
        <aside className="w-64 bg-white border-r border-neutral-100 flex flex-col h-screen fixed left-0 top-0 z-20 shadow-sm print:hidden">
            {/* Header */}
            <div className="px-8 py-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
                    <span className="text-white font-black text-xl">S</span>
                </div>
                <div className="flex flex-col">
                    <h1 className="text-lg font-black text-neutral-900 tracking-tighter leading-none">SALON</h1>
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none mt-1">Admin Panel</span>
                </div>
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
                                end={item.path === '/admin' || item.path === '/'}
                                className={({ isActive }) => cn(
                                    "flex items-center gap-3 px-4 py-2 rounded-md transition-all group",
                                    isActive
                                        ? "bg-emerald-50 text-emerald-700 shadow-sm"
                                        : "text-neutral-500 hover:bg-emerald-500/10 hover:text-neutral-900"
                                )}
                            >
                                <item.icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                                <span className="font-bold text-xs uppercase tracking-wider flex-1 text-left">{item.label}</span>
                                {item.label === 'Orders' && unreadOrderCount > 0 && (
                                    <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full flex items-center justify-center min-w-[18px] animate-pulse">
                                        {unreadOrderCount > 99 ? '99+' : unreadOrderCount}
                                    </span>
                                )}
                            </NavLink>
                        ))}
                    </div>
                ))}
            </div>

            {/* Fixed Footer Area */}
            <div className="p-4 border-t border-neutral-50">
                <NavLink
                    to="/admin/notifications"
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
                    to="/admin/settings"
                    className={({ isActive }) => cn(
                        "flex items-center gap-3 px-4 py-2 rounded-md transition-all group",
                        isActive
                            ? "bg-emerald-500/10 text-emerald-700"
                            : "text-neutral-500 hover:bg-emerald-500/10 hover:text-neutral-900"
                    )}
                >
                    <Settings className="w-4 h-4 transition-transform group-hover:rotate-45 duration-150 ease-in-out" />
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
