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
    Copy
} from 'lucide-react';
import { userAPI, adminAPI } from '../../services/apiService';
import { useLoading } from '../../context/LoadingContext';
import StatCard from '../../components/admin/StatCard';
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

    const fetchAgents = async (search = searchTerm) => {
        try {
            setLoading(true);
            const res = await userAPI.getAll({ role: 'AGENT', search });
            setAgents(res.data.users || []);
        } catch (err) {
            console.error('Failed to fetch agents:', err);
            toast.error('Registry synchronization failed');
        } finally {
            setLoading(false);
            finishLoading();
        }
    };

    useEffect(() => {
        const delaySearch = setTimeout(() => {
            fetchAgents(searchTerm);
        }, 500);

        return () => clearTimeout(delaySearch);
    }, [searchTerm]);

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

    const filteredAgents = agents.filter(agent => {
        const matchesStatus = filterStatus === 'All' || agent.status === filterStatus;
        return matchesStatus;
    });

    const stats = {
        totalPaid: agents.reduce((sum, a) => sum + (a.agentProfile?.totalEarnings || 0), 0),
        activeCount: agents.filter(a => a.status === 'ACTIVE').length,
        growth: '+12%'
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
                    color="emerald"
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
                    color="emerald"
                />
            </div>

            {/* Agent Performance Table */}
            <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-neutral-50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-neutral-50/20">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
                        <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-widest">Agent Database</h2>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                        <div className="relative group min-w-[280px]">
                            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-emerald-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="SEARCH BY NAME, EMAIL, PHONE OR ADDRESS..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 h-10 bg-white border border-neutral-100 rounded-xl text-[10px] font-bold uppercase tracking-widest outline-none shadow-sm focus:border-emerald-500 transition-all placeholder:text-neutral-300"
                            />
                        </div>
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="w-32 h-10 bg-white border-neutral-100 rounded-xl text-[10px] font-bold uppercase tracking-widest">
                                <div className="flex items-center gap-2">
                                    <Filter size={12} className="text-neutral-400" />
                                    <SelectValue placeholder="STATUS" />
                                </div>
                            </SelectTrigger>
                            <SelectContent className="bg-white border-neutral-100 rounded-xl shadow-xl">
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

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-neutral-50/30">
                                <th className="px-6 py-4 text-[11px] font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-50">Agent</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-50">Contact</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-50">Monthly Earnings</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-50">Address</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-50">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-32 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                                            <p className="text-[10px] font-bold text-neutral-300 uppercase tracking-[0.2em] animate-pulse">Synchronizing Intelligence...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredAgents.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-24 text-center">
                                        <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <ShieldCheck size={32} className="text-neutral-200" />
                                        </div>
                                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">No matching agents found.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredAgents.map((agent) => (
                                    <tr key={agent._id} className="hover:bg-neutral-50/30 transition-all duration-200">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <Avatar className="w-10 h-10 border border-neutral-100">
                                                    <AvatarImage src={agent.avatarUrl} />
                                                    <AvatarFallback className="bg-emerald-50 text-emerald-700 text-xs font-black">
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
                                        <td className="px-6 py-5">
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
                                    </tr>
                                ))
                            )
                            }
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Registration Modal */}
            {showRegisterModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-[2px] animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-xl rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-neutral-100 flex flex-col max-h-[90vh]">
                        <div className="p-8 border-b border-neutral-50 flex items-center justify-between bg-neutral-50/30 shrink-0">
                            <div>
                                <h3 className="text-xl font-bold text-neutral-900 tracking-wide uppercase">Add New Agent</h3>
                                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1">Register a new agent executive</p>
                            </div>
                            <button
                                onClick={() => setShowRegisterModal(false)}
                                className="p-3 hover:bg-white rounded-xl transition-all shadow-sm active:scale-90 text-neutral-400 hover:text-neutral-900"
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
                                                className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-100 rounded-xl text-xs font-bold outline-none focus:border-emerald-500 transition-all placeholder:text-neutral-200"
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
                                                className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-100 rounded-xl text-xs font-bold outline-none focus:border-emerald-500 transition-all placeholder:text-neutral-200"
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
                                            className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-100 rounded-xl text-xs font-bold outline-none focus:border-emerald-500 transition-all placeholder:text-neutral-200"
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
                                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-xl text-xs font-bold outline-none focus:border-emerald-500 transition-all placeholder:text-neutral-200"
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
                                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-xl text-xs font-bold outline-none focus:border-emerald-500 transition-all placeholder:text-neutral-200"
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
                                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-xl text-xs font-bold outline-none focus:border-emerald-500 transition-all placeholder:text-neutral-200"
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
                                                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-xl text-xs font-bold outline-none focus:border-emerald-500 transition-all placeholder:text-neutral-200"
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
                                                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-xl text-xs font-bold outline-none focus:border-emerald-500 transition-all placeholder:text-neutral-200"
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
                                                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-xl text-xs font-bold outline-none focus:border-emerald-500 transition-all placeholder:text-neutral-200"
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
                                                className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-100 rounded-xl text-xs font-bold outline-none focus:border-emerald-500 transition-all placeholder:text-neutral-200"
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
                                                className="w-full pl-10 pr-10 py-3 bg-neutral-50 border border-neutral-100 rounded-xl text-xs font-bold outline-none focus:border-emerald-500 transition-all placeholder:text-neutral-200"
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
                                            className="px-4 py-2 bg-neutral-50 hover:bg-emerald-50 border border-neutral-100 hover:border-emerald-200 rounded-xl transition-all text-neutral-400 hover:text-emerald-600"
                                            title="Copy Password"
                                        >
                                            <Copy size={16} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={generatePassword}
                                            className="px-4 py-2 bg-neutral-50 hover:bg-emerald-50 border border-neutral-100 hover:border-emerald-200 rounded-xl transition-all text-neutral-400 hover:text-emerald-600"
                                            title="Generate Password"
                                        >
                                            <RefreshCcw size={16} />
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={regLoading}
                                    className="w-full py-4 bg-neutral-900 hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-[0.2em] rounded-xl transition-all shadow-xl shadow-neutral-900/10 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
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
        </div>
    );
}
