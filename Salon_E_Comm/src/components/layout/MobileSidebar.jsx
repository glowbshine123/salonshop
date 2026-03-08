import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import {
    User,
    Package,
    Zap,
    Bell,
    LogOut,
    ChevronRight,
    Shield,
    LayoutDashboard
} from 'lucide-react';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    useSidebar
} from '../ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import LogoutModal from '../auth/LogoutModal';
import { Button } from '../ui/button';

export default function AppSidebar() {
    const { user, logout } = useAuth();
    const { unreadCount } = useSocket();
    const { setOpenMobile } = useSidebar();
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        setIsLogoutModalOpen(false);
        logout();
        navigate('/auth/signin');
    };

    const closeSidebar = () => {
        setOpenMobile(false);
    };

    const navItems = [
        {
            title: "My Profile",
            icon: <User className="w-6 h-6" />,
            url: "/profile",
            show: user?.role === 'SALON_OWNER'
        },
        {
            title: "My Orders",
            icon: <Package className="w-6 h-6" />,
            url: "/my-orders",
            show: true
        },
        {
            title: "My Rewards",
            icon: <Zap className="w-6 h-6" />,
            url: "/my-rewards",
            show: user?.role === 'SALON_OWNER'
        },
        {
            title: "Notifications",
            icon: <Bell className="w-6 h-6" />,
            url: "/notifications",
            show: true
        },
        {
            title: "Admin Dashboard",
            icon: <Shield className="w-6 h-6" />,
            url: "/admin",
            show: user?.role === 'ADMIN'
        },
        {
            title: "Agent Dashboard",
            icon: <LayoutDashboard className="w-6 h-6" />,
            url: "/agent-dashboard",
            show: user?.role === 'AGENT'
        }
    ];

    const bottomNavItems = [
        {
            title: "Logout",
            icon: <LogOut className="w-5 h-5" />,
            action: () => setIsLogoutModalOpen(true),
            className: "text-destructive hover:text-destructive hover:bg-destructive-bg border border-destructive/20",
            show: true
        }
    ];


    return (
        <>
            <Sidebar
                side="left"
                className="border-r border-border-soft bg-white z-50 transition-all duration-300"
                style={{ "--sidebar-width-mobile": "100%" }}
            >
                <SidebarHeader className="w-full border-b border-border-soft/50">
                    <Link to="/" onClick={closeSidebar} className="w-full flex items-center group">
                        <div className="w-full h-16 flex items-center justify-center p-2">
                            <img src="/logo.jpeg" alt="Logo" className="w-full h-full object-contain" />
                        </div>
                    </Link>
                </SidebarHeader>

                <SidebarContent className="flex flex-col h-full bg-white">
                    {user ? (
                        <SidebarGroup className="py-2">
                            <SidebarGroupContent>
                                <SidebarMenu className="gap-1 px-2">
                                    {navItems.filter(item => item.show).map((item) => {
                                        const isNotifItem = item.title === 'Notifications';
                                        const hasUnread = isNotifItem && unreadCount > 0;

                                        return (
                                            <SidebarMenuItem key={item.title}>
                                                <SidebarMenuButton asChild className="h-12 px-4 bg-secondary/50 hover:bg-secondary rounded-md transition-all duration-200 border border-transparent hover:border-border-soft">
                                                    <Link to={item.url} onClick={closeSidebar} className="flex items-center justify-between w-full">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-foreground transition-colors">{item.icon}</span>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-semibold text-foreground-primary text-base">{item.title}</span>
                                                                {hasUnread && (
                                                                    <div className="w-2 h-2 bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)] animate-pulse" />
                                                                )}
                                                            </div>
                                                        </div>
                                                        <ChevronRight className="w-4 h-4 text-foreground-muted" />
                                                    </Link>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        );
                                    })}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-8 text-center bg-white space-y-6 mt-10">
                            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary animate-pulse">
                                <User size={40} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-black text-foreground-primary uppercase tracking-tight">Guest Access</h3>
                                <p className="text-sm font-semibold text-foreground-muted leading-relaxed">Login to track your orders, manage profile, and earn rewards.</p>
                            </div>
                            <Button
                                className="w-full h-14 bg-foreground text-background font-black uppercase tracking-widest text-[10px] rounded-md hover:bg-primary transition-all"
                                onClick={() => { closeSidebar(); navigate('/auth/signin'); }}
                            >
                                Login to see your data
                            </Button>
                        </div>
                    )}

                    {/* Bottom Nav Items - Pushed to bottom */}
                    {user && (
                        <SidebarGroup className="mt-auto py-2">
                            <SidebarGroupContent>
                                <SidebarMenu className="gap-1 px-2">
                                    {bottomNavItems.filter(item => item.show).map((item) => (
                                        <SidebarMenuItem key={item.title}>
                                            <SidebarMenuButton
                                                onClick={item.action}
                                                className={`h-10 px-4 rounded-md transition-all duration-200 ${item.className || 'bg-secondary/50 hover:bg-secondary border border-transparent hover:border-border-soft'}`}
                                            >
                                                <div className="flex items-center justify-between w-full">
                                                    <div className="flex items-center gap-3">
                                                        <span className="">{item.icon}</span>
                                                        <span className="font-semibold text-base">{item.title}</span>
                                                    </div>
                                                </div>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    )}
                </SidebarContent>

                {user && (
                    <SidebarFooter className="p-4 border-t border-border-soft bg-background-secondary/30">
                        <div className="flex items-center gap-3">
                            <Avatar className="w-14 h-14 border-2 border-primary/20 shadow-sm">
                                <AvatarImage src={user.avatarUrl} />
                                <AvatarFallback className="bg-primary-muted text-primary font-bold uppercase text-xl flex items-center justify-center">
                                    {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="text-lg capitalize font-bold text-foreground-primary truncate leading-tight">
                                    {user.firstName} {user.lastName}
                                </p>
                                <p className="text-sm text-foreground-secondary truncate capitalize font-medium">
                                    {user.role?.toLowerCase().replace('_', ' ')}
                                </p>
                            </div>
                        </div>
                    </SidebarFooter>
                )}
            </Sidebar>

            <LogoutModal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={handleLogout}
            />
        </>
    );
}
