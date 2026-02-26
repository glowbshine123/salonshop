import React, { useState, useEffect } from 'react';
import {
    Users,
    Search,
    Filter,
    Clock,
    Mail,
    Phone,
    Briefcase,
    TrendingUp,
    UserPlus,
    Loader2,
    ShieldCheck,
    ChevronDown,
    MapPin
} from 'lucide-react';
import { userAPI } from '../../services/apiService';
import { useLoading } from '../../context/LoadingContext';
import StatCard from '../../components/admin/StatCard';
import AssignAgentModal from '../../components/admin/AssignAgentModal';
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
    const [selectedSalon, setSelectedSalon] = useState(null);
    const { startLoading, finishLoading } = useLoading();
    const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
    const [updatingStatusId, setUpdatingStatusId] = useState(null);

    useEffect(() => {
        fetchSalons();
    }, []);

    const fetchSalons = async () => {
        try {
            setLoading(true);
            const res = await userAPI.getAll({ role: 'SALON_OWNER' });
            setSalons(res.data.users || []);
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

    const filteredSalons = salons.filter(salon => {
        const fullName = `${salon.firstName} ${salon.lastName}`.toLowerCase();
        const matchesSearch =
            fullName.includes(searchTerm.toLowerCase()) ||
            salon.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            salon.phone?.includes(searchTerm);
        const matchesStatus = filterStatus === 'All' || salon.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: salons.length,
        pending: salons.filter(s => s.status === 'PENDING').length,
        growth: '+8%'
    };

    const statusOptions = [
        { value: 'PENDING', label: 'Pending', color: 'text-amber-600 bg-amber-50' },
        { value: 'ACTIVE', label: 'Active', color: 'text-emerald-600 bg-emerald-50' },
        { value: 'REJECTED', label: 'Rejected', color: 'text-rose-600 bg-rose-50' },
        { value: 'DEACTIVE', label: 'Deactive', color: 'text-neutral-500 bg-neutral-50' },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-neutral-900 tracking-wide">Salon Owners</h1>
                    <p className="text-base font-bold text-neutral-400 tracking-wide mt-1">Professional Partner Onboarding & Management</p>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    color="emerald"
                />
            </div>

            {/* Consolidated Registry Container */}
            <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
                {/* Search & Filter Header */}
                <div className="p-6 border-b border-neutral-50 flex flex-col md:flex-row md:items-center justify-end gap-4">
                    <div className="relative group w-full md:w-80">
                        <Search className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-emerald-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search in registry..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 h-11 bg-neutral-50 border border-neutral-100 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-emerald-500/5 focus:bg-white focus:border-emerald-500 transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="px-3 h-11 bg-neutral-50 rounded-xl flex items-center gap-3 border border-neutral-100 min-w-[140px]">
                            <Filter size={14} className="text-neutral-400" />
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="bg-transparent text-[11px] font-bold uppercase tracking-wider outline-none cursor-pointer text-neutral-600 flex-1"
                            >
                                <option value="All">All Status</option>
                                <option value="ACTIVE">Active</option>
                                <option value="PENDING">Pending</option>
                                <option value="REJECTED">Rejected</option>
                                <option value="DEACTIVE">Deactive</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto scrollbar-hide">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-neutral-50/30">
                                <th className="px-6 py-4 text-[11px] font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-50">Salon Owner</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-50">Contact</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-50">Categories</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-50">Assigned Agent</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-50">Status</th>
                                {/* <th className="px-6 py-4 text-[11px] font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-50 text-right">actions</th> */}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                                            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Synchronizing Registry...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredSalons.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center">
                                        <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <ShieldCheck size={32} className="text-neutral-200" />
                                        </div>
                                        <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">No matching records found.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredSalons.map((salon) => (
                                    <tr key={salon._id} className="hover:bg-neutral-50/30 transition-all duration-200">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <Avatar className="w-10 h-10 border border-neutral-100">
                                                    <AvatarImage src={salon.avatar || salon.avatarUrl} />
                                                    <AvatarFallback className="bg-emerald-50 text-emerald-700 text-xs font-black">
                                                        {salon.firstName?.[0]}{salon.lastName?.[0]}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-neutral-900 leading-tight">{salon.firstName} {salon.lastName}</span>
                                                    <div className="flex items-center gap-1.5 mt-0.5 text-neutral-400">
                                                        <MapPin size={10} />
                                                        <span className="text-[10px] uppercase font-medium tracking-wide">ID: {salon._id?.slice(-8)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-neutral-600">
                                                    <Mail size={12} className="text-neutral-300 shrink-0" />
                                                    <span className="text-xs font-medium truncate max-w-[180px]">{salon.email}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-neutral-600">
                                                    <Phone size={12} className="text-neutral-300 shrink-0" />
                                                    <span className="text-xs font-medium">{salon.phone || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                                                {(salon.salonOwnerProfile?.categories || []).slice(0, 3).map((cat, i) => (
                                                    <span key={i} className="px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded-md text-[9px] font-bold uppercase tracking-wider border border-neutral-200">
                                                        {cat}
                                                    </span>
                                                ))}
                                                {(salon.salonOwnerProfile?.categories || []).length > 3 && (
                                                    <div className="relative group/tooltip">
                                                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md text-[9px] font-black uppercase tracking-wider border border-emerald-100 cursor-help">
                                                            +{(salon.salonOwnerProfile?.categories || []).length - 3}
                                                        </span>
                                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-neutral-900 text-white text-[10px] rounded-xl opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl border border-neutral-800">
                                                            <div className="font-black uppercase tracking-widest mb-2 border-b border-white/10 pb-1 text-emerald-400">All Categories</div>
                                                            <div className="flex flex-wrap gap-1">
                                                                {salon.salonOwnerProfile.categories.map((cat, i) => (
                                                                    <span key={i} className="bg-white/10 px-1.5 py-0.5 rounded uppercase tracking-wider">{cat}</span>
                                                                ))}
                                                            </div>
                                                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-neutral-900" />
                                                        </div>
                                                    </div>
                                                )}
                                                {(salon.salonOwnerProfile?.categories || []).length === 0 && (
                                                    <span className="text-[10px] text-neutral-300 italic font-medium">None specified</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                {salon.salonOwnerProfile?.agentId ? (
                                                    <div className="flex items-center gap-2 px-2.5 py-1 bg-neutral-900 rounded-lg text-white border border-neutral-800 shadow-sm">
                                                        <Briefcase size={10} className="text-emerald-400 shrink-0" />
                                                        <span className="text-[10px] font-bold uppercase tracking-wider truncate max-w-[120px]">
                                                            {typeof salon.salonOwnerProfile.agentId === 'object'
                                                                ? `${salon.salonOwnerProfile.agentId.firstName} ${salon.salonOwnerProfile.agentId.lastName}`
                                                                : 'Active Agent'}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-[11px] font-medium text-neutral-300 italic">Unassigned</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <Select
                                                disabled={updatingStatusId === salon._id}
                                                value={salon.status}
                                                onValueChange={(value) => handleStatusUpdate(salon._id, value)}
                                            >
                                                <SelectTrigger className={cn(
                                                    "w-32 h-9 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                                                    statusOptions.find(opt => opt.value === salon.status)?.color || "bg-neutral-50 text-neutral-500"
                                                )}>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="bg-white border-neutral-100 rounded-xl shadow-xl">
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
                                        {/* <td className="px-6 py-5 text-right">
                                            <button
                                                onClick={() => {
                                                    setSelectedSalon(salon);
                                                    setIsAgentModalOpen(true);
                                                }}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-50 hover:bg-emerald-50 text-neutral-600 hover:text-emerald-700 rounded-lg border border-neutral-100 hover:border-emerald-200 transition-all text-[10px] font-bold uppercase tracking-wider group"
                                            >
                                                <UserPlus size={14} className="group-hover:scale-110 transition-transform" />
                                                Assign Agent
                                            </button>
                                        </td> */}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modals */}
            {/* {selectedSalon && (
                <AssignAgentModal
                    isOpen={isAgentModalOpen}
                    onClose={() => {
                        setIsAgentModalOpen(false);
                        setSelectedSalon(null);
                    }}
                    salon={selectedSalon}
                    onAssign={fetchSalons}
                />
            )} */}
        </div>
    );
}
