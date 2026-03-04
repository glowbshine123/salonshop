import React, { useState, useEffect } from 'react';
import {
    TrendingUp,
    ShoppingBag,
    Users,
    DollarSign,
    ArrowRight,
    MoreVertical,
    Briefcase,
    Zap,
    Trophy,
    Target,
    Activity,
    IndianRupee,
    ChevronRight,
    BarChart3
} from 'lucide-react';
import StatCard from '../../components/admin/StatCard';
import { orderAPI, userAPI, commissionAPI } from '../../services/apiService';
import { Link } from 'react-router-dom';

export default function AdminHome() {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        activeAgents: 0,
        totalCommissions: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [ordersRes, usersRes, commissionsRes] = await Promise.all([
                    orderAPI.getAll({ limit: 5 }),
                    userAPI.getAll(),
                    commissionAPI.getAll()
                ]);

                const orders = ordersRes.data.allOrders || [];
                const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
                const users = usersRes.data || [];
                const agents = users.filter(u => u.role === 'AGENT');
                const totalCommissions = (commissionsRes.data.commissions || []).reduce((sum, c) => sum + (c.amountEarned || 0), 0);

                setStats({
                    totalRevenue,
                    totalOrders: ordersRes.data.count || orders.length,
                    activeAgents: agents.filter(a => a.status === 'ACTIVE').length,
                    totalCommissions
                });
                setRecentOrders(orders);
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96 gap-6">
                <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Loading Dashboard data...</p>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Revenue"
                    value={`₹${stats.totalRevenue.toLocaleString()}`}
                    icon={IndianRupee}
                    color="emerald"
                />
                <StatCard
                    title="Total Orders"
                    value={stats.totalOrders}
                    icon={ShoppingBag}
                    color="neutral"
                />
                <StatCard
                    title="Active Agents"
                    value={stats.activeAgents}
                    icon={Briefcase}
                    color="emerald"
                />
                <StatCard
                    title="Commissions Paid"
                    value={`₹${stats.totalCommissions.toLocaleString()}`}
                    icon={BarChart3}
                    color="neutral"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Recent Orders Table */}
                <div className="lg:col-span-2 bg-white rounded-[48px] shadow-sm border border-neutral-100 overflow-hidden">
                    <div className="p-10 border-b border-neutral-50 flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-black text-neutral-900 tracking-tighter uppercase leading-none">Recent Orders</h3>
                            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mt-2">Recent activities</p>
                        </div>
                        <Link to="/admin/orders" className="p-4 bg-neutral-900 text-white rounded-2xl hover:bg-emerald-600 transition-all active:scale-95">
                            <ArrowRight size={20} />
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-neutral-50/50">
                                    <th className="px-10 py-6 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Order ID</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Customer</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Status</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-neutral-400 uppercase tracking-widest text-right">Revenue</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-50">
                                {recentOrders.map((order) => (
                                    <tr key={order._id} className="hover:bg-neutral-50/50 transition-all duration-300 group">
                                        <td className="px-10 py-6">
                                            <span className="text-sm font-black text-neutral-900 uppercase tracking-tighter">
                                                #{order.orderNumber?.split('-')[2] || order._id.slice(-6).toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-center text-[10px] font-black text-neutral-400 uppercase group-hover:bg-emerald-50 group-hover:text-emerald-600 group-hover:border-emerald-100 transition-all">
                                                    {(order.customerId?.firstName?.[0] || 'S')}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-neutral-900 uppercase tracking-tight">{order.customerId?.firstName} {order.customerId?.lastName}</span>
                                                    <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mt-0.5 line-clamp-1 max-w-[120px]">{order.customerId?.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ring-1 ring-inset ${order.status === 'DELIVERED' || order.status === 'COMPLETED'
                                                ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
                                                : order.status === 'PENDING'
                                                    ? 'bg-amber-50 text-amber-700 ring-amber-600/20'
                                                    : 'bg-neutral-900 text-white'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-10 py-6 text-right">
                                            <span className="text-lg font-black text-neutral-900 tracking-tighter">₹{(order.total || 0).toLocaleString()}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Performance Analytics / Infrastructure */}
                <div className="space-y-8">
                    <div className="bg-neutral-900 p-10 rounded-[40px] shadow-2xl border border-white/5 text-white relative overflow-hidden group">
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-8">
                                <Activity size={24} className="text-emerald-400" />
                                <span className="text-[9px] font-black text-emerald-400/60 uppercase tracking-[0.3em]">System Status</span>
                            </div>
                            <h3 className="text-3xl font-black tracking-tighter mb-2">98.4%</h3>
                            <p className="text-neutral-400 text-[10px] font-black uppercase tracking-widest mb-8">System Performance</p>

                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                        <span className="text-neutral-500">Stock Status</span>
                                        <span className="text-emerald-400">Optimal</span>
                                    </div>
                                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                                        <div className="bg-emerald-500 h-full w-[85%] rounded-full shadow-[0_0_15px_rgba(16,185,129,0.4)]"></div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                        <span className="text-neutral-500">Active Users</span>
                                        <span className="text-blue-400">High Growth</span>
                                    </div>
                                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                                        <div className="bg-blue-500 h-full w-[72%] rounded-full shadow-[0_0_15px_rgba(59,130,246,0.4)]"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Background accents */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-emerald-500/20 transition-all duration-1000"></div>
                    </div>

                    <div className="bg-white p-10 rounded-[40px] shadow-sm border border-neutral-100">
                        <h3 className="text-lg font-black text-neutral-900 mb-6 uppercase tracking-widest leading-none">Global Actions</h3>
                        <div className="grid grid-cols-1 gap-4">
                            <Link
                                to="/admin/products"
                                className="flex items-center justify-between p-6 bg-neutral-50 text-neutral-900 rounded-2xl hover:bg-neutral-900 hover:text-white transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white shadow-sm rounded-xl flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
                                        <ShoppingBag size={18} className="group-hover:text-white" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest">Manage Products</span>
                                </div>
                                <ChevronRight size={16} className="text-neutral-300 group-hover:text-emerald-400" />
                            </Link>
                            <Link
                                to="/admin/agents"
                                className="flex items-center justify-between p-6 bg-neutral-50 text-neutral-900 rounded-2xl hover:bg-neutral-900 hover:text-white transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white shadow-sm rounded-xl flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                                        <Users size={18} className="group-hover:text-white" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest">Manage Agents</span>
                                </div>
                                <ChevronRight size={16} className="text-neutral-300 group-hover:text-blue-400" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
