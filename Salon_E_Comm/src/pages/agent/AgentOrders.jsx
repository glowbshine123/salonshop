import React, { useState, useEffect, useCallback } from 'react';
import {
    ShoppingBag,
    Search,
    Filter,
    Calendar,
    ChevronRight,
    ChevronLeft,
    Package,
    Truck,
    CheckCircle2,
    Clock,
    Loader2,
    SearchX,
    X,
    ArrowUpDown
} from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { orderAPI } from '../../services/apiService';
import { useAuth } from '../../context/AuthContext';
import { useLoading } from '../../context/LoadingContext';
import { Button } from '../../components/ui/button';
import { cn } from '@/lib/utils';
import { Skeleton } from "@/components/ui/skeleton";

const TableRowSkeleton = ({ columns }) => (
    <tr className="animate-pulse border-b border-neutral-50 last:border-0">
        {Array.from({ length: columns }).map((_, i) => (
            <td key={i} className="px-6 py-4">
                <Skeleton className="h-4 w-24 bg-neutral-100" />
            </td>
        ))}
    </tr>
);

export default function AgentOrders() {
    const [orders, setOrders] = useState([]);
    const { finishLoading } = useLoading();
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            const res = await orderAPI.getAssigned();
            setOrders(res.data.assignedOrders || res.data || []);
        } catch (err) {
            console.error('Failed to fetch orders:', err);
        } finally {
            setLoading(false);
            finishLoading();
        }
    }, [finishLoading]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    // Filter Logic
    const filteredOrders = orders.filter(order => {
        const term = searchTerm.toLowerCase();
        const matchesSearch =
            (order.orderNumber || '').toLowerCase().includes(term) ||
            (order.customerId?.firstName || '').toLowerCase().includes(term) ||
            (order.customerId?.lastName || '').toLowerCase().includes(term);

        const matchesStatus = filterStatus === 'ALL' || order.status === filterStatus;

        return matchesSearch && matchesStatus;
    });

    // Pagination Logic
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const paginatedOrders = filteredOrders.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const getStatusColor = (status) => {
        switch (status) {
            case 'DELIVERED':
            case 'COMPLETED':
                return 'bg-primary/10 text-primary border-primary-muted ring-primary/10';
            case 'PROCESSING':
                return 'bg-blue-50 text-blue-700 border-blue-100 ring-blue-600/10';
            case 'SHIPPED':
                return 'bg-amber-50 text-amber-700 border-amber-100 ring-amber-600/10';
            case 'CANCELLED':
                return 'bg-rose-50 text-rose-700 border-rose-100 ring-rose-600/10';
            default:
                return 'bg-neutral-50 text-neutral-700 border-neutral-100 ring-neutral-600/10';
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-20">
            {/* Header & Controls */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8">
                <div>
                    <h1 className="text-3xl font-black text-neutral-900 tracking-tighter uppercase leading-none">Order <span className="text-primary">Ledger</span></h1>
                    <p className="text-sm font-medium text-neutral-500 mt-2">Track current shipments and delivery status.</p>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-4">
                    <div className="relative group min-w-full md:min-w-[340px]">
                        <Search className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="SEARCH ORDER ID OR CUSTOMER..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            className="w-full pl-12 pr-4 h-12 bg-white border border-neutral-100 rounded-md text-[10px] font-bold uppercase tracking-widest outline-none shadow-sm focus:border-primary transition-all placeholder:text-neutral-300"
                        />
                    </div>

                    <div className="w-full md:w-auto">
                        <Select
                            value={filterStatus}
                            onValueChange={(value) => { setFilterStatus(value); setCurrentPage(1); }}
                        >
                            <SelectTrigger className="w-full md:w-48 h-12 bg-white border-neutral-100 text-[10px] font-bold uppercase tracking-widest focus:ring-primary/10">
                                <div className="flex items-center gap-3">
                                    <Filter className="w-4 h-4 text-neutral-400" />
                                    <SelectValue placeholder="STATUS" />
                                </div>
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-neutral-100 shadow-xl">
                                <SelectItem value="ALL" className="text-[10px] font-bold uppercase tracking-widest">All Status</SelectItem>
                                <SelectItem value="PROCESSING" className="text-[10px] font-bold uppercase tracking-widest">Processing</SelectItem>
                                <SelectItem value="SHIPPED" className="text-[10px] font-bold uppercase tracking-widest">Shipped</SelectItem>
                                <SelectItem value="DELIVERED" className="text-[10px] font-bold uppercase tracking-widest">Delivered</SelectItem>
                                <SelectItem value="CANCELLED" className="text-[10px] font-bold uppercase tracking-widest">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Table View */}
            <div className="bg-white rounded-lg border border-neutral-100 shadow-sm overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-neutral-50/30">
                                <th className="px-6 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] border-b border-neutral-50 whitespace-nowrap">Order ID</th>
                                <th className="px-6 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] border-b border-neutral-50 whitespace-nowrap">Customer / Salon</th>
                                <th className="px-6 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] border-b border-neutral-50 whitespace-nowrap">Date</th>
                                <th className="px-6 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] border-b border-neutral-50 whitespace-nowrap">Status</th>
                                <th className="px-6 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] border-b border-neutral-50 whitespace-nowrap text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-50">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRowSkeleton key={i} columns={5} />
                                ))
                            ) : paginatedOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-24 text-center">
                                        <div className="w-16 h-16 bg-neutral-50 rounded-md flex items-center justify-center text-neutral-200 mx-auto mb-6">
                                            <SearchX size={32} />
                                        </div>
                                        <p className="text-neutral-400 font-black uppercase tracking-widest text-[10px]">No orders found matching criteria.</p>
                                        {(searchTerm || filterStatus !== 'ALL') && (
                                            <Button
                                                variant="link"
                                                onClick={() => { setSearchTerm(''); setFilterStatus('ALL'); }}
                                                className="text-primary font-black text-[10px] uppercase tracking-widest mt-2"
                                            >
                                                Clear Filters
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ) : (
                                paginatedOrders.map((order) => (
                                    <tr key={order._id} className="hover:bg-neutral-50/50 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-md bg-neutral-100 flex items-center justify-center text-neutral-500 group-hover:bg-primary group-hover:text-white transition-all">
                                                    <Package size={14} />
                                                </div>
                                                <span className="font-black text-[11px] text-neutral-900 uppercase tracking-tight">#{order.orderNumber || order._id.slice(-8).toUpperCase()}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-[11px] text-neutral-900">{order.customerId?.firstName} {order.customerId?.lastName}</span>
                                                <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">{order.customerId?.salonName || 'Direct Customer'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2 text-neutral-500">
                                                <Calendar size={12} />
                                                <span className="text-[10px] font-bold uppercase tracking-tight">{new Date(order.createdAt).toLocaleDateString('en-GB') || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={cn(
                                                "px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border border-current flex items-center gap-1.5 w-fit",
                                                getStatusColor(order.status)
                                            )}>
                                                {order.status === 'DELIVERED' && <CheckCircle2 size={10} />}
                                                {order.status === 'PROCESSING' && <Loader2 size={10} className="animate-spin" />}
                                                {order.status === 'SHIPPED' && <Truck size={10} />}
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <span className="font-black text-neutral-900 tracking-tighter">₹{(order.total || 0).toLocaleString()}</span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-neutral-50 flex items-center justify-between bg-neutral-50/30">
                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                            Page {currentPage} of {totalPages}
                        </span>
                        <div className="flex items-center gap-2">
                            <Button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                variant="outline"
                                className="h-8 w-8 p-0 bg-white rounded-md border-neutral-200"
                            >
                                <ChevronLeft size={14} />
                            </Button>
                            <Button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                variant="outline"
                                className="h-8 w-8 p-0 bg-white rounded-md border-neutral-200"
                            >
                                <ChevronRight size={14} />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
