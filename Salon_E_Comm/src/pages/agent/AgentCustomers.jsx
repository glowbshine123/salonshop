import React, { useState, useEffect } from 'react';
import {
    Users,
    Search,
    MapPin,
    Phone,
    Mail,
    Calendar,
    ChevronRight,
    ChevronLeft,
    Building2,
    Plus,
    Loader2,
    SearchX,
    MoreHorizontal,
    ExternalLink
} from 'lucide-react';
import { agentAPI } from '../../services/apiService';
import { useLoading } from '../../context/LoadingContext';
import { Button } from '../../components/ui/button';
import { cn } from '@/lib/utils';
import { Skeleton } from "@/components/ui/skeleton";
import SalonRegistrationModal from '../../components/agent/SalonRegistrationModal';

const TableRowSkeleton = ({ columns }) => (
    <tr className="animate-pulse border-b border-neutral-50 last:border-0">
        {Array.from({ length: columns }).map((_, i) => (
            <td key={i} className="px-6 py-4">
                <Skeleton className="h-4 w-24 bg-neutral-100" />
            </td>
        ))}
    </tr>
);

export default function AgentCustomers() {
    console.log('AgentCustomers: Rendering component'); // Debug log

    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { startLoading, finishLoading } = useLoading();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [error, setError] = useState(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const fetchCustomers = async () => {
        try {
            console.log('AgentCustomers: Fetching customers...');
            setLoading(true);
            setError(null);
            const res = await agentAPI.getSalons();
            console.log('AgentCustomers: API Response:', res.data); // Debug log

            let customersData = [];
            if (Array.isArray(res.data)) {
                customersData = res.data;
            } else if (res.data && Array.isArray(res.data.customers)) {
                customersData = res.data.customers;
            } else if (res.data && Array.isArray(res.data.salons)) { // Handle potential different response structure
                customersData = res.data.salons;
            } else {
                console.warn('AgentCustomers: Unexpected response structure, defaulting to empty array', res.data);
            }

            setCustomers(customersData);
        } catch (err) {
            console.error('AgentCustomers: Failed to fetch customers:', err);
            setError('Failed to load salon partners. Please try again later.');
        } finally {
            setLoading(false);
            finishLoading();
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    // Filter Logic with safety checks
    let filteredCustomers = [];
    try {
        filteredCustomers = customers.filter(customer => {
            if (!customer) return false;
            const term = (searchTerm || '').toLowerCase();
            const fullName = `${customer.firstName || ''} ${customer.lastName || ''}`.toLowerCase();
            const email = (customer.email || '').toLowerCase();
            const salonName = (customer.salonName || '').toLowerCase();

            return (
                fullName.includes(term) ||
                email.includes(term) ||
                salonName.includes(term)
            );
        });
        console.log(`AgentCustomers: Filtered ${filteredCustomers.length} from ${customers.length} customers`);
    } catch (filterErr) {
        console.error('AgentCustomers: Error filtering customers:', filterErr);
        // Fallback to empty if filter crashes
        filteredCustomers = [];
    }

    // Pagination Logic
    const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
    const paginatedCustomers = filteredCustomers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    if (error) {
        return (
            <div className="p-8 text-center">
                <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mx-auto mb-4">
                    <SearchX size={32} />
                </div>
                <h3 className="text-lg font-bold text-neutral-900">Something went wrong</h3>
                <p className="text-neutral-500 mt-2">{error}</p>
                <Button onClick={fetchCustomers} className="mt-4" variant="outline">Try Again</Button>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-20">
            {/* Header & Controls */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8">
                <div>
                    <h1 className="text-3xl font-black text-neutral-900 tracking-tighter uppercase leading-none">Salon <span className="text-emerald-600">Network</span></h1>
                    <p className="text-sm font-medium text-neutral-500 mt-2">Manage your portfolio of partner salons.</p>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-4">
                    <div className="relative group min-w-full md:min-w-[340px]">
                        <Search className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-emerald-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="SEARCH PARTNER OR SALON..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            className="w-full pl-12 pr-4 h-12 bg-white border border-neutral-100 rounded-2xl text-[10px] font-bold uppercase tracking-widest outline-none shadow-sm focus:border-emerald-500 transition-all placeholder:text-neutral-300"
                        />
                    </div>

                    <Button
                        onClick={() => setIsModalOpen(true)}
                        className="w-full md:w-auto h-12 px-6 bg-neutral-900 hover:bg-emerald-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] transition-all shadow-lg shadow-neutral-900/10 flex items-center justify-center gap-2"
                    >
                        <Plus size={16} />
                        Onboard Partner
                    </Button>
                </div>
            </div>

            {/* Table View */}
            <div className="bg-white rounded-[32px] border border-neutral-100 shadow-sm overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-neutral-50/30">
                                <th className="px-6 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] border-b border-neutral-50 whitespace-nowrap">Salon Identity</th>
                                <th className="px-6 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] border-b border-neutral-50 whitespace-nowrap">Primary Contact</th>
                                <th className="px-6 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] border-b border-neutral-50 whitespace-nowrap">Location</th>
                                <th className="px-6 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] border-b border-neutral-50 whitespace-nowrap text-center">Joined</th>
                                <th className="px-6 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] border-b border-neutral-50 whitespace-nowrap text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-50">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRowSkeleton key={i} columns={5} />
                                ))
                            ) : paginatedCustomers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-24 text-center">
                                        <div className="w-16 h-16 bg-neutral-50 rounded-2xl flex items-center justify-center text-neutral-200 mx-auto mb-6">
                                            <SearchX size={32} />
                                        </div>
                                        <p className="text-neutral-400 font-black uppercase tracking-widest text-[10px]">No partners found matching criteria.</p>
                                        <Button
                                            variant="link"
                                            onClick={() => setSearchTerm('')}
                                            className="text-emerald-600 font-black text-[10px] uppercase tracking-widest mt-2"
                                        >
                                            Reset Search
                                        </Button>
                                    </td>
                                </tr>
                            ) : (
                                paginatedCustomers.map((customer, index) => {
                                    // Safe render check
                                    if (!customer) return null;
                                    const safeId = customer._id || `temp-id-${index}`;

                                    return (
                                        <tr key={safeId} className="hover:bg-neutral-50/50 transition-colors group">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-400 font-bold text-xs uppercase group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                                        {(customer.salonName || 'S')[0]}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-black text-[11px] text-neutral-900 uppercase tracking-tight">{customer.salonName || 'Unknown Salon'}</span>
                                                        <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">ID: {safeId.slice(-6).toUpperCase()}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-[11px] text-neutral-900">{customer.firstName || '-'} {customer.lastName || '-'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-neutral-400">
                                                        <Mail size={10} />
                                                        <span className="text-[9px] font-bold uppercase tracking-widest truncate max-w-[150px]">{customer.email || 'No Email'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-neutral-400">
                                                        <Phone size={10} />
                                                        <span className="text-[9px] font-bold uppercase tracking-widest">{customer.shippingAddress?.phone || 'No Phone'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2 text-neutral-500">
                                                    <MapPin size={12} />
                                                    <span className="text-[10px] font-bold uppercase tracking-tight truncate max-w-[150px]">{customer.shippingAddress?.city || 'N/A'}, {customer.shippingAddress?.state || 'N/A'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <div className="flex items-center justify-center gap-2 text-neutral-500">
                                                    <Calendar size={12} />
                                                    <span className="text-[10px] font-bold uppercase tracking-tight">
                                                        {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : 'N/A'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <Button
                                                    variant="ghost"
                                                    className="h-8 px-3 text-[9px] font-black uppercase tracking-widest text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg"
                                                >
                                                    View Report <ExternalLink size={12} className="ml-1" />
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })
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
                                className="h-8 w-8 p-0 bg-white rounded-lg border-neutral-200"
                            >
                                <ChevronLeft size={14} />
                            </Button>
                            <Button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                variant="outline"
                                className="h-8 w-8 p-0 bg-white rounded-lg border-neutral-200"
                            >
                                <ChevronRight size={14} />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            <SalonRegistrationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    fetchCustomers();
                    setIsModalOpen(false);
                }}
            />
        </div>
    );
}
