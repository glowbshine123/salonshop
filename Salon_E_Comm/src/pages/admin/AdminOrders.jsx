import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import {
    Search,
    Filter,
    Eye,
    UserPlus,
    Clock,
    CheckCircle2,
    Truck,
    AlertCircle,
    Loader2,
    MoreVertical,
    Calendar,
    Hash,
    User as UserIcon,
    Briefcase,
    IndianRupee,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { orderAPI, userAPI } from '../../services/apiService';
import { useLoading } from '../../context/LoadingContext';
import { useSocket } from '../../context/SocketContext';
import { toast } from 'react-hot-toast';
import { Skeleton } from "@/components/ui/skeleton";
import TableRowSkeleton from '../../components/common/TableRowSkeleton';
import OrderInvoiceModal from '../../components/admin/OrderInvoiceModal';

export default function AdminOrders() {
    const { setUnreadOrderCount } = useSocket();
    const [orders, setOrders] = useState([]);
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [activeActionId, setActiveActionId] = useState(null);
    const [assigningOrderId, setAssigningOrderId] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const { finishLoading } = useLoading();
    const limit = 10;


    useEffect(() => {
        const handleClickOutside = (event) => {
            if (activeActionId && !event.target.closest('.action-menu-container')) {
                setActiveActionId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [activeActionId]);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const params = {
                page: currentPage,
                limit: limit,
                search: searchTerm,
                status: statusFilter === 'All' ? undefined : statusFilter
            };
            const [orderRes, agentRes] = await Promise.all([
                orderAPI.getAll(params),
                userAPI.getAgents()
            ]);

            const orders = orderRes.data?.allOrders || orderRes.data?.orders || orderRes.data?.items || [];
            const totalCount = orderRes.data?.count || orderRes.data?.pagination?.total || orders.length;

            setOrders(orders);
            setTotalResults(totalCount);
            setTotalPages(Math.ceil((totalCount || 0) / limit));
            setAgents(agentRes.data.users || []);
        } catch (error) {
            console.error('[AdminOrders] Fetch failed:', error);
            toast.error('Failed to fetch orders: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
            finishLoading();
        }
    }, [currentPage, limit, searchTerm, statusFilter, finishLoading]);

    useEffect(() => {
        fetchData();

        // Mark orders as viewed when admin opens this tab
        const markAsViewed = async () => {
            try {
                await orderAPI.markAsViewed();
                setUnreadOrderCount(0);
                // Dispatch event to update sidebar count
                window.dispatchEvent(new CustomEvent('ordersViewed'));
            } catch (err) {
                console.error('Failed to mark orders as viewed:', err);
            }
        };
        markAsViewed();
    }, [currentPage, searchTerm, statusFilter, fetchData, setUnreadOrderCount]);

    const handleAssignAgent = async (orderId, agentId) => {
        if (!agentId) return;
        try {
            await orderAPI.assignAgent(orderId, agentId);
            setAssigningOrderId(null);
            toast.success('Agent executive assigned to shipment');
            fetchData();
        } catch (err) {
        }
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            await orderAPI.updateStatus(orderId, newStatus);
            toast.success(`Order status updated to ${newStatus}`);
            setActiveActionId(null); // Close dropdown
            fetchData();
        } catch (err) {
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };


    const getStatusBadge = (status) => {
        const styles = {
            'PENDING': 'bg-amber-50 text-amber-700 border-amber-200/50',
            'PAID': 'bg-emerald-50 text-emerald-700 border-emerald-200/50',
            'PROCESSING': 'bg-blue-50 text-blue-700 border-blue-200/50',
            'SHIPPED': 'bg-indigo-50 text-indigo-700 border-indigo-200/50',
            'DELIVERED': 'bg-emerald-50 text-emerald-700 border-emerald-200/50',
            'COMPLETED': 'bg-emerald-600 text-white border-emerald-600',
            'CANCELLED': 'bg-rose-50 text-rose-700 border-rose-200/50',
        };
        return (
            <span className={cn(
                "px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border shadow-sm",
                styles[status] || styles['PENDING']
            )}>
                {status}
            </span>
        );
    };

    const StatusSelect = ({ currentStatus, onUpdate }) => (
        <select
            value={currentStatus}
            onChange={(e) => onUpdate(e.target.value)}
            className="bg-transparent text-[9px] font-black uppercase tracking-widest border-none outline-none cursor-pointer text-neutral-600 hover:text-emerald-600 transition-colors appearance-none"
        >
            {['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED'].map(s => (
                <option key={s} value={s}>{s}</option>
            ))}
        </select>
    );

    return (
        <>
            <div className="animate-in fade-in duration-500 pb-20 max-w-[1600px] mx-auto px-4 print:hidden">
                {/* Header Section */}
                <div className="pb-6 rounded-xl relative overflow-hidden print:hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-50/30 rounded-full -mr-24 -mt-24 blur-3xl"></div>
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-black text-neutral-900 tracking-tighter uppercase">Orders</h1>
                            <p className="text-sm font-medium text-neutral-500">Manage your orders</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-10 px-4 bg-neutral-50 rounded-xl flex items-center gap-2.5 border border-neutral-100 min-w-[280px] group focus-within:border-emerald-500/50 transition-all shadow-sm">
                                <Search className="w-4 h-4 text-neutral-400 group-focus-within:text-emerald-500" />
                                <input
                                    type="text"
                                    placeholder="SEARCH LEDGER..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-widest w-full text-neutral-600"
                                />
                            </div>
                            <div className="h-9 px-3 bg-white border border-neutral-200 rounded-md flex items-center gap-2 hover:border-emerald-500/30 transition-all cursor-pointer shadow-sm">
                                <Filter size={12} className="text-neutral-400" />
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="bg-transparent text-[8px] font-black uppercase tracking-widest outline-none cursor-pointer text-neutral-600 appearance-none pr-4"
                                >
                                    <option value="All">Status</option>
                                    <option value="PENDING">Pending</option>
                                    <option value="PAID">Paid</option>
                                    <option value="PROCESSING">Processing</option>
                                    <option value="SHIPPED">Shipped</option>
                                    <option value="DELIVERED">Delivered</option>
                                    <option value="COMPLETED">Completed</option>
                                    <option value="CANCELLED">Cancelled</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>


                <div className="bg-white rounded-xl border border-neutral-100 shadow-sm print:hidden">
                    <div className="custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-neutral-50/50 border-b border-neutral-100 uppercase">
                                    <th className="px-6 py-4 text-[11px] font-black text-neutral-400 tracking-widest">Orders</th>
                                    <th className="px-6 py-4 text-[11px] font-black text-neutral-400 tracking-widest">Salon Owner</th>
                                    <th className="px-6 py-4 text-[11px] font-black text-neutral-400 tracking-widest">Assigned Agent</th>
                                    <th className="px-6 py-4 text-[11px] font-black text-neutral-400 tracking-widest text-center">Price</th>
                                    <th className="px-6 py-4 text-[11px] font-black text-neutral-400 tracking-widest text-center">Status</th>
                                    <th className="px-6 py-4 text-[11px] font-black text-neutral-400 tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-50">
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRowSkeleton key={i} cellCount={6} />
                                    ))
                                ) : orders.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-8 py-32 text-center text-neutral-400 font-black uppercase tracking-widest italic">
                                            No matching shipments in registry.
                                        </td>
                                    </tr>
                                ) : (
                                    orders.map((order) => (
                                        <tr key={order._id} className="hover:bg-neutral-50/50 transition-all duration-300 group relative">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2">
                                                    {/* <div className="w-8 h-8 bg-transparent rounded-lg border border-neutral-800 flex items-center justify-center text-emerald-500 shadow-xl shadow-neutral-900/10 shrink-0 group-hover:scale-105 transition-transform">
                                                        <Hash size={16} strokeWidth={2.5} />
                                                    </div> */}
                                                    <div className="flex flex-col">
                                                        <span className="text-base font-bold text-neutral-900 tracking-tight">#{order.orderNumber?.split('-')[2] || order._id.slice(-6).toUpperCase()}</span>
                                                        <span className="text-xs font-bold text-neutral-400 uppercase tracking-wide flex items-center gap-1 opacity-80 mt-0.5">
                                                            <Calendar size={10} />
                                                            {new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-emerald-50 rounded-md flex items-center justify-center text-emerald-600 border border-emerald-100 shrink-0 capitalize text-[12px] font-black shadow-sm">
                                                        {order.customerId?.firstName?.charAt(0)}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-black text-neutral-900 uppercase tracking-tight leading-tight">{order.customerId?.firstName} {order.customerId?.lastName}</span>
                                                        <span className="text-[10px] font-bold text-neutral-400 lowercase italic opacity-80 leading-none mt-0.5">{order.customerId?.email}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-3 py-2">
                                                {order.agentId ? (
                                                    <div className="flex items-center gap-2.5 px-3 py-2 bg-transparent rounded-md w-fit group/agent hover:border-emerald-500/50 transition-all">
                                                        <div className="w-5 h-5 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                                            <Briefcase size={12} className="text-emerald-400" />
                                                        </div>
                                                        <span className="text-base font-bold text-neutral-900 capitalize tracking-tight">
                                                            {order.agentId.firstName} {order.agentId.lastName}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div className="relative">
                                                        {agents && agents.length === 0 ? (
                                                            <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest italic opacity-60">
                                                                No Agent
                                                            </span>
                                                        ) : assigningOrderId === order._id ? (
                                                            <select
                                                                className="text-[8px] font-black uppercase tracking-widest bg-white border border-emerald-500 rounded-lg px-2 py-1.5 outline-none animate-in fade-in slide-in-from-top-1 shadow-md"
                                                                onChange={(e) => handleAssignAgent(order._id, e.target.value)}
                                                                onBlur={() => setAssigningOrderId(null)}
                                                                autoFocus
                                                            >
                                                                <option value="">ASSIGN...</option>
                                                                {agents.map(agent => (
                                                                    <option key={agent._id} value={agent._id}>{agent.firstName.toUpperCase()} {agent.lastName.toUpperCase()}</option>
                                                                ))}
                                                            </select>
                                                        ) : (
                                                            <button
                                                                onClick={() => setAssigningOrderId(order._id)}
                                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-50 hover:bg-neutral-900 border border-neutral-100 hover:border-neutral-900 text-neutral-400 hover:text-white rounded-lg transition-all group/btn"
                                                            >
                                                                <UserPlus size={12} />
                                                                <span className="text-[8px] font-black uppercase tracking-widest">Assign</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <span className="text-xs font-black text-emerald-600">₹</span>
                                                        <span className="text-base font-black text-neutral-900 tracking-tighter">
                                                            {(order.total || 0).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-0.5">{order.paymentMethod}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col items-center gap-1.5">
                                                    {getStatusBadge(order.status)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="flex items-center justify-end gap-1.5 action-menu-container">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedOrder(order);
                                                            setIsInvoiceOpen(true);
                                                        }}
                                                        className="p-2.5 bg-neutral-50 hover:bg-white border border-neutral-100 hover:border-emerald-200 text-neutral-400 hover:text-emerald-600 rounded-xl transition-all active:scale-95 shadow-sm group/btn"
                                                    >
                                                        <Eye className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                                                    </button>

                                                    <div className="relative">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setActiveActionId(activeActionId === order._id ? null : order._id);
                                                            }}
                                                            className={cn(
                                                                "p-2.5 shadow-sm border rounded-xl transition-all active:scale-95",
                                                                activeActionId === order._id ? "bg-neutral-900 text-white border-neutral-900" : "bg-neutral-50 border-neutral-100 text-neutral-400 hover:text-neutral-900 hover:border-neutral-200"
                                                            )}
                                                        >
                                                            <MoreVertical className="w-4 h-4" />
                                                        </button>

                                                        {activeActionId === order._id && (
                                                            <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl shadow-2xl border border-neutral-100 p-1.5 z-100 animate-in zoom-in-95 origin-top-right">
                                                                <div className="px-3 py-1.5 text-[7px] font-black text-neutral-400 uppercase tracking-[0.2em] border-b border-neutral-50 mb-1">
                                                                    Transition Phase
                                                                </div>
                                                                <div className="max-h-48 overflow-y-auto custom-scrollbar">
                                                                    {['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED'].map(s => (
                                                                        <button
                                                                            key={s}
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleUpdateStatus(order._id, s);
                                                                            }}
                                                                            className={cn(
                                                                                "w-full text-left px-3 py-2 rounded-lg text-[8px] font-bold uppercase tracking-widest transition-all mb-0.5 last:mb-0 flex items-center justify-between",
                                                                                order.status === s ? "text-emerald-600 bg-emerald-50" : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                                                                            )}
                                                                        >
                                                                            {s}
                                                                            {order.status === s && <CheckCircle2 size={10} />}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="mt-6 flex items-center justify-between p-6 bg-white border border-neutral-100 rounded-xl shadow-sm">
                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">
                            Page {currentPage} of {totalPages} — {totalResults} Shipments Recorded
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="p-2 bg-neutral-50 border border-neutral-100 rounded-lg text-neutral-400 hover:text-emerald-600 hover:border-emerald-200 disabled:opacity-30 disabled:hover:text-neutral-400 disabled:hover:border-neutral-100 transition-all active:scale-95"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <div className="flex items-center gap-1">
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => handlePageChange(i + 1)}
                                        className={cn(
                                            "w-8 h-8 rounded-lg text-[10px] font-black transition-all active:scale-95",
                                            currentPage === i + 1
                                                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                                                : "bg-white border border-neutral-100 text-neutral-400 hover:border-emerald-200 hover:text-emerald-600"
                                        )}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="p-2 bg-neutral-50 border border-neutral-100 rounded-lg text-neutral-400 hover:text-emerald-600 hover:border-emerald-200 disabled:opacity-30 disabled:hover:text-neutral-400 disabled:hover:border-neutral-100 transition-all active:scale-95"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Order Invoice/Manifest Modal */}
            <OrderInvoiceModal
                isOpen={isInvoiceOpen}
                onClose={() => {
                    setIsInvoiceOpen(false);
                    setSelectedOrder(null);
                }}
                order={selectedOrder}
            />
        </>
    );
}
