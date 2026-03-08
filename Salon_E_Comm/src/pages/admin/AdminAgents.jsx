import React, { useState, useEffect } from 'react';
import {
    Users,
    DollarSign,
    TrendingUp,
    Award,
    MessageSquare,
    FileText,
    Search,
    Filter,
    Loader2,
    ChevronRight,
    Plus,
    X,
    MessageCircle,
    CreditCard,
    Smartphone,
    AlertCircle,
    Calendar,
    Send,
    CheckCircle,
    Mail,
    Phone,
    User as UserIcon,
    Lock,
    IndianRupee,
    Briefcase,
    ShieldCheck,
    ArrowUpRight,
    ChevronDown,
    UserPlus,
    MapPin,
    Eye,
    EyeOff,
    RefreshCcw,
    Copy,
    ChevronLeft,
    SearchX
} from 'lucide-react';
import { userAPI, adminAPI } from '../../services/apiService';
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
import { Button } from '@/components/ui/button';

export default function AdminAgents() {
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const { startLoading, finishLoading } = useLoading();
    const [updatingStatusId, setUpdatingStatusId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);

    // Registration Modal State
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [regLoading, setRegLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [regData, setRegData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        panCard: '',
        aadharCard: '',
        address: {
            street: '',
            city: '',
            state: '',
            zip: '',
            country: 'India'
        }
    });

    // Payout Modal State
    const [showSettlementModal, setShowSettlementModal] = useState(false);
    const [selectedAgentForPayout, setSelectedAgentForPayout] = useState(null);
    const [payoutData, setPayoutData] = useState({
        transactionId: '',
        payoutMethod: 'upi',
        notes: '',
        status: 'pending'
    });
    const [payoutLoading, setPayoutLoading] = useState(false);

    const generatePassword = () => {
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
        let password = "";
        for (let i = 0; i < 12; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setRegData(prev => ({ ...prev, password }));
        setShowPassword(true);
    };

    const copyToClipboard = () => {
        if (!regData.password) {
            toast.error('No password to copy');
            return;
        }
        navigator.clipboard.writeText(regData.password);
        toast.success('Password copied to clipboard');
    };

    const fetchAgents = async () => {
        try {
            setLoading(true);
            const params = {
                role: 'AGENT',
                search: searchTerm,
                status: filterStatus !== 'All' ? filterStatus : undefined,
                page: currentPage,
                limit: 10
            };
            const res = await userAPI.getAll(params);

            if (res.data.users) {
                setAgents(res.data.users);
                setTotalPages(res.data.pagination?.pages || 1);
                setTotalResults(res.data.pagination?.total || res.data.users.length);
            } else {
                setAgents(res.data || []);
                setTotalPages(1);
                setTotalResults(Array.isArray(res.data) ? res.data.length : 0);
            }
        } catch (err) {
            console.error('Failed to fetch agents:', err);
            toast.error('Agent registry synchronization failed');
        } finally {
            setLoading(false);
            finishLoading();
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchAgents();
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm, filterStatus, currentPage]);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterStatus]);

    const handleRegisterAgent = async (e) => {
        e.preventDefault();
        setRegLoading(true);
        try {
            await adminAPI.createAgent(regData);
            toast.success('Agent Executive created successfully!');
            setShowRegisterModal(false);
            setRegData({
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                password: '',
                panCard: '',
                aadharCard: '',
                address: {
                    street: '',
                    city: '',
                    state: '',
                    zip: '',
                    country: 'India'
                }
            });
            fetchAgents(); // Refresh list
        } catch (error) {
            toast.error(error.response?.data?.message || 'Creation failed');
        } finally {
            setRegLoading(false);
        }
    };

    const handleStatusUpdate = async (agentId, newStatus) => {
        try {
            setUpdatingStatusId(agentId);
            await userAPI.updateStatus(agentId, newStatus);
            toast.success(`Agent status updated to ${newStatus}`);
            // Update local state
            setAgents(agents.map(a => a._id === agentId ? { ...a, status: newStatus } : a));
        } catch (err) {
            console.error('Failed to update agent status:', err);
            toast.error('Status override failed');
        } finally {
            setUpdatingStatusId(null);
        }
    };

    const openPayoutModal = (agent) => {
        setSelectedAgentForPayout(agent);
        setPayoutData({
            transactionId: '',
            payoutMethod: 'upi',
            notes: '',
            status: 'pending'
        });
        setShowSettlementModal(true);
    };

    const handleProcessPayout = async (e) => {
        e.preventDefault();
        if (!selectedAgentForPayout) return;

        setPayoutLoading(true);
        try {
            const now = new Date();
            const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

            await adminAPI.createSettlement({
                agentId: selectedAgentForPayout._id,
                amount: selectedAgentForPayout.agentProfile?.currentMonthEarnings || 0,
                month: month,
                ...payoutData
            });

            toast.success('Payout settlement recorded successfully!');
            setShowSettlementModal(false);
            fetchAgents(); // Refresh to see updated earnings and last settlement date
        } catch (error) {
            toast.error(error.response?.data?.message || 'Payout settlement failed');
        } finally {
            setPayoutLoading(false);
        }
    };

    // Redundant local filtering removed

    const stats = {
        totalPaid: agents.reduce((sum, a) => sum + (a.agentProfile?.totalEarnings || 0), 0),
        activeCount: agents.filter(a => a.status === 'ACTIVE').length,
        growth: '+12%'
    };

    const statusOptions = [
        { value: 'PENDING', label: 'Pending', color: 'text-amber-600 bg-amber-50' },
        { value: 'ACTIVE', label: 'Active', color: 'text-primary bg-primary/10' },
        { value: 'REJECTED', label: 'Rejected', color: 'text-rose-600 bg-rose-50' },
        { value: 'DEACTIVE', label: 'Deactive', color: 'text-neutral-500 bg-neutral-50' },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-neutral-900 tracking-wide">Agent Registry</h1>
                    <p className="text-base font-bold text-neutral-400 tracking-wide mt-1">Manage and monitor agent performance</p>
                </div>
                <Button
                    onClick={() => setShowRegisterModal(true)}
                >
                    <UserPlus size={18} className="group-hover:rotate-12 transition-transform" />
                    Add Agent
                </Button>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Gross Payout"
                    value={`₹${stats.totalPaid.toLocaleString()}`}
                    icon={IndianRupee}
                    color="pink"
                />
                <StatCard
                    title="Active Agents"
                    value={stats.activeCount}
                    icon={Briefcase}
                    color="neutral"
                />
                <StatCard
                    title="Growth"
                    value={stats.growth}
                    icon={TrendingUp}
                    color="pink"
                />
            </div>

            {/* Agent Performance Table */}
            <div className="bg-white rounded-lg border border-neutral-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-neutral-50 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-neutral-50/20">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                        <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-widest">Agent Database</h2>
                    </div>
                    <div className="flex flex-col lg:flex-row lg:items-center gap-3 w-full lg:w-auto">
                        <div className="relative group w-full lg:w-72">
                            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="SEARCH BY NAME, EMAIL, PHONE OR ADDRESS..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 h-10 bg-white border border-neutral-100 rounded-md text-[10px] font-bold uppercase tracking-widest outline-none shadow-sm focus:border-primary transition-all placeholder:text-neutral-300"
                            />
                        </div>
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="w-32 h-10 bg-white border-neutral-100 rounded-md text-[10px] font-bold uppercase tracking-widest">
                                <div className="flex items-center gap-2">
                                    <Filter size={12} className="text-neutral-400" />
                                    <SelectValue placeholder="STATUS" />
                                </div>
                            </SelectTrigger>
                            <SelectContent className="bg-white border-neutral-100 rounded-md shadow-xl">
                                <SelectItem value="All" className="text-[10px] font-bold uppercase tracking-widest cursor-pointer">ALL STATUS</SelectItem>
                                {statusOptions.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value} className="text-[10px] font-bold uppercase tracking-widest cursor-pointer">
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="bg-neutral-50/30 font-black uppercase tracking-widest">
                                <th className="px-6 py-4 text-[11px] font-black text-neutral-400 uppercase tracking-widest border-b border-neutral-50 whitespace-nowrap">Agent</th>
                                <th className="px-6 py-4 text-[11px] font-black text-neutral-400 uppercase tracking-widest border-b border-neutral-50 whitespace-nowrap">Contact</th>
                                <th className="px-6 py-4 text-[11px] font-black text-neutral-400 uppercase tracking-widest border-b border-neutral-50 whitespace-nowrap">Monthly Earnings</th>
                                <th className="px-6 py-4 text-[11px] font-black text-neutral-400 uppercase tracking-widest border-b border-neutral-50 whitespace-nowrap">Address</th>
                                <th className="px-6 py-4 text-[11px] font-black text-neutral-400 uppercase tracking-widest border-b border-neutral-50 text-center whitespace-nowrap">Last Settlement</th>
                                <th className="px-6 py-4 text-[11px] font-black text-neutral-400 uppercase tracking-widest border-b border-neutral-50 text-center whitespace-nowrap">Status</th>
                                <th className="px-6 py-4 text-[11px] font-black text-neutral-400 uppercase tracking-widest border-b border-neutral-50 text-right whitespace-nowrap">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-32 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <Loader2 className="w-10 h-10 text-primary animate-spin" />
                                            <p className="text-[10px] font-bold text-neutral-300 uppercase tracking-[0.2em] animate-pulse">Synchronizing Intelligence...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : agents.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-24 text-center">
                                        <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <ShieldCheck size={32} className="text-neutral-200" />
                                        </div>
                                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">No matching agents found.</p>
                                    </td>
                                </tr>
                            ) : (
                                agents.map((agent) => (
                                    <tr key={agent._id} className="hover:bg-neutral-50/30 transition-all duration-200">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <Avatar className="w-10 h-10 border border-neutral-100">
                                                    <AvatarImage src={agent.avatarUrl} />
                                                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-black">
                                                        {agent.firstName?.[0]}{agent.lastName?.[0]}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-neutral-900 leading-tight">{agent.firstName} {agent.lastName}</span>
                                                    <div className="flex items-center gap-1.5 mt-0.5 text-neutral-400">
                                                        <span className="text-[10px] uppercase font-medium tracking-wide">ID: {agent._id?.slice(-8)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-neutral-600">
                                                    <Mail size={12} className="text-neutral-300 shrink-0" />
                                                    <span className="text-xs font-medium truncate max-w-[150px]">{agent.email}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-neutral-600">
                                                    <Phone size={12} className="text-neutral-300 shrink-0" />
                                                    <span className="text-xs font-medium">{agent.phone || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-neutral-900 tracking-tighter">₹{(agent.agentProfile?.currentMonthEarnings || 0).toLocaleString()}</span>
                                                <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">Current Month</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-start gap-2 max-w-[200px]">
                                                <MapPin size={12} className="text-neutral-300 mt-0.5 shrink-0" />
                                                <span className="text-[11px] text-neutral-600 leading-relaxed italic">
                                                    {agent.agentProfile?.address ? (
                                                        `${agent.agentProfile.address.street || ''}, ${agent.agentProfile.address.city || ''}, ${agent.agentProfile.address.state || ''} ${agent.agentProfile.address.zip || ''}`
                                                    ) : 'NO ADDRESS PROVIDED'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-neutral-900 leading-tight">
                                                    {agent.agentProfile?.lastSettlementDate
                                                        ? new Date(agent.agentProfile.lastSettlementDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                                                        : 'NEVER'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex justify-center">
                                                <Select
                                                    disabled={updatingStatusId === agent._id}
                                                    value={agent.status}
                                                    onValueChange={(value) => handleStatusUpdate(agent._id, value)}
                                                >
                                                    <SelectTrigger className={cn(
                                                        "w-32 h-9 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                                                        statusOptions.find(opt => opt.value === agent.status)?.color || "bg-neutral-50 text-neutral-500"
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
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 rounded-lg border-primary-muted hover:bg-primary/5 text-primary font-bold text-[9px] uppercase tracking-widest"
                                                onClick={() => openPayoutModal(agent)}
                                            >
                                                Trigger Payout
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )
                            }
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

            {/* Registration Modal */}
            {showRegisterModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-[2px] animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-xl rounded-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-neutral-100 flex flex-col max-h-[90vh]">
                        <div className="p-8 border-b border-neutral-50 flex items-center justify-between bg-neutral-50/30 shrink-0">
                            <div>
                                <h3 className="text-xl font-bold text-neutral-900 tracking-wide uppercase">Add New Agent</h3>
                                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1">Register a new agent executive</p>
                            </div>
                            <button
                                onClick={() => setShowRegisterModal(false)}
                                className="p-3 hover:bg-white rounded-md transition-all shadow-sm active:scale-90 text-neutral-400 hover:text-neutral-900"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
                            <form onSubmit={handleRegisterAgent} className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest ml-1">First Name</label>
                                        <div className="relative">
                                            <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-300" size={14} />
                                            <input
                                                type="text"
                                                required
                                                placeholder="Jane"
                                                className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-100 rounded-md text-xs font-bold outline-none focus:border-primary transition-all placeholder:text-neutral-200"
                                                value={regData.firstName}
                                                onChange={e => setRegData({ ...regData, firstName: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Last Name</label>
                                        <div className="relative">
                                            <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-300" size={14} />
                                            <input
                                                type="text"
                                                required
                                                placeholder="Doe"
                                                className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-100 rounded-md text-xs font-bold outline-none focus:border-primary transition-all placeholder:text-neutral-200"
                                                value={regData.lastName}
                                                onChange={e => setRegData({ ...regData, lastName: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-300" size={14} />
                                        <input
                                            type="email"
                                            required
                                            placeholder="agent@salon.com"
                                            className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-100 rounded-md text-xs font-bold outline-none focus:border-primary transition-all placeholder:text-neutral-200"
                                            value={regData.email}
                                            onChange={e => setRegData({ ...regData, email: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest ml-1">PAN Card</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="ABCDE1234F"
                                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-md text-xs font-bold outline-none focus:border-primary transition-all placeholder:text-neutral-200"
                                            value={regData.panCard}
                                            onChange={e => setRegData({ ...regData, panCard: e.target.value.toUpperCase() })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Aadhar Card</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="1234 5678 9012"
                                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-md text-xs font-bold outline-none focus:border-primary transition-all placeholder:text-neutral-200"
                                            value={regData.aadharCard}
                                            onChange={e => setRegData({ ...regData, aadharCard: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4 pt-2 border-t border-neutral-50">
                                    <label className="text-[10px] font-black text-neutral-900 uppercase tracking-widest block">Address Details</label>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Street Address</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Flat/House No, Building, Street"
                                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-md text-xs font-bold outline-none focus:border-primary transition-all placeholder:text-neutral-200"
                                            value={regData.address.street}
                                            onChange={e => setRegData({ ...regData, address: { ...regData.address, street: e.target.value } })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest ml-1">City</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="City"
                                                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-md text-xs font-bold outline-none focus:border-primary transition-all placeholder:text-neutral-200"
                                                value={regData.address.city}
                                                onChange={e => setRegData({ ...regData, address: { ...regData.address, city: e.target.value } })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest ml-1">State</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="State"
                                                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-md text-xs font-bold outline-none focus:border-primary transition-all placeholder:text-neutral-200"
                                                value={regData.address.state}
                                                onChange={e => setRegData({ ...regData, address: { ...regData.address, state: e.target.value } })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Zip Code</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="Zip"
                                                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-md text-xs font-bold outline-none focus:border-primary transition-all placeholder:text-neutral-200"
                                                value={regData.address.zip}
                                                onChange={e => setRegData({ ...regData, address: { ...regData.address, zip: e.target.value } })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-neutral-50">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Phone Number</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-300" size={14} />
                                            <input
                                                type="tel"
                                                required
                                                placeholder="+91..."
                                                className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-100 rounded-md text-xs font-bold outline-none focus:border-primary transition-all placeholder:text-neutral-200"
                                                value={regData.phone}
                                                onChange={e => setRegData({ ...regData, phone: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Password</label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-300" size={14} />
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                required
                                                minLength={6}
                                                placeholder="••••••••"
                                                className="w-full pl-10 pr-10 py-3 bg-neutral-50 border border-neutral-100 rounded-md text-xs font-bold outline-none focus:border-primary transition-all placeholder:text-neutral-200"
                                                value={regData.password}
                                                onChange={e => setRegData({ ...regData, password: e.target.value })}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-300 hover:text-neutral-500 transition-colors"
                                            >
                                                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                            </button>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={copyToClipboard}
                                            className="px-4 py-2 bg-neutral-50 hover:bg-primary/10 border border-neutral-100 hover:border-primary/20 rounded-md transition-all text-neutral-400 hover:text-primary"
                                            title="Copy Password"
                                        >
                                            <Copy size={16} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={generatePassword}
                                            className="px-4 py-2 bg-neutral-50 hover:bg-primary/10 border border-neutral-100 hover:border-primary/20 rounded-md transition-all text-neutral-400 hover:text-primary"
                                            title="Generate Password"
                                        >
                                            <RefreshCcw size={16} />
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={regLoading}
                                    className="w-full py-4 bg-neutral-900 hover:bg-primary text-white font-bold text-xs uppercase tracking-[0.2em] rounded-md transition-all shadow-xl shadow-neutral-900/10 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                                >
                                    {regLoading ? <Loader2 className="animate-spin" size={16} /> : (
                                        <>
                                            SAVE AGENT
                                            <ArrowUpRight size={16} />
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            {/* Settlement Modal */}
            {showSettlementModal && selectedAgentForPayout && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-4xl rounded-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-neutral-100 flex flex-col max-h-[90vh]">
                        <div className="p-8 border-b border-neutral-50 flex items-center justify-between bg-neutral-50/30">
                            <div>
                                <h3 className="text-xl font-black text-neutral-900 tracking-tighter uppercase">Settle Commission</h3>
                                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1">Manual Payout Clearance Protocol</p>
                            </div>
                            <button
                                onClick={() => setShowSettlementModal(false)}
                                className="p-3 hover:bg-neutral-100 rounded-md transition-all shadow-sm active:scale-90 text-neutral-400 hover:text-neutral-900"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-0 scrollbar-hide flex flex-col md:flex-row">
                            {/* Left Section: Agent Data */}
                            <div className="flex-1 p-8 border-r border-neutral-50 bg-neutral-50/20">
                                <div className="space-y-8">
                                    <div className="flex items-center gap-5 pb-6 border-b border-neutral-100">
                                        <Avatar className="w-20 h-20 border-4 border-white shadow-xl ring-primary/10">
                                            <AvatarImage src={selectedAgentForPayout.avatarUrl} />
                                            <AvatarFallback className="bg-primary text-white text-2xl font-black italic">
                                                {selectedAgentForPayout.firstName?.[0]}{selectedAgentForPayout.lastName?.[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h4 className="text-2xl font-black text-neutral-900 tracking-tighter uppercase leading-none">
                                                {selectedAgentForPayout.firstName} {selectedAgentForPayout.lastName}
                                            </h4>
                                            <p className="text-xs font-bold text-neutral-400 mt-2 uppercase tracking-wider">{selectedAgentForPayout.email}</p>
                                            <p className="text-[10px] font-black text-primary mt-1 uppercase tracking-widest flex items-center gap-1">
                                                <Phone size={10} className="inline" /> {selectedAgentForPayout.phone || 'N/A'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h5 className="text-[11px] font-black text-neutral-900 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <CreditCard size={14} className="text-primary" />
                                            Bank & Payment Details
                                        </h5>

                                        {!selectedAgentForPayout.agentProfile?.bankDetails?.accountNumber && !selectedAgentForPayout.agentProfile?.upiId ? (
                                            <div className="p-6 bg-red-50 border border-red-100 rounded-lg flex flex-col items-center text-center gap-3 animate-pulse">
                                                <AlertCircle className="text-red-500" size={32} />
                                                <p className="text-[11px] font-bold text-red-600 uppercase tracking-widest leading-relaxed">
                                                    Agent hasn't added bank details.<br />
                                                    Please notify to provide clearance data.
                                                </p>
                                                <Button size="sm" variant="outline" className="h-8 border-red-200 text-red-600 hover:bg-red-100 text-[9px] font-black uppercase tracking-widest">
                                                    <Send size={10} className="mr-2" /> Notify Agent
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 gap-3">
                                                {selectedAgentForPayout.agentProfile?.bankDetails?.accountNumber && (
                                                    <div className="p-5 bg-white border border-neutral-100 rounded-2xl shadow-sm space-y-2">
                                                        <p className="text-[9px] font-black text-neutral-400 uppercase tracking-[0.2em]">Bank Transfer</p>
                                                        <div className="space-y-1">
                                                            <div className="flex justify-between">
                                                                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Bank:</span>
                                                                <span className="text-[11px] font-black text-neutral-900 uppercase">{selectedAgentForPayout.agentProfile.bankDetails.bankName}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">A/C:</span>
                                                                <span className="text-[11px] font-black text-primary tabular-nums">{selectedAgentForPayout.agentProfile.bankDetails.accountNumber}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">IFSC:</span>
                                                                <span className="text-[11px] font-black text-neutral-900 uppercase">{selectedAgentForPayout.agentProfile.bankDetails.ifscCode}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                                {selectedAgentForPayout.agentProfile?.upiId && (
                                                    <div className="p-5 bg-white border border-neutral-100 rounded-2xl shadow-sm space-y-2">
                                                        <p className="text-[9px] font-black text-neutral-400 uppercase tracking-[0.2em]">UPI Payment</p>
                                                        <div className="flex items-center gap-3">
                                                            <Smartphone size={16} className="text-primary" />
                                                            <span className="text-[11px] font-black text-neutral-900 tracking-widest uppercase">{selectedAgentForPayout.agentProfile.upiId}</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-7 bg-primary rounded-lg text-white shadow-xl shadow-primary/20 group relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/20 transition-all"></div>
                                        <p className="text-[10px] font-black text-primary-muted/70 uppercase tracking-[0.2em] mb-2">Unsettled Commissions</p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-xs font-bold text-primary-muted/70">₹</span>
                                            <h4 className="text-4xl font-black tracking-tighter leading-none italic">
                                                {(selectedAgentForPayout.agentProfile?.currentMonthEarnings || 0).toLocaleString()}
                                            </h4>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Section: Input Form */}
                            <div className="flex-1 p-8 bg-white">
                                <form onSubmit={handleProcessPayout} className="space-y-6">
                                    <div className="space-y-4">
                                        <h5 className="text-[11px] font-black text-neutral-900 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <CheckCircle size={14} className="text-primary" />
                                            Clearance Data
                                        </h5>

                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest ml-1">Transaction ID</label>
                                            <div className="relative group/input">
                                                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within/input:text-primary transition-colors" size={14} />
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="UTR / REF NO..."
                                                    className="w-full pl-11 pr-4 py-3.5 bg-neutral-50 border border-neutral-100 rounded-md text-xs font-bold outline-none focus:border-primary focus:bg-white transition-all placeholder:text-neutral-200 shadow-sm"
                                                    value={payoutData.transactionId}
                                                    onChange={e => setPayoutData({ ...payoutData, transactionId: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest ml-1">Payout Method</label>
                                                <Select value={payoutData.payoutMethod} onValueChange={(v) => setPayoutData({ ...payoutData, payoutMethod: v })}>
                                                    <SelectTrigger className="h-12 bg-neutral-50 border-neutral-100 rounded-md text-[10px] font-black uppercase tracking-widest">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-white border-neutral-100 rounded-xl shadow-xl">
                                                        <SelectItem value="upi" className="text-[10px] font-black uppercase tracking-widest">UPI</SelectItem>
                                                        <SelectItem value="gpay" className="text-[10px] font-black uppercase tracking-widest">GPay</SelectItem>
                                                        <SelectItem value="bank_transfer" className="text-[10px] font-black uppercase tracking-widest">Bank Transfer</SelectItem>
                                                        <SelectItem value="other" className="text-[10px] font-black uppercase tracking-widest">Other</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest ml-1">Current Status</label>
                                                <Select value={payoutData.status} onValueChange={(v) => setPayoutData({ ...payoutData, status: v })}>
                                                    <SelectTrigger className={cn(
                                                        "h-12 border-neutral-100 rounded-md text-[10px] font-black uppercase tracking-widest",
                                                        payoutData.status === 'paid' ? "bg-primary/10 text-primary" : "bg-amber-50 text-amber-600"
                                                    )}>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-white border-neutral-100 rounded-xl shadow-xl">
                                                        <SelectItem value="pending" className="text-[10px] font-black uppercase tracking-widest">Pending</SelectItem>
                                                        <SelectItem value="processing" className="text-[10px] font-black uppercase tracking-widest">Processing</SelectItem>
                                                        <SelectItem value="paid" className="text-[10px] font-black uppercase tracking-widest">Paid</SelectItem>
                                                        <SelectItem value="cancelled" className="text-[10px] font-black uppercase tracking-widest">Cancelled</SelectItem>
                                                        <SelectItem value="rejected" className="text-[10px] font-black uppercase tracking-widest">Rejected</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest ml-1">Internal Notes</label>
                                            <textarea
                                                rows="3"
                                                placeholder="ADD CLEARANCE NOTES..."
                                                className="w-full px-4 py-3.5 bg-neutral-50 border border-neutral-100 rounded-md text-xs font-bold outline-none focus:border-primary focus:bg-white transition-all placeholder:text-neutral-200 resize-none shadow-sm"
                                                value={payoutData.notes}
                                                onChange={e => setPayoutData({ ...payoutData, notes: e.target.value })}
                                            />
                                        </div>

                                        <div className="p-5 bg-neutral-50 rounded-md border border-neutral-100 flex items-center justify-between">
                                            <div className="flex items-center gap-3 text-neutral-400">
                                                <Calendar size={14} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Timestamp</span>
                                            </div>
                                            <span className="text-[11px] font-black text-neutral-900 tabular-nums">
                                                {new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).toUpperCase()}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={payoutLoading}
                                        className="w-full py-4.5 bg-neutral-900 hover:bg-primary text-white font-black text-xs uppercase tracking-[0.2em] rounded-md transition-all shadow-xl shadow-neutral-900/10 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 group"
                                    >
                                        {payoutLoading ? <Loader2 className="animate-spin" size={16} /> : (
                                            <>
                                                PROCEED PAYOUT CLEARANCE
                                                <ArrowUpRight size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
