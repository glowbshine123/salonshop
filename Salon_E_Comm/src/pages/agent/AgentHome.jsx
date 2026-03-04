import React, { useState, useEffect, useCallback } from 'react';
import {
    DollarSign,
    Users,
    ShoppingBag,
    TrendingUp,
    ArrowUpRight,
    ArrowRight,
    Plus,
    Copy,
    CheckCircle2,
    Calendar,
    ExternalLink,
    LineChart,
    BarChart3
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar
} from 'recharts';

import { useAuth } from '../../context/AuthContext';
import { useLoading } from '../../context/LoadingContext';
import { agentAPI, orderAPI } from '../../services/apiService';
import StatCard from '../../components/admin/StatCard';
import { Button } from '../../components/ui/button';
import { cn } from '@/lib/utils';
import SalonRegistrationModal from '../../components/agent/SalonRegistrationModal';

export default function AgentHome() {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalEarnings: 0,
        activeOrders: 0,
        totalSalons: 0,
        pendingWithdrawals: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { startLoading, finishLoading } = useLoading();
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

    // Mock Data for Graphs
    const revenueData = [
        { name: 'Jan', value: 4000 },
        { name: 'Feb', value: 3000 },
        { name: 'Mar', value: 6000 },
        { name: 'Apr', value: 8000 },
        { name: 'May', value: 5000 },
        { name: 'Jun', value: 9000 },
    ];

    const orderVolumeData = [
        { name: 'Mon', orders: 12 },
        { name: 'Tue', orders: 19 },
        { name: 'Wed', orders: 15 },
        { name: 'Thu', orders: 22 },
        { name: 'Fri', orders: 30 },
        { name: 'Sat', orders: 45 },
        { name: 'Sun', orders: 38 },
    ];

    const fetchDashboardData = useCallback(async () => {
        try {
            startLoading();
            const [statsRes, ordersRes] = await Promise.all([
                agentAPI.getDashboard(),
                orderAPI.getAssigned({ limit: 5 })
            ]);

            // Map backend stats to frontend structure
            const backendStats = statsRes.data.stats || {};
            setStats({
                totalEarnings: backendStats.earnedCommission || 0,
                activeOrders: backendStats.totalOrders || 0,
                totalSalons: backendStats.totalSalons || 0,
                pendingWithdrawals: backendStats.pendingCommission || 0
            });

            setRecentOrders(ordersRes.data.assignedOrders || []);
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        } finally {
            setLoading(false);
            finishLoading();
        }
    }, [startLoading, finishLoading]);

    useEffect(() => {
        if (user) {
            fetchDashboardData();
        }
    }, [user, fetchDashboardData]);

    const copyReferralCode = () => {
        if (user?.agentProfile?.referralCode) {
            navigator.clipboard.writeText(user.agentProfile.referralCode);
            toast.success('Referral code copied!');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'DELIVERED': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
            case 'PROCESSING': return 'text-blue-600 bg-blue-50 border-blue-100';
            case 'SHIPPED': return 'text-amber-600 bg-amber-50 border-amber-100';
            case 'CANCELLED': return 'text-rose-600 bg-rose-50 border-rose-100';
            default: return 'text-neutral-600 bg-neutral-50 border-neutral-100';
        }
    };

    if (loading && stats.totalEarnings === 0) return null;

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-20">
            {/* Minimal Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-neutral-900 tracking-tighter uppercase leading-none">
                        Agent <span className="text-emerald-600">Console</span>
                    </h1>
                    <p className="text-sm font-medium text-neutral-500 mt-2">
                        Welcome back, {user?.firstName}. Here's your portfolio overview.
                    </p>
                </div>
                <Button
                    onClick={() => setIsInviteModalOpen(true)}
                    className="bg-neutral-900 text-white rounded-xl px-6 h-12 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-neutral-900/20 hover:bg-neutral-800 transition-all flex items-center gap-2"
                >
                    <Plus size={16} />
                    New Salon Partner
                </Button>
            </div>

            {/* Core Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Earnings"
                    value={`₹${(stats.totalEarnings || 0).toLocaleString()}`}
                    icon={DollarSign}
                    color="emerald"
                />
                <StatCard
                    title="Active Orders"
                    value={stats.activeOrders || 0}
                    icon={ShoppingBag}
                    color="blue"
                />
                <StatCard
                    title="Network Size"
                    value={stats.totalSalons || 0}
                    icon={Users}
                    color="neutral"
                />
                <div className="bg-emerald-600 rounded-[24px] p-6 text-white relative overflow-hidden group shadow-xl shadow-emerald-500/20">
                    <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">Referral Code</p>
                        <div className="flex items-center gap-3">
                            <h3 className="text-2xl font-black tracking-widest">{user?.agentProfile?.referralCode || 'N/A'}</h3>
                            <button onClick={copyReferralCode} className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                                <Copy size={16} />
                            </button>
                        </div>
                    </div>
                    <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700" />
                </div>
            </div>

            {/* Graphs Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Revenue Trend Graph */}
                <div className="bg-white p-8 rounded-[32px] border border-neutral-100 shadow-sm flex flex-col h-[400px]">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                                <LineChart size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-neutral-900 uppercase tracking-tight">Revenue Trend</h3>
                                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">6 Month Yield</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#a3a3a3', fontSize: 10, fontWeight: 700 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#a3a3a3', fontSize: 10, fontWeight: 700 }}
                                    tickFormatter={(value) => `₹${value / 1000}k`}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ stroke: '#10B981', strokeWidth: 2 }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#10B981"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Order Volume Graph */}
                <div className="bg-white p-8 rounded-[32px] border border-neutral-100 shadow-sm flex flex-col h-[400px]">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                <BarChart3 size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-neutral-900 uppercase tracking-tight">Order Volume</h3>
                                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Weekly Activity</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={orderVolumeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#a3a3a3', fontSize: 10, fontWeight: 700 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#a3a3a3', fontSize: 10, fontWeight: 700 }}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ fill: '#EFF6FF' }}
                                />
                                <Bar
                                    dataKey="orders"
                                    fill="#3B82F6"
                                    radius={[6, 6, 0, 0]}
                                    barSize={32}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Recent Activity (Orders Only) */}
            <div className="bg-white rounded-[32px] border border-neutral-100 overflow-hidden shadow-sm">
                <div className="p-8 border-b border-neutral-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h2 className="text-xl font-black text-neutral-900 tracking-tight uppercase">Recent Orders</h2>
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1">Latest dispatch activity from your network</p>
                    </div>
                    <Link to="/agent-dashboard/orders">
                        <Button variant="outline" className="rounded-xl border-neutral-200 text-[10px] font-black uppercase tracking-widest h-10 px-6 hover:bg-neutral-50">
                            View Full Ledger
                        </Button>
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-neutral-50/30">
                                <th className="px-8 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] border-b border-neutral-50">Order ID</th>
                                <th className="px-8 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] border-b border-neutral-50">Salon</th>
                                <th className="px-8 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] border-b border-neutral-50 text-center">Items</th>
                                <th className="px-8 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] border-b border-neutral-50">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] border-b border-neutral-50 text-right">Value</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-50">
                            {recentOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-16 text-center">
                                        <p className="text-neutral-400 font-bold uppercase tracking-widest text-xs">No recent activity detected.</p>
                                    </td>
                                </tr>
                            ) : (
                                recentOrders.map((order) => (
                                    <tr key={order._id} className="hover:bg-neutral-50/50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <span className="font-black text-neutral-900 text-sm tracking-tight">#{order.orderNumber || order._id.slice(-8).toUpperCase()}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-xs text-neutral-900">{order.customerId?.firstName} {order.customerId?.lastName}</span>
                                                <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">{order.customerId?.salonName || 'Direct'}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className="bg-neutral-100 text-neutral-500 px-2 py-1 rounded text-[10px] font-bold">{order.items?.length || 0}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={cn("px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-current", getStatusColor(order.status))}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <span className="font-black text-neutral-900 tracking-tighter">₹{(order.total || 0).toLocaleString()}</span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <SalonRegistrationModal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                onSuccess={() => {
                    setIsInviteModalOpen(false);
                    toast.success('Invitation sent successfully');
                }}
            />
        </div>
    );
}
