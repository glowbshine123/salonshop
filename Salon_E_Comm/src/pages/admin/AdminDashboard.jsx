import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import {
  DollarSign,
  ShoppingBag,
  AlertTriangle,
  Search,
  ArrowRight
} from 'lucide-react';

import MainLayout from '../../components/layout/MainLayout';
import { orderAPI, adminAPI } from '../../utils/apiClient';
import { useAuth } from '../../context/AuthContext';
import { useLoading } from '../../context/LoadingContext';
import OrderInvoiceModal from '../../components/admin/OrderInvoiceModal';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const { startLoading, finishLoading } = useLoading();

  const [graphs, setGraphs] = useState({ revenue: [], orders: [] });
  const [recentData, setRecentData] = useState({ orders: [], agents: [], users: [] });

  // Recent Orders Local State for updates (status)
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Invoice Modal State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);

  const [timeRange, setTimeRange] = useState('lifetime');

  useEffect(() => {
    const fetchDashboardData = async (isPoll = false) => {
      try {
        if (!isPoll) startLoading();
        // Double check role just in case
        if (!user || user.role !== 'ADMIN') {
          // navigate('/auth/signin'); 
          // return;
        }

        const data = await adminAPI.getDashboardStats({ timeRange });
        setStats(data.stats);
        setGraphs(data.graphs);
        setRecentData(data.recent);
        setOrders(data.recent.orders);
      } catch (error) {
        console.error("Dashboard Load Error", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
        finishLoading();
      }
    };

    if (user) {
      fetchDashboardData(false);
    }

    // Poll every 30s
    const interval = setInterval(() => {
      if (user) fetchDashboardData(true);
    }, 30000);
    return () => clearInterval(interval);
  }, [navigate, user, timeRange]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await orderAPI.updateStatus(orderId, newStatus);
      toast.success(`Order updated to ${newStatus}`);
      // Update local state
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const filteredOrders = orders.filter(order =>
    order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.customerId?.firstName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.customerId?.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && stats === null) {
    return null; // Let global PageLoader handle it
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-neutral-500 text-sm mt-1">Welcome back, Admin. Here's what's happening today.</p>
        </div>

        <div className="bg-white border border-neutral-200 rounded-md p-1 flex items-center">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-transparent text-xs font-bold text-neutral-700 uppercase tracking-wide outline-none px-2 py-1 cursor-pointer"
          >
            <option value="today">Today</option>
            <option value="last_week">Last Week</option>
            <option value="last_month">Last Month</option>
            <option value="last_3_months">Last 3 Months</option>
            <option value="last_6_months">Last 6 Months</option>
            <option value="last_year">Last Year</option>
            <option value="lifetime">Lifetime</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`₹${stats?.totalRevenue?.toLocaleString() ?? 0}`}
          icon={DollarSign}
          color="text-primary"
          bg="bg-primary/10"
        />
        <StatCard
          title="Total Orders"
          value={stats?.totalOrders ?? 0}
          icon={ShoppingBag}
          color="text-neutral-900"
          bg="bg-neutral-100"
        />
        <StatCard
          title="Close to Expiry (<30 Days)"
          value={stats?.closeToExpiryCount ?? 0}
          icon={AlertTriangle}
          color="text-amber-600"
          bg="bg-amber-50"
          action={() => navigate('/admin/products?filter=close_to_expiry')}
        />
        <StatCard
          title="Low Stock (<10)"
          value={stats?.lowStockCount ?? 0}
          icon={AlertTriangle}
          color="text-rose-600"
          bg="bg-rose-50"
          action={() => navigate('/admin/products?stockFilter=low_stock')}
        />
      </div>

      {/* Graphs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-neutral-100 shadow-sm">
          <h3 className="text-lg font-bold text-neutral-900 mb-6">Revenue Trend (30 Days)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={graphs.revenue}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#a3a3a3', fontSize: 12 }}
                  dy={10}
                  tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#a3a3a3', fontSize: 12 }}
                  tickFormatter={(value) => `₹${value / 1000}k`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e5e5', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#ff5a8a', fontWeight: 600 }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#ff5a8a"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 6, fill: '#ff5a8a' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-neutral-100 shadow-sm">
          <h3 className="text-lg font-bold text-neutral-900 mb-6">Order Volume (30 Days)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={graphs.orders}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#a3a3a3', fontSize: 12 }}
                  dy={10}
                  tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#a3a3a3', fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: '#f9fafb' }}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e5e5', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar
                  dataKey="count"
                  fill="#171717"
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Section: Orders & Agents/Users */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Recent Orders (3/4 width) */}
        <div className="lg:w-3/4 bg-white rounded-lg border border-neutral-100 shadow-sm flex flex-col">
          <div className="p-6 border-b border-neutral-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-bold text-neutral-900">Recent Orders</h3>
              <p className="text-neutral-400 text-xs mt-1">Latest transactions and their status</p>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search order..."
                  className="w-full sm:w-64 pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button
                onClick={() => navigate('/admin/orders')}
                className="p-2 text-neutral-400 hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                title="View All Orders"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50/50">
                <tr className="text-left text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-neutral-400 text-sm">
                      No orders found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-neutral-50/50 transition-colors text-sm">
                      <td className="px-6 py-4 font-medium text-neutral-900">
                        #{order.orderNumber}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-neutral-700">
                            {order.customerId?.firstName} {order.customerId?.lastName}
                          </span>
                          <span className="text-xs text-neutral-400">{order.customerId?.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-neutral-900">
                        ₹{order.total.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <StatusSelect
                          currentStatus={order.status}
                          onChange={(newStatus) => handleStatusUpdate(order._id, newStatus)}
                        />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowInvoice(true);
                          }}
                          className="text-primary hover:text-primary-hover font-medium text-xs bg-primary/10 px-3 py-1.5 rounded-md"
                        >
                          Invoice
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Agents & Users (1/4 width) */}
        <div className="lg:w-1/4 space-y-6">
          {/* New Agents */}
          <div className="bg-white rounded-lg border border-neutral-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-neutral-900">New Agents</h3>
              <button
                onClick={() => navigate('/admin/agents')}
                className="text-neutral-400 hover:text-primary transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              {recentData.agents.length === 0 ? (
                <p className="text-neutral-400 text-sm">No new agents.</p>
              ) : (
                recentData.agents.map((agent) => (
                  <UserListItem key={agent._id} user={agent} type="AGENT" />
                ))
              )}
            </div>
          </div>

          {/* New Salon Owners */}
          <div className="bg-white rounded-lg border border-neutral-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-neutral-900">New Salons</h3>
              <button
                onClick={() => navigate('/admin/users')}
                className="text-neutral-400 hover:text-primary transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              {recentData.users.length === 0 ? (
                <p className="text-neutral-400 text-sm">No new salons.</p>
              ) : (
                recentData.users.map((user) => (
                  <UserListItem key={user._id} user={user} type="SALON" />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Modal */}
      <OrderInvoiceModal
        isOpen={showInvoice}
        onClose={() => setShowInvoice(false)}
        order={selectedOrder}
      />
    </div>
  );
}

// Sub-components for cleaner code

function StatCard({ title, value, icon: Icon, color, bg, action }) {
  return (
    <div
      className={`bg-white p-6 rounded-lg border border-neutral-100 shadow-sm flex items-start justify-between group cursor-default ${action ? 'cursor-pointer' : ''}`}
      onClick={action}
    >
      <div>
        <p className="text-neutral-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-3xl font-black text-neutral-900">{value}</h3>
      </div>
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${bg} ${color} group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
}

function StatusSelect({ currentStatus, onChange }) {
  const statuses = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED'];

  // Status colors
  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return 'bg-primary/20 text-primary';
      case 'DELIVERED': return 'bg-primary/20 text-primary';
      case 'SHIPPED': return 'bg-blue-100 text-blue-800';
      case 'PROCESSING': return 'bg-blue-50 text-blue-600';
      case 'PAID': return 'bg-primary/10 text-primary';
      case 'PENDING': return 'bg-amber-50 text-amber-600';
      case 'CANCELLED': return 'bg-red-50 text-red-600';
      default: return 'bg-neutral-100 text-neutral-600';
    }
  };

  return (
    <div className="relative group/select inline-block">
      <select
        value={currentStatus}
        onChange={(e) => onChange(e.target.value)}
        className={`appearance-none cursor-pointer pl-3 pr-8 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border-0 focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all ${getStatusColor(currentStatus)}`}
      >
        {statuses.map(s => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      {/* Custom arrow if needed, but default select is functional */}
    </div>
  );
}

function UserListItem({ user, type }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 font-bold border border-neutral-200">
        {(user.firstName?.[0] || 'U').toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-neutral-900 truncate">{user.firstName} {user.lastName}</p>
        <p className="text-xs text-neutral-400 truncate">{user.email}</p>
      </div>
    </div>
  );
}
