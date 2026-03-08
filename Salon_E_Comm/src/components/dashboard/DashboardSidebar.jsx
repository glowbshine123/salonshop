import * as React from "react"
import { NavLink, Link, useLocation } from "react-router-dom"
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
    Store,
    ChevronRight,
} from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarRail,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
} from "@/components/ui/sidebar"
import { useAuth } from "@/context/AuthContext"
import { useSocket } from "@/context/SocketContext"
import { cn } from "@/lib/utils"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"

export function DashboardSidebar({ role = "ADMIN", ...props }) {
    const { logout, user } = useAuth()
    const { unreadCount, unreadOrderCount } = useSocket()
    const location = useLocation()

    const navGroups = role === "ADMIN" ? [
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
                { icon: ShoppingBag, label: 'Orders', path: '/admin/orders', badge: unreadOrderCount },
            ]
        },
        {
            title: "Payments",
            items: [
                { icon: Trophy, label: 'Commissions', path: '/admin/commissions' },
                { icon: DollarSign, label: 'Payout', path: '/admin/payouts' },
            ]
        }
    ] : [
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
    ]

    return (
        <Sidebar collapsible="icon" className="border-r border-neutral-100 bg-white" {...props}>
            <SidebarHeader className="h-16 flex items-center px-6 border-b border-neutral-50 bg-white">
                <Link to="/" className="flex items-center gap-3 group w-full h-full justify-center">
                    <img src="/logo.jpeg" className="w-fit h-full" alt="" />
                </Link>
            </SidebarHeader>
            <SidebarContent className="px-2 py-4 scrollbar-hide bg-white dark:bg-white">
                {navGroups.map((group) => (
                    <SidebarGroup key={group.title}>
                        <SidebarGroupLabel className="px-4 text-[10px] font-black text-neutral-400 uppercase tracking-widest leading-none mb-2">
                            {group.title}
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {group.items.map((item) => (
                                    <SidebarMenuItem key={item.path}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))}
                                            tooltip={item.label}
                                            className={cn(
                                                "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all group/item hover:bg-primary/10",
                                                (location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path)))
                                                    ? "bg-primary/10 text-primary font-bold"
                                                    : "text-neutral-500 hover:text-neutral-900"
                                            )}
                                        >
                                            <NavLink to={item.path} end={item.path === '/admin' || item.path === '/agent-dashboard' || item.path === '/'}>
                                                <item.icon className={cn(
                                                    "w-4 h-4 transition-transform group-hover/item:scale-110",
                                                    (location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))) ? "text-primary" : "text-neutral-400"
                                                )} />
                                                <span className="text-xs font-bold uppercase tracking-wider">{item.label}</span>
                                                {item.badge > 0 && (
                                                    <span className="ml-auto bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full flex items-center justify-center min-w-[18px] animate-pulse">
                                                        {item.badge > 99 ? '99+' : item.badge}
                                                    </span>
                                                )}
                                            </NavLink>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>
            <SidebarFooter className="p-4 border-t border-neutral-50 bg-white dark:bg-white">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            tooltip="Notifications"
                            className={cn(
                                "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all hover:bg-primary/10 text-neutral-500 hover:text-neutral-900",
                                location.pathname.includes('notifications') && "bg-primary/10 text-primary font-bold"
                            )}
                        >
                            <NavLink to={role === "ADMIN" ? "/admin/notifications" : "/agent-dashboard/notifications"}>
                                <Bell className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-wider">Notifications</span>
                                {unreadCount > 0 && (
                                    <span className="ml-auto bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full flex items-center justify-center min-w-[18px]">
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </span>
                                )}
                            </NavLink>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            tooltip="Settings"
                            className={cn(
                                "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all hover:bg-primary/10 text-neutral-500 hover:text-neutral-900",
                                location.pathname.includes('settings') && "bg-primary/10 text-primary font-bold"
                            )}
                        >
                            <NavLink to={role === "ADMIN" ? "/admin/settings" : "/agent-dashboard/settings"}>
                                <Settings className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-wider">Settings</span>
                            </NavLink>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>

                {/* Profile Card */}
                <div className="mt-4 p-2 bg-neutral-50 rounded-xl border border-neutral-100 flex items-center gap-3 group/profile group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:border-none">
                    {user?.avatarUrl ?
                        <img src={user.avatarUrl} alt="" className="w-10 h-10 rounded-xl bg-white text-primary flex items-center justify-center font-black text-sm border border-neutral-100 shadow-sm ring-2 ring-transparent group-hover/profile:ring-primary/20 transition-all shrink-0" />
                        : <div className="w-10 h-10 rounded-xl bg-white text-primary flex items-center justify-center font-black text-sm border border-neutral-100 shadow-sm ring-2 ring-transparent group-hover/profile:ring-primary/20 transition-all shrink-0">
                            {user?.firstName?.[0] || 'A'}
                        </div>}
                    <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                        <p className="text-xs capitalize font-bold text-neutral-900 tracking-wide truncate">{user?.firstName} {user?.lastName}</p>
                        <p className="text-[9px] font-bold text-neutral-400 truncate uppercase tracking-widest">{role}</p>
                    </div>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                onClick={logout}
                                className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all group-data-[collapsible=icon]:hidden"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                            <p>Logout Session</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
