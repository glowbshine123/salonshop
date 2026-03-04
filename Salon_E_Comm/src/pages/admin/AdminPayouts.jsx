import React, { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../../services/apiService';
import { useLoading } from '../../context/LoadingContext';
import { cn } from '@/lib/utils';
import {
    Clock,
    CheckCircle2,
    Search,
    Filter,
    Loader2,
    TrendingUp,
    IndianRupee,
    ShieldCheck,
    Download,
    Calendar,
    ArrowRightCircle,
    History,
    X,
    User as UserIcon,
    Package,
    ClipboardList,
    AlertCircle,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import StatCard from '../../components/admin/StatCard';
import { toast } from 'react-hot-toast';
import TableRowSkeleton from '../../components/common/TableRowSkeleton';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export default function AdminPayouts() {
    const [settlements, setSettlements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [selectedSettlement, setSelectedSettlement] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [monthFilter, setMonthFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const { finishLoading } = useLoading();

    const fetchSettlements = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                limit: 10,
                search: searchTerm,
                month: monthFilter
            };
            const res = await adminAPI.getSettlements(params);

            // Handle both legacy and paginated responses
            if (res.data.items) {
                setSettlements(res.data.items);
                setTotalPages(res.data.pagination.pages);
            } else {
                setSettlements(Array.isArray(res.data) ? res.data : []);
                setTotalPages(1);
            }

        } catch (err) {
            console.error('Failed to fetch settlements', err);
            toast.error('Capital ledger synchronization failed');
        } finally {
            setLoading(false);
            finishLoading();
        }
    }, [currentPage, searchTerm, monthFilter, finishLoading]);

    useEffect(() => {
        fetchSettlements();
    }, [fetchSettlements]);

    const handleTriggerAutoSettlement = async () => {
        if (!window.confirm('Trigger manual monthly settlement batch? This will settle all pending agent balances for the previous month.')) {
            return;
        }

        setProcessing(true);
        try {
            const res = await adminAPI.triggerAutoSettlement();
            toast.success(`Batch Complete: ${res.data.results.success} agents settled, ₹${res.data.results.totalAmount.toLocaleString()} disbursed.`);
            fetchSettlements();
        } catch (err) {
            console.error('Settlement error:', err);
            toast.error(err.response?.data?.message || 'Failed to trigger settlement batch');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <TooltipProvider>
            <div className="animate-in fade-in duration-500 pb-20 max-w-[1600px] mx-auto px-4">
                {/* Header Section */}
                <div className="pb-8 rounded-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-50/30 rounded-full -mr-24 -mt-24 blur-3xl"></div>
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-3xl font-black text-neutral-900 tracking-tighter uppercase">Automated Settlements</h1>
                            <p className="text-sm font-medium text-neutral-500 mt-1">Monthly Financial Reconciliation Ledger</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={handleTriggerAutoSettlement}
                                        disabled={processing}
                                        className="h-10 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-emerald-600/20 active:scale-95 disabled:opacity-50"
                                    >
                                        {processing ? <Loader2 className="animate-spin" size={14} /> : <ArrowRightCircle size={14} />}
                                        {processing ? 'Processing...' : 'Trigger Batch'}
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="bg-neutral-900 text-white font-bold text-[9px] uppercase tracking-widest px-4 py-2 rounded-lg border border-white/10">
                                    Process all pending commissions for the previous month immediately
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                    <StatCard
                        title="System Protocol"
                        value="FULLY AUTOMATED"
                        icon={ShieldCheck}
                        color="emerald"
                    />
                    <StatCard
                        title="Active Settlements"
                        value={settlements.length.toString()}
                        icon={TrendingUp}
                        color="neutral"
                    />
                </div>

                {/* Search & Filter Bar */}
                <div className="flex flex-col justify-end md:flex-row items-center gap-4 mb-2">
                    <div className="h-10 px-5 bg-white rounded-md flex items-center gap-3 border border-neutral-100 w-full md:max-w-md group focus-within:border-emerald-500/50 focus-within:ring-4 focus-within:ring-emerald-500/5 transition-all shadow-sm">
                        <Search className="w-4 h-4 text-neutral-400 group-focus-within:text-emerald-500" />
                        <input
                            type="text"
                            placeholder="SEARCH SETTLEMENTS (ID, AGENT)..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-widest w-full text-neutral-600 placeholder:text-neutral-300"
                        />
                    </div>

                    <div className="h-10 px-4 bg-white border border-neutral-100 rounded-md flex items-center gap-3 hover:border-emerald-500/30 transition-all cursor-pointer shadow-sm">
                        <Calendar size={14} className="text-neutral-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Month:</span>
                        <input
                            type="month"
                            value={monthFilter}
                            onChange={(e) => {
                                setMonthFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer text-emerald-600 appearance-none min-w-[120px]"
                        />
                    </div>
                </div>

                {/* Settlement Ledger */}
                <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden mb-6">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-neutral-50/50 border-b border-neutral-100 uppercase">
                                    <th className="px-8 py-5 text-[11px] font-black text-neutral-400 tracking-widest">Agent Entity</th>
                                    <th className="px-8 py-5 text-[11px] font-black text-neutral-400 tracking-widest">Settlement ID</th>
                                    <th className="px-8 py-5 text-[11px] font-black text-neutral-400 tracking-widest">Amount</th>
                                    <th className="px-8 py-5 text-[11px] font-black text-neutral-400 tracking-widest text-center">Month</th>
                                    <th className="px-8 py-5 text-[11px] font-black text-neutral-400 tracking-widest text-center">Status</th>
                                    <th className="px-8 py-5 text-[11px] font-black text-neutral-400 tracking-widest text-right">Ops</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-50">
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRowSkeleton key={i} cellCount={6} />
                                    ))
                                ) : settlements.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-10 py-32 text-center text-neutral-400 font-black uppercase tracking-widest italic leading-loose">
                                            <div className="w-16 h-16 bg-neutral-50 rounded-2xl flex items-center justify-center text-neutral-300 mx-auto mb-4">
                                                <Package size={32} />
                                            </div>
                                            No matching settlements found in registry.
                                        </td>
                                    </tr>
                                ) : (
                                    settlements.map((sett) => (
                                        <tr key={sett._id} className="hover:bg-neutral-50/50 transition-all duration-300 group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 border border-emerald-100 shrink-0 capitalize text-[14px] font-black shadow-sm group-hover:scale-105 transition-transform">
                                                        {sett.agentId?.firstName?.[0] || 'A'}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-black text-neutral-900 uppercase tracking-tight leading-tight">{sett.agentId?.firstName} {sett.agentId?.lastName}</span>
                                                        <span className="text-[10px] font-bold text-neutral-400 lowercase italic opacity-80 leading-none mt-1">{sett.agentId?.email}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <code className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50/50 px-3 py-1.5 rounded-lg border border-emerald-100/50">
                                                    {sett.setid || `SET-${sett._id?.slice(-8).toUpperCase()}`}
                                                </code>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-xs font-black text-emerald-600">₹</span>
                                                    <span className="text-xl font-black text-neutral-900 tracking-tighter">
                                                        {sett.amount.toLocaleString()}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <span className="px-3 py-1.5 bg-neutral-50 border border-neutral-100 rounded-lg text-[10px] font-black text-neutral-500 uppercase tracking-widest">
                                                    {sett.month}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <span className={cn(
                                                    "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                                                    sett.status === 'SUCCESS' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                        sett.status === 'PROCESSING' ? "bg-blue-50 text-blue-600 border-blue-100" :
                                                            sett.status === 'FAILED' ? "bg-red-50 text-red-600 border-red-100" :
                                                                "bg-neutral-50 text-neutral-500 border-neutral-100"
                                                )}>
                                                    {sett.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <button
                                                    onClick={() => setSelectedSettlement(sett)}
                                                    className="p-3 bg-neutral-50 hover:bg-emerald-600 text-neutral-400 hover:text-white rounded-xl transition-all border border-neutral-100 hover:border-emerald-600 active:scale-90"
                                                >
                                                    <History size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination (Backend Powered) */}
                    {totalPages > 1 && (
                        <div className="px-8 py-6 bg-neutral-50/50 border-t border-neutral-100 flex items-center justify-between">
                            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">
                                Page {currentPage} of {totalPages}
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 bg-white border border-neutral-200 rounded-lg text-neutral-400 hover:text-emerald-600 disabled:opacity-30 disabled:hover:text-neutral-400 transition-all shadow-sm"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 bg-white border border-neutral-200 rounded-lg text-neutral-400 hover:text-emerald-600 disabled:opacity-30 disabled:hover:text-neutral-400 transition-all shadow-sm"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Settlement Summary Modal */}
                {selectedSettlement && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setSelectedSettlement(null)} />
                        <div className="bg-white rounded-[40px] w-full max-w-lg shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300 border border-neutral-100 shadow-emerald-900/20">
                            {/* Modal Header */}
                            <div className="bg-neutral-900 p-8 text-white relative">
                                <button
                                    onClick={() => setSelectedSettlement(null)}
                                    className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors"
                                >
                                    <X size={20} />
                                </button>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 border-2 border-emerald-400/20">
                                        <ShieldCheck size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black uppercase tracking-tight">Settlement Audit</h2>
                                        <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.2em] mt-0.5">Financial Reconciliation Profile</p>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Content */}
                            <div className="p-8 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-neutral-50 p-5 rounded-3xl border border-neutral-100 shadow-inner">
                                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                                            <History size={12} /> Transaction ID
                                        </p>
                                        <code className="text-xs font-black text-neutral-900 uppercase">
                                            {selectedSettlement.setid || `SET-${selectedSettlement._id.slice(-8).toUpperCase()}`}
                                        </code>
                                    </div>
                                    <div className="bg-neutral-50 p-5 rounded-3xl border border-neutral-100">
                                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                                            <Calendar size={12} /> Accounting Month
                                        </p>
                                        <span className="text-sm font-black text-neutral-900 uppercase">
                                            {selectedSettlement.month}
                                        </span>
                                    </div>
                                </div>

                                <div className="bg-emerald-50/50 p-6 rounded-[32px] border border-emerald-100 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Final Disbursed Amount</p>
                                            <h3 className="text-3xl font-black text-neutral-900 tracking-tighter">₹{selectedSettlement.amount.toLocaleString()}</h3>
                                        </div>
                                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100">
                                            <IndianRupee size={28} />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl border border-neutral-100 group hover:border-emerald-200 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <UserIcon size={18} className="text-neutral-400" />
                                            <span className="text-xs font-black text-neutral-600 uppercase tracking-tight">Agent Executive</span>
                                        </div>
                                        <span className="text-xs font-black text-neutral-900 uppercase tracking-tight">
                                            {selectedSettlement.agentId?.firstName} {selectedSettlement.agentId?.lastName}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                                        <div className="flex items-center gap-3">
                                            <Package size={18} className="text-neutral-400" />
                                            <span className="text-xs font-black text-neutral-600 uppercase tracking-tight">Orders Audit Count</span>
                                        </div>
                                        <span className="text-xs font-black text-neutral-900">
                                            {selectedSettlement.totalOrders || 0}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                                        <div className="flex items-center gap-3">
                                            <ClipboardList size={18} className="text-neutral-400" />
                                            <span className="text-xs font-black text-neutral-600 uppercase tracking-tight">Commission Ledger Entries</span>
                                        </div>
                                        <span className="text-xs font-black text-neutral-900">
                                            {selectedSettlement.totalCommissions || 0}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                                        <div className="flex items-center gap-3">
                                            <Clock size={18} className="text-neutral-400" />
                                            <span className="text-xs font-black text-neutral-600 uppercase tracking-tight">Timestamp</span>
                                        </div>
                                        <span className="text-xs font-black text-neutral-900 uppercase tracking-tight">
                                            {new Date(selectedSettlement.settledAt || selectedSettlement.createdAt).toLocaleString()}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                                        <div className="flex items-center gap-3">
                                            <Filter size={18} className="text-neutral-400" />
                                            <span className="text-xs font-black text-neutral-600 uppercase tracking-tight">Status</span>
                                        </div>
                                        <span className={cn(
                                            "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg",
                                            selectedSettlement.status === 'SUCCESS' ? "bg-emerald-500 text-white" :
                                                selectedSettlement.status === 'PROCESSING' ? "bg-blue-500 text-white" :
                                                    selectedSettlement.status === 'FAILED' ? "bg-red-500 text-white" :
                                                        "bg-neutral-400 text-white"
                                        )}>
                                            {selectedSettlement.status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-8 bg-neutral-50 border-t border-neutral-100">
                                <button
                                    onClick={() => setSelectedSettlement(null)}
                                    className="w-full py-5 bg-neutral-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all active:scale-[0.98] shadow-lg shadow-neutral-900/10"
                                >
                                    TERMINATE AUDIT VIEW
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </TooltipProvider>
    );
}

