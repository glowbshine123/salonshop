import React, { useState, useEffect } from 'react';
import {
    Users,
    Search,
    Filter,
    Clock,
    Mail,
    Phone,
    TrendingUp,
    ShieldCheck,
    MapPin,
    IndianRupee,
    Loader2,
    Calendar,
    ArrowUpRight,
    ChevronLeft,
    ChevronRight,
    SearchX
} from 'lucide-react';
import { userAPI } from '../../services/apiService';
import { useLoading } from '../../context/LoadingContext';
import StatCard from '../../components/dashboard/StatCard';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../components/ui/select';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';

export default function AdminUsers() {
    const [salons, setSalons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const { finishLoading } = useLoading();
    const [updatingStatusId, setUpdatingStatusId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchSalons();
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm, filterStatus, currentPage]);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterStatus]);

    const fetchSalons = async () => {
        try {
            setLoading(true);
            const params = {
                role: 'SALON_OWNER',
                search: searchTerm,
                status: filterStatus !== 'All' ? filterStatus : undefined,
                page: currentPage,
                limit: 10
            };
            const res = await userAPI.getAll(params);

            if (res.data.users) {
                setSalons(res.data.users);
                setTotalPages(res.data.pagination?.pages || 1);
                setTotalResults(res.data.pagination?.total || res.data.users.length);
            } else {
                setSalons(res.data || []);
                setTotalPages(1);
                setTotalResults(Array.isArray(res.data) ? res.data.length : 0);
            }
        } catch (err) {
            console.error('Failed to fetch salons:', err);
            toast.error('Salon registry synchronization failed');
        } finally {
            setLoading(false);
            finishLoading();
        }
    };

    const handleStatusUpdate = async (salonId, newStatus) => {
        try {
            setUpdatingStatusId(salonId);
            await userAPI.updateStatus(salonId, newStatus);
            toast.success(`Node status updated to ${newStatus}`);
            // Update local state
            setSalons(salons.map(s => s._id === salonId ? { ...s, status: newStatus } : s));
        } catch (err) {
            console.error('Failed to update status:', err);
            toast.error('Status update failed');
        } finally {
            setUpdatingStatusId(null);
        }
    };

    const stats = {
        total: salons.length,
        pending: salons.filter(s => s.status === 'PENDING').length,
        growth: '+12%'
    };

    const statusOptions = [
        { value: 'PENDING', label: 'Pending', color: 'text-amber-600 bg-amber-50' },
        { value: 'ACTIVE', label: 'Active', color: 'text-primary bg-primary/10' },
        { value: 'REJECTED', label: 'Rejected', color: 'text-rose-600 bg-rose-50' },
        { value: 'DEACTIVE', label: 'Deactive', color: 'text-neutral-500 bg-neutral-50' },
    ];

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-20">
            {/* Header & Search */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8">
                <div>
                    <h1 className="text-3xl font-black text-neutral-900 tracking-tighter uppercase leading-none">Salon <span className="text-primary">Registry</span></h1>
                    <p className="text-sm font-medium text-neutral-500 mt-2">Professional Partner Onboarding & Management</p>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Total Partners"
                    value={stats.total}
                    icon={Users}
                    color="neutral"
                />
                <StatCard
                    title="Pending Review"
                    value={stats.pending}
                    icon={Clock}
                    color="amber"
                />
                <StatCard
                    title="Network Expansion"
                    value={stats.growth}
                    trend="up"
                    trendValue="12%"
                    icon={TrendingUp}
                    color="pink"
                />
            </div>

            {/* Registry Table */}
            <div className="bg-white rounded-lg border border-neutral-100 shadow-sm overflow-hidden flex flex-col">
                <div className="p-5 border-b border-neutral-50 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-neutral-50/20">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                        <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-widest">Salon Database</h2>
                    </div>
                    <div className="flex flex-col lg:flex-row lg:items-center gap-3 w-full lg:w-auto">
                        <div className="relative group w-full lg:w-72">
                            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="SEARCH PARTNER, PHONE OR CITY..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 h-10 bg-white border border-neutral-100 rounded-md text-[10px] font-bold uppercase tracking-widest outline-none shadow-sm focus:border-primary transition-all placeholder:text-neutral-300"
                            />
                        </div>
                        <div className="grid grid-cols-2 sm:flex sm:flex-row items-center gap-2 w-full lg:w-auto">
                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                <SelectTrigger className="w-32 h-10 bg-white border-neutral-100 rounded-md text-[10px] font-bold uppercase tracking-widest shadow-sm">
                                    <div className="flex items-center gap-2">
                                        <Filter size={12} className="text-neutral-400" />
                                        <SelectValue placeholder="STATUS" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="bg-white border-neutral-100 rounded-md shadow-xl">
                                    <SelectItem value="All" className="text-[10px] font-bold uppercase tracking-widest cursor-pointer focus:bg-neutral-50">ALL STATUS</SelectItem>
                                    {statusOptions.map(opt => (
                                        <SelectItem key={opt.value} value={opt.value} className="text-[10px] font-bold uppercase tracking-widest cursor-pointer focus:bg-neutral-50">
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="bg-neutral-50/30 font-black uppercase tracking-widest">
                                <th className="px-6 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] border-b border-neutral-50 whitespace-nowrap">Salon Identity</th>
                                <th className="px-6 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] border-b border-neutral-50 whitespace-nowrap">Email Address</th>
                                <th className="px-6 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] border-b border-neutral-50 whitespace-nowrap">Phone Number</th>
                                <th className="px-6 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] border-b border-neutral-50 whitespace-nowrap">Full Address</th>
                                <th className="px-6 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] border-b border-neutral-50 whitespace-nowrap">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-50">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan="5" className="px-6 py-8">
                                            <div className="h-10 w-full bg-neutral-50 animate-pulse rounded-md" />
                                        </td>
                                    </tr>
                                ))
                            ) : salons.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-24 text-center">
                                        <div className="w-16 h-16 bg-neutral-50 rounded-md flex items-center justify-center text-neutral-200 mx-auto mb-6">
                                            <SearchX size={32} />
                                        </div>
                                        <p className="text-neutral-400 font-black uppercase tracking-widest text-[10px]">No salons found matching criteria.</p>
                                    </td>
                                </tr>
                            ) : (
                                salons.map((salon) => (
                                    <tr key={salon._id} className="hover:bg-neutral-50/50 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <Avatar className="w-10 h-10 rounded-md border-2 border-white shadow-sm ring-1 ring-neutral-100">
                                                    <AvatarImage src={salon.avatarUrl} />
                                                    <AvatarFallback className="bg-neutral-100 text-neutral-400 font-bold text-xs uppercase group-hover:bg-primary group-hover:text-white transition-all">
                                                        {salon.firstName?.[0]}{salon.lastName?.[0]}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="font-black text-[11px] text-neutral-900 uppercase tracking-tight">{salon.firstName} {salon.lastName}</span>
                                                    <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">ID: {salon._id?.slice(-8).toUpperCase()}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2 text-neutral-600">
                                                <Mail size={12} className="text-neutral-300 shrink-0" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest truncate max-w-[200px]">{salon.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2 text-neutral-600">
                                                <Phone size={12} className="text-neutral-300 shrink-0" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">{salon.phone || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-start gap-2 max-w-[250px]">
                                                <MapPin size={12} className="text-neutral-300 mt-0.5 shrink-0" />
                                                <div className="flex flex-col">
                                                    {(() => {
                                                        const addr = salon.salonOwnerProfile?.shippingAddresses?.find(a => a.isDefault) ||
                                                            salon.salonOwnerProfile?.shippingAddresses?.[0];
                                                        if (!addr) return <span className="text-[11px] text-neutral-300 italic uppercase">ADDRESS NOT PROVIDED</span>;
                                                        return (
                                                            <>
                                                                <span className="text-[11px] text-neutral-900 font-bold uppercase tracking-tight leading-tight">{addr.street || 'No Street'}</span>
                                                                <span className="text-[10px] text-neutral-400 font-medium uppercase tracking-widest italic mt-0.5">
                                                                    {addr.city || ''}{addr.city && addr.state ? ', ' : ''}{addr.state || ''} {addr.zip || ''}
                                                                </span>
                                                            </>
                                                        );
                                                    })()}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <Select
                                                disabled={updatingStatusId === salon._id}
                                                value={salon.status}
                                                onValueChange={(value) => handleStatusUpdate(salon._id, value)}
                                            >
                                                <SelectTrigger className={cn(
                                                    "w-32 h-9 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all",
                                                    statusOptions.find(opt => opt.value === salon.status)?.color || "bg-neutral-50 text-neutral-500"
                                                )}>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="bg-white border-neutral-100 rounded-md shadow-xl">
                                                    {statusOptions.map(option => (
                                                        <SelectItem
                                                            key={option.value}
                                                            value={option.value}
                                                            className="text-[10px] font-bold uppercase tracking-widest cursor-pointer focus:bg-neutral-50"
                                                        >
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="px-8 py-5 border-t border-neutral-50 flex items-center justify-between bg-neutral-50/10">
                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                            Page {currentPage} of {totalPages} — {totalResults} Entries
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
