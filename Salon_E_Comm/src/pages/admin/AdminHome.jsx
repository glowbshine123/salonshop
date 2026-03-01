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
import { orderAPI, productAPI, userAPI, commissionAPI } from '../../services/apiService';
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
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700 font-body">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <StatCard
                    title="Total Revenue"
                    value={`₹${stats.totalRevenue.toLocaleString()}`}
                    icon={IndianRupee}
                    color="primary"
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
                    color="primary"
                />
                <StatCard
                    title="Commissions"
                    value={`₹${stats.totalCommissions.toLocaleString()}`}
                    icon={BarChart3}
                    color="neutral"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Recent Orders Table */}
                <div className="lg:col-span-2 bg-white rounded-[48px] shadow-2xl shadow-primary/5 border border-primary/5 overflow-hidden">
                    <div className="p-10 border-b border-primary/5 flex items-center justify-between bg-bg-secondary/20">
                        <div>
                            <h3 className="text-2xl font-display font-black text-neutral-900 tracking-tighter uppercase leading-none italic">Recent Acquisitions</h3>
                            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mt-2">Latest inventory movements</p>
                        </div>
                        <Link to="/admin/orders" className="w-14 h-14 bg-neutral-900 text-white rounded-2xl hover:bg-primary transition-all active:scale-95 flex items-center justify-center shadow-xl shadow-neutral-900/10">
                            <ArrowRight size={22} />
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-bg-secondary/10">
                                    <th className="px-10 py-6 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">IDENTIFIER</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">CUSTOMER</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">STATUS</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] text-right">VALUE</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-primary/5">
                                {recentOrders.map((order) => (
                                    <tr key={order._id} className="hover:bg-bg-secondary/30 transition-all duration-500 group">
                                        <td className="px-10 py-8">
                                            <span className="text-sm font-display font-black text-neutral-900 tracking-tighter italic">
                                                #{order.orderNumber?.split('-')[2] || order._id.slice(-6).toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-bg-secondary border border-primary/5 flex items-center justify-center text-[11px] font-black text-primary uppercase group-hover:bg-primary group-hover:text-white transition-all transform group-hover:rotate-6 shadow-inner">
                                                    {(order.customerId?.firstName?.[0] || 'S')}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-display font-black text-neutral-900 tracking-tight italic">{order.customerId?.firstName} {order.customerId?.lastName}</span>
                                                    <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest mt-1 line-clamp-1 max-w-[150px]">{order.customerId?.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.15em] ring-1 ring-inset ${order.status === 'DELIVERED' || order.status === 'COMPLETED'
                                                ? 'bg-primary text-white ring-primary/20'
                                                : order.status === 'PENDING'
                                                    ? 'bg-bg-secondary text-primary ring-primary/10'
                                                    : 'bg-neutral-900 text-white shadow-lg'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <span className="text-xl font-display font-black text-neutral-900 tracking-tighter italic">₹{(order.total || 0).toLocaleString()}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Performance Analytics / Infrastructure */}
                <div className="space-y-10">
                    <div className="bg-neutral-900 p-10 rounded-[48px] shadow-2xl border border-white/5 text-white relative overflow-hidden group min-h-[320px] flex flex-col justify-between">
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-10">
                                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-700">
                                    <Activity size={24} />
                                </div>
                                <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em]">System Health</span>
                            </div>
                            <h3 className="text-5xl font-display font-black tracking-tighter mb-2 italic">98.4%</h3>
                            <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-10 italic">Optimal Performance</p>

                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em]">
                                        <span className="text-white/30">Stock Liquidity</span>
                                        <span className="text-primary italic">PRIME</span>
                                    </div>
                                    <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden">
                                        <div className="bg-primary h-full w-[85%] rounded-full shadow-[0_0_20px_rgba(255,27,107,0.4)] transition-all duration-1000 group-hover:w-[92%]"></div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em]">
                                        <span className="text-white/30">Active Retention</span>
                                        <span className="text-white">Growing</span>
                                    </div>
                                    <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden">
                                        <div className="bg-white h-full w-[72%] rounded-full shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all duration-1000 group-hover:w-[80%]"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Background accents */}
                        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 rounded-full -mr-24 -mt-24 blur-3xl group-hover:bg-primary/30 transition-all duration-1000"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/10 rounded-full -ml-16 -mb-16 blur-2xl group-hover:bg-primary/20 transition-all duration-1000"></div>
                    </div>

                    <div className="bg-white p-10 rounded-[48px] shadow-2xl shadow-primary/5 border border-primary/5">
                        <h3 className="text-lg font-display font-black text-neutral-900 mb-8 uppercase tracking-[0.2em] leading-none italic">Global Directives</h3>
                        <div className="grid grid-cols-1 gap-4">
                            <Link
                                to="/admin/products"
                                className="flex items-center justify-between p-8 bg-bg-secondary/50 text-neutral-900 rounded-[32px] border border-transparent hover:border-primary/20 hover:bg-white hover:shadow-xl hover:shadow-primary/5 transition-all group"
                            >
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 bg-white shadow-inner rounded-2xl flex items-center justify-center group-hover:bg-primary transition-all transform group-hover:-rotate-6">
                                        <ShoppingBag size={20} className="text-primary group-hover:text-white transition-colors" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Product Inventory</span>
                                </div>
                                <ChevronRight size={18} className="text-neutral-300 group-hover:text-primary transition-all group-hover:translate-x-1" />
                            </Link>
                            <Link
                                to="/admin/agents"
                                className="flex items-center justify-between p-8 bg-bg-secondary/50 text-neutral-900 rounded-[32px] border border-transparent hover:border-primary/20 hover:bg-white hover:shadow-xl hover:shadow-primary/5 transition-all group"
                            >
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 bg-white shadow-inner rounded-2xl flex items-center justify-center group-hover:bg-neutral-900 transition-all transform group-hover:rotate-6">
                                        <Users size={20} className="text-primary group-hover:text-white transition-colors" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Network Agents</span>
                                </div>
                                <ChevronRight size={18} className="text-neutral-300 group-hover:text-neutral-900 transition-all group-hover:translate-x-1" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
