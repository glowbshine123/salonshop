import React, { useState, useEffect } from 'react';
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

    useEffect(() => {
        const fetchDashboardData = async () => {
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
        };

        if (user) {
            fetchDashboardData();
        }
    }, [user]);

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
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-20 font-body">
            {/* Minimal Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-primary/5 pb-10">
                <div className="space-y-4">
                    <h1 className="text-5xl md:text-6xl font-display font-black text-neutral-900 tracking-tighter leading-[0.8]">
                        AGENT <br />
                        <span className="text-primary italic">CONSOLE</span>.
                    </h1>
                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mt-2">
                        Welcome back, {user?.firstName}. Managing your professional network.
                    </p>
                </div>
                <Button
                    onClick={() => setIsInviteModalOpen(true)}
                    className="bg-neutral-900 text-white rounded-[24px] px-10 h-16 font-display font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-neutral-900/20 hover:bg-primary transition-all flex items-center gap-3 active:scale-95"
                >
                    <Plus size={18} />
                    New Salon Partner
                </Button>
            </div>

            {/* Core Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <StatCard
                    title="Total Yield"
                    value={`₹${(stats.totalEarnings || 0).toLocaleString()}`}
                    icon={DollarSign}
                    color="primary"
                />
                <StatCard
                    title="Active Flow"
                    value={stats.activeOrders || 0}
                    icon={ShoppingBag}
                    color="neutral"
                />
                <StatCard
                    title="Network Assets"
                    value={stats.totalSalons || 0}
                    icon={Users}
                    color="primary"
                />
                <div className="bg-neutral-900 rounded-[32px] p-8 text-white relative overflow-hidden group shadow-2xl shadow-neutral-900/20 flex flex-col justify-between border border-white/5">
                    <div className="relative z-10">
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40 mb-3 italic">Referral Signature</p>
                        <div className="flex items-center gap-4">
                            <h3 className="text-3xl font-display font-black tracking-widest italic">{user?.agentProfile?.referralCode || 'N/A'}</h3>
                            <button onClick={copyReferralCode} className="p-3 bg-white/5 rounded-xl hover:bg-primary transition-all shadow-inner">
                                <Copy size={16} />
                            </button>
                        </div>
                    </div>
                    <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/40 transition-all duration-1000" />
                </div>
            </div>

            {/* Graphs Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Revenue Trend Graph */}
                <div className="bg-white p-10 rounded-[48px] border border-primary/5 shadow-2xl shadow-primary/5 flex flex-col h-[450px]">
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-bg-secondary flex items-center justify-center text-primary shadow-inner">
                                <LineChart size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-display font-black text-neutral-900 uppercase tracking-tight italic">Revenue Projection</h3>
                                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">Annual Yield Analysis</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#FF1B6B" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#FF1B6B" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#FDF2F7" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#D1AFBF', fontSize: 10, fontWeight: 900 }}
                                    dy={15}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#D1AFBF', fontSize: 10, fontWeight: 900 }}
                                    tickFormatter={(value) => `₹${value / 1000}k`}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '24px', border: '1px solid #FF1B6B10', boxShadow: '0 20px 25px -5px rgb(255 27 107 / 0.1)', background: 'white' }}
                                    cursor={{ stroke: '#FF1B6B', strokeWidth: 2 }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#FF1B6B"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                    animationDuration={2000}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Order Volume Graph */}
                <div className="bg-white p-10 rounded-[48px] border border-primary/5 shadow-2xl shadow-primary/5 flex flex-col h-[450px]">
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-neutral-900 flex items-center justify-center text-white shadow-xl">
                                <BarChart3 size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-display font-black text-neutral-900 uppercase tracking-tight italic">Inventory Flow</h3>
                                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">Weekly Distribution</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={orderVolumeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#A3A3A3', fontSize: 10, fontWeight: 900 }}
                                    dy={15}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#A3A3A3', fontSize: 10, fontWeight: 900 }}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '24px', border: '1px solid #00000005', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.05)', background: 'white' }}
                                    cursor={{ fill: '#F5F5F5', radius: 12 }}
                                />
                                <Bar
                                    dataKey="orders"
                                    fill="#171717"
                                    activeBar={{ fill: '#FF1B6B' }}
                                    radius={[8, 8, 0, 0]}
                                    barSize={32}
                                    animationDuration={2000}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Recent Activity (Orders Only) */}
            <div className="bg-white rounded-[48px] border border-primary/5 overflow-hidden shadow-2xl shadow-primary/5">
                <div className="p-10 border-b border-primary/5 flex flex-col md:flex-row md:items-center justify-between gap-8 bg-bg-secondary/10">
                    <div>
                        <h2 className="text-2xl font-display font-black text-neutral-900 tracking-tight uppercase italic">Ledger Overview</h2>
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.3em] mt-2 italic">Latest network synchronization</p>
                    </div>
                    <Link to="/agent-dashboard/orders">
                        <Button variant="outline" className="rounded-[20px] border-primary/10 text-[9px] font-black uppercase tracking-[0.2em] h-12 px-8 hover:bg-white hover:border-primary/30 transition-all font-body">
                            Expand Full Ledger
                        </Button>
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-bg-secondary/5">
                                <th className="px-10 py-6 text-[11px] font-black text-neutral-400 uppercase tracking-[0.2em] border-b border-primary/5">IDENTIFIER</th>
                                <th className="px-10 py-6 text-[11px] font-black text-neutral-400 uppercase tracking-[0.2em] border-b border-primary/5">PARTNER</th>
                                <th className="px-10 py-6 text-[11px] font-black text-neutral-400 uppercase tracking-[0.2em] border-b border-primary/5 text-center">UNITS</th>
                                <th className="px-10 py-6 text-[11px] font-black text-neutral-400 uppercase tracking-[0.2em] border-b border-primary/5">STATE</th>
                                <th className="px-10 py-6 text-[11px] font-black text-neutral-400 uppercase tracking-[0.2em] border-b border-primary/5 text-right">VALUE</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-primary/5">
                            {recentOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-10 py-24 text-center">
                                        <p className="text-neutral-300 font-display font-black uppercase tracking-[0.3em] text-sm italic">Transmission Silent</p>
                                    </td>
                                </tr>
                            ) : (
                                recentOrders.map((order) => (
                                    <tr key={order._id} className="hover:bg-bg-secondary/30 transition-all duration-500 group">
                                        <td className="px-10 py-8">
                                            <span className="font-display font-black text-neutral-900 text-sm tracking-tight italic">#{order.orderNumber || order._id.slice(-8).toUpperCase()}</span>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex flex-col">
                                                <span className="font-display font-black text-sm text-neutral-900 italic">{order.customerId?.firstName} {order.customerId?.lastName}</span>
                                                <span className="text-[9px] font-black text-neutral-400 uppercase tracking-[0.2em] mt-1 italic">{order.customerId?.salonName || 'Private Associate'}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-center">
                                            <span className="bg-bg-secondary text-primary px-3 py-1 rounded-[10px] text-[10px] font-black shadow-inner border border-primary/5 italic">{order.items?.length || 0}</span>
                                        </td>
                                        <td className="px-10 py-8">
                                            <span className={cn("px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.15em] border italic transition-all", getStatusColor(order.status))}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <span className="font-display font-black text-neutral-900 tracking-tighter text-xl italic">₹{(order.total || 0).toLocaleString()}</span>
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
                    toast.success('Affiliation Invitation Dispatched');
                }}
            />
        </div>
    );
}
