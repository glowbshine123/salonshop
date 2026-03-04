import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { agentAPI, authAPI } from '../../services/apiService';
import { useLoading } from '../../context/LoadingContext';
import {
    Wallet,
    ArrowUpRight,
    History,
    CheckCircle2,
    Clock,
    TrendingUp,
    Loader2,
    DollarSign,
    Calendar,
    ArrowRightCircle,
    ChevronLeft,
    ChevronRight,
    Filter,
    Package,
    ShieldCheck
} from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/admin/StatCard';
import { Button } from '../../components/ui/button';
import { cn } from '@/lib/utils';

const TableRowSkeleton = ({ columns }) => (
    <tr className="animate-pulse">
        {Array.from({ length: columns }).map((_, i) => (
            <td key={i} className="px-8 py-6">
                <Skeleton className="h-4 w-full bg-neutral-100" />
            </td>
        ))}
    </tr>
);

export default function AgentPayouts() {
    const [transactions, setTransactions] = useState([]);
    const [settlements, setSettlements] = useState([]);
    const [loadingTrans, setLoadingTrans] = useState(true);
    const { finishLoading } = useLoading();
    const [loadingSetts, setLoadingSetts] = useState(true);

    // Pagination & Filtering
    const [transPage, setTransPage] = useState(1);
    const [transTotalPages, setTransTotalPages] = useState(1);
    const [settPage, setSettPage] = useState(1);
    const [settTotalPages, setSettTotalPages] = useState(1);
    const [monthFilter, setMonthFilter] = useState('');
    const [activeTab, setActiveTab] = useState('ledger');

    const { user } = useAuth();
    const [agentStats, setAgentStats] = useState(user?.agentProfile || {});

    // Refresh agent profile on mount to ensure stats/earnings are not zero or stale
    useEffect(() => {
        const refreshStats = async () => {
            try {
                const res = await authAPI.me();
                if (res.data?.agentProfile) {
                    setAgentStats(res.data.agentProfile);
                }
            } catch (err) {
                console.error('Failed to refresh agent stats', err);
            }
        };
        refreshStats();
    }, []);


    const fetchTransactions = useCallback(async () => {
        setLoadingTrans(true);
        try {
            const params = {
                page: transPage,
                limit: 10,
                month: monthFilter
            };
            const res = await agentAPI.getTransactions(params);
            if (res.data?.items) {
                setTransactions(res.data.items);
                setTransTotalPages(res.data.pagination?.pages || 1);
            } else {
                setTransactions(Array.isArray(res.data) ? res.data : []);
                setTransTotalPages(1);
            }
        } catch (err) {
            console.error('Failed to fetch transactions', err);
            toast.error('Failed to load commission records');
            setTransactions([]);
        } finally {
            setLoadingTrans(false);
            finishLoading();
        }
    }, [transPage, monthFilter, finishLoading]);

    const fetchSettlements = useCallback(async () => {
        setLoadingSetts(true);
        try {
            const params = {
                page: settPage,
                limit: 10
            };
            const res = await agentAPI.getSettlements(params);
            if (res.data?.items) {
                setSettlements(res.data.items);
                setSettTotalPages(res.data.pagination?.pages || 1);
            } else {
                setSettlements(Array.isArray(res.data) ? res.data : []);
                setSettTotalPages(1);
            }
        } catch (err) {
            console.error('Failed to fetch settlements', err);
            toast.error('Failed to load settlement history');
            setSettlements([]);
        } finally {
            setLoadingSetts(false);
            finishLoading();
        }
    }, [settPage, finishLoading]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    useEffect(() => {
        fetchSettlements();
    }, [fetchSettlements]);

    const nextSettlementDate = () => {
        const now = new Date();
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        return nextMonth.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
            </div>
        );
    }

    // Use agentStats (refreshed state) instead of static user.agentProfile
    const profile = agentStats || {};

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-neutral-900 tracking-tighter uppercase leading-none">Earnings & <span className="text-emerald-600">Settlements</span></h1>
                    <p className="text-sm font-medium text-neutral-500 mt-2">Automated monthly settlement tracking engine.</p>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Current Month Yield"
                    value={`₹${(profile?.currentMonthEarnings || 0).toLocaleString()}`}
                    icon={TrendingUp}
                    color="emerald"
                />
                <StatCard
                    title="Lifetime Revenue"
                    value={`₹${(profile?.totalEarnings || 0).toLocaleString()}`}
                    icon={DollarSign}
                    color="blue"
                />
                <StatCard
                    title="Last Payout"
                    value={profile?.lastSettlementDate
                        ? new Date(profile.lastSettlementDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                        : 'PENDING'}
                    icon={Calendar}
                    color="neutral"
                />
            </div>

            {/* Smart Policy Banner */}
            <div className="relative bg-neutral-900 rounded-[32px] p-10 text-white shadow-2xl border border-white/5 overflow-hidden group">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full -mr-40 -mt-40 blur-[100px]" />
                <div className="absolute inset-0 bg-neutral-800/20" />

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="space-y-4 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                            <ShieldCheck size={12} />
                            Settlement Policy
                        </div>
                        <h3 className="text-2xl font-black tracking-tight uppercase">Automated Yield Engine</h3>
                        <p className="text-neutral-400 text-sm font-medium leading-relaxed">
                            Your commissions are calculated instantly on order completion and settled automatically to your registered bank account on the <span className="text-white font-bold underline decoration-emerald-500 underline-offset-4">1st of every month</span>.
                        </p>
                    </div>
                    <div className="flex flex-col items-center xl:items-end">
                        <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-1">Estimated Next Release</span>
                        <span className="text-2xl font-black text-emerald-400 tracking-tighter uppercase">{nextSettlementDate()}</span>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center p-1 bg-neutral-100 rounded-2xl w-full max-w-sm">
                <button
                    onClick={() => setActiveTab('ledger')}
                    className={cn(
                        "flex-1 py-3 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                        activeTab === 'ledger' ? "bg-white text-emerald-600 shadow-sm" : "text-neutral-400 hover:text-neutral-600"
                    )}
                >
                    Commission Ledger
                </button>
                <button
                    onClick={() => setActiveTab('settlements')}
                    className={cn(
                        "flex-1 py-3 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                        activeTab === 'settlements' ? "bg-white text-emerald-600 shadow-sm" : "text-neutral-400 hover:text-neutral-600"
                    )}
                >
                    Settlement History
                </button>
            </div>

            {/* Transactions Section */}
            {activeTab === 'ledger' && (
                <div className="space-y-8 animate-in slide-in-from-bottom-5 duration-500">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-neutral-900 rounded-full" />
                            <h2 className="text-2xl font-black text-neutral-900 tracking-tight uppercase">Commission Ledger</h2>
                        </div>

                        <div className="flex items-center gap-2.5">
                            <Filter size={14} className="text-neutral-400" />
                            <div className="bg-white px-4 h-11 border border-neutral-100 rounded-xl flex items-center shadow-sm">
                                <input
                                    type="month"
                                    value={monthFilter}
                                    onChange={(e) => {
                                        setMonthFilter(e.target.value);
                                        setTransPage(1);
                                    }}
                                    className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none text-neutral-600 appearance-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[32px] border border-neutral-100 shadow-sm overflow-hidden flex flex-col">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-neutral-50/30">
                                        <th className="px-8 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] border-b border-neutral-50">Transaction</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] border-b border-neutral-50">Order Ref</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] border-b border-neutral-50">Asset Yield</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] border-b border-neutral-50 text-center">Reference Month</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] border-b border-neutral-50">Status</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] border-b border-neutral-50 text-right">Processed On</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-50">
                                    {loadingTrans ? (
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <TableRowSkeleton key={i} columns={6} />
                                        ))
                                    ) : (!transactions || transactions.length === 0) ? (
                                        <tr>
                                            <td colSpan="6" className="px-8 py-32 text-center">
                                                <div className="w-16 h-16 bg-neutral-50 rounded-2xl flex items-center justify-center text-neutral-200 mx-auto mb-6">
                                                    <History size={32} />
                                                </div>
                                                <p className="text-neutral-400 font-black uppercase tracking-widest text-[10px]">No commission records discovered in current block.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        transactions.map((trx) => (
                                            <tr key={trx?._id || Math.random()} className="hover:bg-neutral-50/50 transition-all group">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className={cn(
                                                            "w-10 h-10 rounded-xl flex items-center justify-center border ring-1 ring-inset shadow-sm transition-colors",
                                                            trx?.status === 'SETTLED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 ring-emerald-600/10' : 'bg-neutral-900 text-white border-white/10 ring-white/10'
                                                        )}>
                                                            <DollarSign size={18} />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-black text-xs uppercase tracking-tight text-neutral-900">Portfolio Commission</span>
                                                            <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">ID: {trx?._id ? trx._id.slice(-8).toUpperCase() : 'N/A'}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-2">
                                                        <Package size={14} className="text-neutral-400" />
                                                        <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-wider">
                                                            {trx?.orderId?.orderNumber || 'N/A'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="font-black text-neutral-900 text-lg tracking-tighter group-hover:text-emerald-600 transition-colors">₹{(trx?.amount || 0).toLocaleString()}</span>
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest bg-neutral-100 px-3 py-1.5 rounded-lg border border-neutral-200">{trx?.month || 'N/A'}</span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className={cn(
                                                        "px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ring-1 ring-inset shadow-sm",
                                                        trx?.status === 'SETTLED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100 ring-emerald-600/10' : 'bg-neutral-900 text-white border-white/10 ring-white/10'
                                                    )}>
                                                        {trx?.status || 'UNKNOWN'}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-tight">
                                                        {trx?.createdAt ? new Date(trx.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {transTotalPages > 1 && (
                            <div className="px-8 py-6 bg-neutral-50/50 border-t border-neutral-50 flex items-center justify-between">
                                <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest leading-none">
                                    Ledger Page {transPage} of {transTotalPages}
                                </span>
                                <div className="flex items-center gap-3">
                                    <Button
                                        onClick={() => setTransPage(p => Math.max(1, p - 1))}
                                        disabled={transPage === 1}
                                        variant="outline"
                                        className="h-10 px-4 bg-white rounded-xl border-neutral-200"
                                    >
                                        <ChevronLeft size={16} />
                                    </Button>
                                    <Button
                                        onClick={() => setTransPage(p => Math.min(transTotalPages, p + 1))}
                                        disabled={transPage === transTotalPages}
                                        variant="outline"
                                        className="h-10 px-4 bg-white rounded-xl border-neutral-200"
                                    >
                                        <ChevronRight size={16} />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Settlement History Section */}
            {activeTab === 'settlements' && (
                <div className="space-y-8 animate-in slide-in-from-bottom-5 duration-500">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-emerald-600 rounded-full" />
                        <h2 className="text-2xl font-black text-neutral-900 tracking-tight uppercase">Settlement History</h2>
                    </div>

                    <div className="bg-white rounded-[32px] border border-neutral-100 shadow-sm overflow-hidden flex flex-col">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-neutral-50/30">
                                        <th className="px-8 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] border-b border-neutral-50">Settlement ID</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] border-b border-neutral-50">Disbursed Amount</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] border-b border-neutral-50 text-center">Batch Month</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] border-b border-neutral-50 text-right">Clearance Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-50">
                                    {loadingSetts ? (
                                        Array.from({ length: 3 }).map((_, i) => (
                                            <TableRowSkeleton key={i} columns={4} />
                                        ))
                                    ) : (!settlements || settlements.length === 0) ? (
                                        <tr>
                                            <td colSpan="4" className="px-8 py-24 text-center">
                                                <div className="w-16 h-16 bg-neutral-50 rounded-2xl flex items-center justify-center text-neutral-200 mx-auto mb-6">
                                                    <ArrowRightCircle size={32} />
                                                </div>
                                                <p className="text-neutral-400 font-black uppercase tracking-widest text-[10px]">No historical settlements found in your portfolio.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        settlements.map((sett) => (
                                            <tr key={sett?._id || Math.random()} className="hover:bg-neutral-50/50 transition-all group">
                                                <td className="px-8 py-6">
                                                    <code className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 shadow-inner">
                                                        {sett?.setid || (sett?._id ? `SET-${sett._id.slice(-8).toUpperCase()}` : 'N/A')}
                                                    </code>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="font-black text-neutral-900 text-xl tracking-tighter group-hover:text-emerald-600 transition-colors">₹{(sett?.amount || 0).toLocaleString()}</span>
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">{sett?.month || 'N/A'}</span>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-tight flex items-center justify-end gap-2 group-hover:text-emerald-600 transition-colors">
                                                        <CheckCircle2 size={12} className="text-emerald-500" />
                                                        {(sett?.settledAt || sett?.createdAt) ? new Date(sett?.settledAt || sett?.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {settTotalPages > 1 && (
                            <div className="px-8 py-6 bg-neutral-50/50 border-t border-neutral-50 flex items-center justify-between">
                                <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest leading-none">
                                    History Page {settPage} of {settTotalPages}
                                </span>
                                <div className="flex items-center gap-3">
                                    <Button
                                        onClick={() => setSettPage(p => Math.max(1, p - 1))}
                                        disabled={settPage === 1}
                                        variant="outline"
                                        className="h-10 px-4 bg-white rounded-xl border-neutral-200"
                                    >
                                        <ChevronLeft size={16} />
                                    </Button>
                                    <Button
                                        onClick={() => setSettPage(p => Math.min(settTotalPages, p + 1))}
                                        disabled={settPage === settTotalPages}
                                        variant="outline"
                                        className="h-10 px-4 bg-white rounded-xl border-neutral-200"
                                    >
                                        <ChevronRight size={16} />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
