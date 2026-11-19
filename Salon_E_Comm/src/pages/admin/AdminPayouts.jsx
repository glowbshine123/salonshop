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
import StatCard from '../../components/dashboard/StatCard';
import { toast } from 'react-hot-toast';
import TableRowSkeleton from '../../components/dashboard/TableRowSkeleton';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";


export default function AdminPayouts() {
    const [settlements, setSettlements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [selectedSettlement, setSelectedSettlement] = useState(null);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [month, setMonth] = useState('all');
    const [year, setYear] = useState(new Date().getFullYear().toString());
    const [status, setStatus] = useState('all');
    const [totalPages, setTotalPages] = useState(1);
    const [stats, setStats] = useState(null);
    const [updatingStatusId, setUpdatingStatusId] = useState(null);

    const { finishLoading } = useLoading();

    const fetchSettlements = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page,
                limit: 10,
                search
            };
            if (month && month !== 'all') params.month = month;
            if (year) params.year = year;
            if (status && status !== 'all') params.status = status;
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
    }, [page, search, month, year, status, finishLoading]);

    const fetchStats = useCallback(async () => {
        try {
            const res = await adminAPI.getSettlementStats();
            setStats(res.data);
        } catch (err) {
            console.error('Failed to fetch settlement stats', err);
            toast.error('Failed to fetch settlement statistics');
        }
    }, []);

    useEffect(() => {
        fetchSettlements();
    }, [fetchSettlements]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const handleStatusUpdate = async (settlementId, newStatus) => {
        setUpdatingStatusId(settlementId);
        try {
            await adminAPI.updateSettlement(settlementId, { status: newStatus });
            toast.success(`Settlement status updated to ${newStatus}`);
            fetchSettlements();
            fetchStats(); // Update gross disbursed if status became 'paid'
        } catch (err) {
            console.error('Failed to update settlement status', err);
            toast.error('Status update protocol failed');
        } finally {
            setUpdatingStatusId(null);
        }
    };

    const statusOptions = [
        { label: 'All Status', value: 'all' },
        { label: 'Pending', value: 'pending' },
        { label: 'Paid', value: 'paid' },
        { label: 'Processing', value: 'processing' },
        { label: 'Rejected', value: 'rejected' },
        { label: 'Cancelled', value: 'cancelled' }
    ];

    const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString());

    return (
        <TooltipProvider>
            <div className="animate-in fade-in duration-500 pb-20 max-w-[1600px] mx-auto px-4">
                {/* Header Section */}
                <div className="pb-8 rounded-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full -mr-24 -mt-24 blur-3xl"></div>
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-3xl font-black text-neutral-900 tracking-tighter uppercase leading-none">Settlement <span className="text-primary">Registry</span></h1>
                            <p className="text-sm font-medium text-neutral-500 mt-2">Historical audit trail of all manual and legacy payouts.</p>
                        </div>
                    </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <StatCard
                        title="Gross Disbursed"
                        value={`₹${(stats?.totalSettled || 0).toLocaleString()}`}
                        icon={TrendingUp}
                        color="pink"
                    />
                    <StatCard
                        title="Active Settlements"
                        value={stats?.settlementCount || 0}
                        icon={History}
                        color="blue"
                    />
                    <StatCard
                        title="Last Batch Date"
                        value={stats?.lastSettlementDate ? new Date(stats.lastSettlementDate).toLocaleDateString() : 'N/A'}
                        icon={Calendar}
                        color="neutral"
                    />
                </div>

                {/* Advanced Filters */}
                <div className="bg-white p-4 md:p-6 rounded-lg border border-neutral-100 shadow-sm space-y-6 mb-6">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        <div className="w-full lg:flex-1 relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-primary transition-colors" size={16} />
                            <input
                                type="text"
                                placeholder="SEARCH BY AGENT NAME OR EMAIL..."
                                className="w-full pl-12 pr-4 py-3.5 bg-neutral-50 border border-neutral-100 rounded-md text-[10px] font-black uppercase tracking-widest outline-none focus:border-primary focus:bg-white transition-all placeholder:text-neutral-200 shadow-inner"
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                            />
                        </div>
                        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-start">
                            <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
                                <SelectTrigger className="w-40 h-14 bg-neutral-50 border-neutral-100 rounded-md text-[10px] font-black uppercase tracking-widest">
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent className="bg-white border-neutral-100 rounded-md shadow-xl">
                                    {statusOptions.map(opt => (
                                        <SelectItem key={opt.value} value={opt.value} className="text-[10px] font-black uppercase tracking-widest">
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={month} onValueChange={(v) => { setMonth(v); setPage(1); }}>
                                <SelectTrigger className="w-36 h-14 bg-neutral-50 border-neutral-100 rounded-md text-[10px] font-black uppercase tracking-widest">
                                    <SelectValue placeholder="All Months" />
                                </SelectTrigger>
                                <SelectContent className="bg-white border-neutral-100 rounded-md shadow-xl">
                                    <SelectItem value="all" className="text-[10px] font-black uppercase tracking-widest">All Months</SelectItem>
                                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                                        <SelectItem key={m} value={m} className="text-[10px] font-black uppercase tracking-widest">
                                            {m}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={year} onValueChange={(v) => { setYear(v); setPage(1); }}>
                                <SelectTrigger className="w-28 h-14 bg-neutral-50 border-neutral-100 rounded-md text-[10px] font-black uppercase tracking-widest">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-white border-neutral-100 rounded-md shadow-xl">
                                    {years.map(y => (
                                        <SelectItem key={y} value={y} className="text-[10px] font-black uppercase tracking-widest">
                                            {y}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Settlement Ledger */}
                <div className="bg-white rounded-lg border border-neutral-100 shadow-sm overflow-hidden mb-6">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse min-w-[1000px]">
                            <thead>
                                <tr className="bg-neutral-50/50 border-b border-neutral-100 uppercase">
                                    <th className="px-8 py-6 text-[11px] font-black text-neutral-400 uppercase tracking-[0.2em] border-b border-neutral-50 whitespace-nowrap">Agent Entity</th>
                                    <th className="px-8 py-6 text-[11px] font-black text-neutral-400 uppercase tracking-[0.2em] border-b border-neutral-50 whitespace-nowrap">Amount Yield</th>
                                    <th className="px-8 py-6 text-[11px] font-black text-neutral-400 uppercase tracking-[0.2em] border-b border-neutral-50 whitespace-nowrap">Reference</th>
                                    <th className="px-8 py-6 text-[11px] font-black text-neutral-400 uppercase tracking-[0.2em] border-b border-neutral-50 whitespace-nowrap">Method</th>
                                    <th className="px-8 py-6 text-[11px] font-black text-neutral-400 uppercase tracking-[0.2em] border-b border-neutral-50 whitespace-nowrap">Status</th>
                                    <th className="px-8 py-6 text-[11px] font-black text-neutral-400 uppercase tracking-[0.2em] border-b border-neutral-50 text-right whitespace-nowrap">Processed On</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-50">
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRowSkeleton key={i} cellCount={6} />
                                    ))
                                ) : settlements.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-8 py-32 text-center">
                                            <div className="w-20 h-20 bg-neutral-50 rounded-md flex items-center justify-center text-neutral-200 mx-auto mb-6">
                                                <History size={32} />
                                            </div>
                                            <p className="text-neutral-400 font-extrabold uppercase tracking-widest text-xs">No settlements found in this index.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    settlements.map((settlement) => (
                                        <tr key={settlement._id} className="hover:bg-neutral-50/50 transition-all group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <Avatar className="w-12 h-12 border-2 border-white shadow-sm ring-1 ring-neutral-100">
                                                        <AvatarImage src={settlement.agentId?.avatarUrl} />
                                                        <AvatarFallback className="bg-neutral-900 text-white font-black text-[10px] italic">
                                                            {settlement.agentId?.firstName?.[0]}{settlement.agentId?.lastName?.[0]}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col">
                                                        <span className="font-black text-xs uppercase tracking-tight text-neutral-900 leading-none">
                                                            {settlement.agentId?.firstName} {settlement.agentId?.lastName}
                                                        </span>
                                                        <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest mt-1.5">
                                                            {settlement.agentId?.email}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="font-black text-neutral-900 text-lg tracking-tighter group-hover:text-primary transition-colors">
                                                    ₹{settlement.amount.toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">
                                                        {settlement.month}
                                                    </span>
                                                    {settlement.transactionId && (
                                                        <span className="text-[9px] font-bold text-primary uppercase tracking-widest mt-1">
                                                            ID: {settlement.transactionId.slice(-12).toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 uppercase text-[10px] font-black text-neutral-500 tracking-widest">
                                                {settlement.payoutMethod || 'razorpay'}
                                            </td>
                                            <td className="px-8 py-6">
                                                <Select
                                                    disabled={updatingStatusId === settlement._id}
                                                    value={settlement.status}
                                                    onValueChange={(v) => handleStatusUpdate(settlement._id, v)}
                                                >
                                                    <SelectTrigger className={cn(
                                                        "w-36 h-10 rounded-md text-[10px] font-black uppercase tracking-widest border ring-1 ring-inset shadow-sm",
                                                        settlement.status === 'paid' ? 'bg-primary/10 text-primary border-primary-muted ring-primary/10' :
                                                            settlement.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-100 ring-amber-600/10' :
                                                                'bg-neutral-50 text-neutral-700 border-neutral-100 ring-neutral-900/10'
                                                    )}>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-white border-neutral-100 rounded-md shadow-xl">
                                                        {statusOptions.filter(opt => opt.value !== 'all').map(opt => (
                                                            <SelectItem key={opt.value} value={opt.value} className="text-[10px] font-black uppercase tracking-widest cursor-pointer">
                                                                {opt.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex flex-col items-end">
                                                    <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-tight flex items-center gap-2 group-hover:text-primary transition-colors">
                                                        <CheckCircle2 size={12} className={settlement.status === 'paid' ? "text-primary" : "text-neutral-300"} />
                                                        {new Date(settlement.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </span>
                                                    <span className="text-[9px] text-neutral-300 font-bold uppercase tracking-tighter mt-1">
                                                        {new Date(settlement.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
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
                            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                                Page {page} of {totalPages}
                            </span>
                            <div className="flex items-center gap-2">
                                <Button
                                    onClick={() => setPage(prev => Math.max(1, prev - 1))}
                                    disabled={page === 1}
                                    variant="outline"
                                    className="h-8 w-8 p-0 bg-white rounded-md border-neutral-200 shadow-sm"
                                >
                                    <ChevronLeft size={16} />
                                </Button>
                                <Button
                                    onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={page === totalPages}
                                    variant="outline"
                                    className="h-8 w-8 p-0 bg-white rounded-md border-neutral-200 shadow-sm"
                                >
                                    <ChevronRight size={16} />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Settlement Summary Modal */}
                {selectedSettlement && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setSelectedSettlement(null)} />
                        <div className="bg-white rounded-lg w-full max-w-lg shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300 border border-neutral-100 shadow-primary-900/20">
                            {/* Modal Header */}
                            <div className="bg-neutral-900 p-8 text-white relative">
                                <button
                                    onClick={() => setSelectedSettlement(null)}
                                    className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors"
                                >
                                    <X size={20} />
                                </button>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20 border-2 border-primary-muted">
                                        <ShieldCheck size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black uppercase tracking-tight">Settlement Audit</h2>
                                        <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mt-0.5">Financial Reconciliation Profile</p>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Content */}
                            <div className="p-8 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-neutral-50 p-5 rounded-md border border-neutral-100 shadow-inner">
                                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                                            <History size={12} /> Transaction ID
                                        </p>
                                        <code className="text-xs font-black text-neutral-900 uppercase">
                                            {selectedSettlement.setid || `SET-${selectedSettlement._id.slice(-8).toUpperCase()}`}
                                        </code>
                                    </div>
                                    <div className="bg-neutral-50 p-5 rounded-md border border-neutral-100">
                                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                                            <Calendar size={12} /> Accounting Month
                                        </p>
                                        <span className="text-sm font-black text-neutral-900 uppercase">
                                            {selectedSettlement.month}
                                        </span>
                                    </div>
                                </div>

                                <div className="bg-primary/10 p-6 rounded-md border border-primary-muted shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Final Disbursed Amount</p>
                                            <h3 className="text-3xl font-black text-neutral-900 tracking-tighter">₹{selectedSettlement.amount.toLocaleString()}</h3>
                                        </div>
                                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm border border-primary-muted">
                                            <IndianRupee size={28} />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-md border border-neutral-100 group hover:border-primary/30 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <UserIcon size={18} className="text-neutral-400" />
                                            <span className="text-xs font-black text-neutral-600 uppercase tracking-tight">Agent Executive</span>
                                        </div>
                                        <span className="text-xs font-black text-neutral-900 uppercase tracking-tight">
                                            {selectedSettlement.agentId?.firstName} {selectedSettlement.agentId?.lastName}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-md border border-neutral-100">
                                        <div className="flex items-center gap-3">
                                            <Package size={18} className="text-neutral-400" />
                                            <span className="text-xs font-black text-neutral-600 uppercase tracking-tight">Orders Audit Count</span>
                                        </div>
                                        <span className="text-xs font-black text-neutral-900">
                                            {selectedSettlement.totalOrders || 0}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-md border border-neutral-100">
                                        <div className="flex items-center gap-3">
                                            <ClipboardList size={18} className="text-neutral-400" />
                                            <span className="text-xs font-black text-neutral-600 uppercase tracking-tight">Commission Ledger Entries</span>
                                        </div>
                                        <span className="text-xs font-black text-neutral-900">
                                            {selectedSettlement.totalCommissions || 0}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-md border border-neutral-100">
                                        <div className="flex items-center gap-3">
                                            <Clock size={18} className="text-neutral-400" />
                                            <span className="text-xs font-black text-neutral-600 uppercase tracking-tight">Timestamp</span>
                                        </div>
                                        <span className="text-xs font-black text-neutral-900 uppercase tracking-tight">
                                            {new Date(selectedSettlement.settledAt || selectedSettlement.createdAt).toLocaleString()}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-md border border-neutral-100">
                                        <div className="flex items-center gap-3">
                                            <Filter size={18} className="text-neutral-400" />
                                            <span className="text-xs font-black text-neutral-600 uppercase tracking-tight">Status</span>
                                        </div>
                                        <span className={cn(
                                            "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg",
                                            selectedSettlement.status === 'SUCCESS' ? "bg-primary text-white" :
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
                                    className="w-full py-5 bg-neutral-900 text-white rounded-md font-black text-xs uppercase tracking-[0.2em] hover:bg-primary transition-all active:scale-[0.98] shadow-lg shadow-neutral-900/10"
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

