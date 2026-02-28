import React, { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { X, Printer, Download, Hash, Calendar, ShieldCheck, Mail, Phone, MapPin, Package, IndianRupee } from 'lucide-react';
import { cn } from '@/lib/utils';

import { settingsAPI } from '@/utils/apiClient';

const OrderInvoiceModal = ({ isOpen, onClose, order }) => {
    const printRef = useRef(null);
    const [settings, setSettings] = useState(null);

    React.useEffect(() => {
        if (isOpen) {
            const fetchSettings = async () => {
                try {
                    const data = await settingsAPI.get();
                    setSettings(data);
                } catch (error) {
                    console.error('Failed to fetch settings:', error);
                }
            };
            fetchSettings();
        }
    }, [isOpen]);

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Invoice-${order?.orderNumber || order?._id}`,
        pageStyle: `
            @page { 
                size: A5; 
                margin: 5mm; 
            }
            @media print {
                html, body {
                    height: auto !important;
                    margin: 0 !important;
                    padding: 0 !important;
                }
                .page-footer {
                    position: fixed;
                    bottom: 0px;
                    left: 0;
                    right: 0;
                    text-align: center;
                    font-size: 7px;
                    color: #9ca3af;
                    padding: 5mm 0;
                    border-top: 0.2px solid #e5e7eb;
                    background: white;
                }
                .page-footer::after {
                    content: "Page " counter(page);
                }
                .print-container {
                    padding: 5mm;
                    padding-bottom: 20mm;
                }
            }
        `
    });

    if (!isOpen || !order) return null;

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    const fullAddress = [
        order.shippingAddress?.street || order.shippingAddress?.address,
        order.shippingAddress?.landmark,
        order.shippingAddress?.city,
        order.shippingAddress?.state,
        order.shippingAddress?.pincode || order.shippingAddress?.zip
    ].filter(Boolean).join(', ');

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-white w-full max-w-[148mm] rounded-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[95vh] border border-neutral-100">

                {/* Modal Header (Non-printable) */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 bg-white sticky top-0 z-20 print:hidden">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-emerald-50 rounded-md flex items-center justify-center text-emerald-600 border border-emerald-100">
                            <Package size={14} />
                        </div>
                        <h1 className="text-[10px] font-black uppercase tracking-widest text-neutral-900">Order Invoice</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-emerald-600 text-white rounded-md transition-all active:scale-95 shadow-lg shadow-neutral-900/10"
                        >
                            <Printer size={12} />
                            <span className="text-[8px] font-black uppercase tracking-widest leading-none">Print Invoice</span>
                        </button>
                        <button
                            onClick={onClose}
                            className="p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-50 rounded-md transition-all"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Printable Invoice Area (A5 Target) */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <div ref={printRef} className="bg-white print-container">
                        {/* Print Only Styling */}
                        <style>{`
                            @media print {
                                body { 
                                    -webkit-print-color-adjust: exact !important; 
                                    print-color-adjust: exact !important;
                                }
                                .rounded-xl, .rounded-lg, .rounded-md, .shadow-xl, .shadow-2xl, .shadow-sm {
                                    border-radius: 0 !important;
                                    box-shadow: none !important;
                                }
                                .no-break {
                                    page-break-inside: avoid;
                                }
                                .print-grid {
                                    display: grid !important;
                                    grid-template-cols: 1fr 1fr !important;
                                    gap: 1rem !important;
                                }
                            }
                        `}</style>

                        {/* Branding & ID */}
                        <div className="flex justify-between items-start mb-6">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    {settings?.logoUrl ? (
                                        <img src={settings.logoUrl} alt="Logo" className="w-8 h-8 rounded object-cover shadow-lg shrink-0" />
                                    ) : (
                                        <div className="w-8 h-8 bg-neutral-900 rounded flex items-center justify-center text-emerald-500 shadow-lg shrink-0">
                                            <ShieldCheck size={20} strokeWidth={2.5} />
                                        </div>
                                    )}
                                    <div className="flex flex-col">
                                        <span className="text-base font-black tracking-tighter text-neutral-900 uppercase leading-none">
                                            {settings?.appName || 'SalonEcom'}
                                        </span>
                                        <span className="text-[8px] font-bold text-emerald-600 uppercase tracking-widest">Premium Inventory</span>
                                    </div>
                                </div>
                                <div className="text-[10px] text-neutral-500 font-medium leading-relaxed">
                                    {settings?.address ? (
                                        <>
                                            <p>{settings.address.street}</p>
                                            <p>{settings.address.city}, {settings.address.state}</p>
                                        </>
                                    ) : (
                                        <>
                                            <p>Central Logistics Hub</p>
                                            <p>Sector 12, Business District</p>
                                        </>
                                    )}
                                    <p>{settings?.supportEmail || 'support@salonecom.pro'}</p>
                                </div>
                            </div>

                            <div className="text-right">
                                <h1 className="text-2xl font-black text-neutral-900 tracking-tighter uppercase mb-1">Invoice</h1>
                                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] uppercase leading-normal">
                                    <div className="font-bold text-neutral-400">Order ID:</div>
                                    <div className="font-black text-neutral-900">#{order.orderNumber?.split('-')[2] || order._id.slice(-6).toUpperCase()}</div>
                                    <div className="font-bold text-neutral-400">Date:</div>
                                    <div className="font-black text-neutral-900">{formatDate(order.createdAt)}</div>
                                    <div className="font-bold text-neutral-400">Payment:</div>
                                    <div className="font-black text-neutral-900 italic">{order.paymentMethod?.toUpperCase()}</div>
                                </div>
                            </div>
                        </div>

                        {/* Customer & Agent Details Section - Fixed Grid for Print */}
                        <div className="grid grid-cols-2 gap-4 py-5 border-y border-neutral-100 mb-6 no-break print-grid">
                            {/* Shipping Details */}
                            <div className="space-y-2">
                                <h4 className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Bill To / Ship To</h4>
                                <div>
                                    <p className="text-[12px] font-black text-neutral-900 uppercase">
                                        {order.customerId?.salonOwnerProfile?.salonName ? (
                                            <>
                                                {order.customerId.salonOwnerProfile.salonName}
                                                <span className="block text-[10px] text-neutral-500 font-bold mt-0.5">
                                                    ({order.customerId?.firstName || ''} {order.customerId?.lastName || ''})
                                                </span>
                                            </>
                                        ) : (
                                            order.shippingAddress?.name ||
                                            ((order.customerId?.firstName || order.customerId?.lastName) ?
                                                `${order.customerId?.firstName || ''} ${order.customerId?.lastName || ''}`.trim() :
                                                'Valued Customer')
                                        )}
                                    </p>
                                    <p className="text-[10px] text-neutral-500 font-medium leading-snug mt-1.5">
                                        {fullAddress}
                                    </p>
                                    <p className="text-[10px] font-black text-neutral-900 mt-1.5">
                                        Phone: {order.shippingAddress?.phone}
                                    </p>
                                </div>
                            </div>

                            {/* Agent Details */}
                            <div className="space-y-2 border-l border-neutral-50 pl-4">
                                <h4 className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Sales Representative</h4>
                                {order.agentId ? (
                                    <div>
                                        <p className="text-[12px] font-black text-emerald-600 uppercase">
                                            {((order.agentId?.firstName || order.agentId?.lastName) ?
                                                `${order.agentId?.firstName || ''} ${order.agentId?.lastName || ''}`.trim() :
                                                'Assigned Agent')}
                                        </p>
                                        <p className="text-[9px] text-neutral-400 font-bold uppercase mt-1.5 leading-relaxed">
                                            Assigned agent for this procurement protocol.
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-[10px] font-bold text-neutral-300 italic">Direct Purchase</p>
                                )}
                            </div>
                        </div>

                        {/* Order Items Table */}
                        <div className="mb-6">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-neutral-200">
                                        <th className="py-2.5 text-[9px] font-black text-neutral-400 uppercase tracking-widest">Product Details</th>
                                        <th className="py-2.5 text-[9px] font-black text-neutral-400 uppercase tracking-widest text-center">Price</th>
                                        <th className="py-2.5 text-[9px] font-black text-neutral-400 uppercase tracking-widest text-center">Qty</th>
                                        <th className="py-2.5 text-[9px] font-black text-neutral-400 uppercase tracking-widest text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100">
                                    {order.items?.map((item, idx) => (
                                        <tr key={idx}>
                                            <td className="py-2.5">
                                                <div className="flex flex-col">
                                                    <span className="text-[11px] font-black text-neutral-900 uppercase leading-normal">
                                                        {item.name || 'Product Asset'}
                                                        {item.productId?.weight && <span className="text-neutral-500 ml-2">({item.productId.weight})</span>}
                                                    </span>
                                                    {item.productId?.hsnCode && <span className="text-neutral-500 font-bold text-[10px]">HSN: {item.productId.hsnCode}</span>}
                                                    <span className="text-[10px] font-bold text-neutral-500 uppercase mt-0.5">
                                                        SKU: {item.productId?.sku || item.productId?.slice(-8) || 'N/A'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-2.5 text-center text-[10px] font-bold text-neutral-900">
                                                ₹{(item.priceAtPurchase || 0).toLocaleString()}
                                            </td>
                                            <td className="py-2.5 text-center text-[10px] font-bold text-neutral-900">
                                                {item.quantity}
                                            </td>
                                            <td className="py-2.5 text-right text-[11px] font-black text-neutral-900 italic">
                                                ₹{((item.priceAtPurchase || 0) * (item.quantity || 1)).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Financial Summary */}
                        <div className="flex justify-end pt-4 border-t border-neutral-200 no-break">
                            <div className="w-full max-w-[160px] space-y-1.5">
                                <div className="flex justify-between items-center text-[10px] uppercase font-bold text-neutral-400">
                                    <span>Subtotal</span>
                                    <span className="text-neutral-600 font-black tabular-nums">₹{(order.subtotal || 0).toLocaleString()}</span>
                                </div>
                                {order.tax > 0 && (
                                    <div className="flex justify-between items-center text-[10px] uppercase font-bold text-neutral-400">
                                        <span>GST (5%)</span>
                                        <span className="text-neutral-600 font-black tabular-nums">₹{(order.tax || 0).toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center text-[10px] uppercase font-bold text-neutral-400">
                                    <span>Shipping</span>
                                    <span className={cn("font-black", order.shippingCost === 0 ? "text-emerald-600" : "text-neutral-600")}>
                                        {order.shippingCost === 0 ? "FREE" : `₹${order.shippingCost}`}
                                    </span>
                                </div>
                                {order.pointsUsed > 0 && (
                                    <div className="flex justify-between items-center text-[10px] uppercase font-bold text-neutral-400">
                                        <span>Rewards Used</span>
                                        <span className="text-rose-600 font-black tabular-nums">-₹{(order.pointsUsed || 0).toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center pt-1.5 border-t border-neutral-100">
                                    <span className="text-[12px] font-black text-neutral-900 uppercase italic">Grand Total</span>
                                    <div className="flex items-center gap-0.5">
                                        <span className="text-[8px] font-black text-emerald-600">₹</span>
                                        <span className="text-xl font-black text-neutral-900 tracking-tighter tabular-nums leading-none">
                                            {(order.total || 0).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer (Pagination Target) */}
                        <div className="mt-8 pt-5 border-t border-neutral-100 text-[8px] text-neutral-400 uppercase font-black text-center tracking-widest opacity-60 no-break leading-relaxed">
                            <p>Computer Generated Invoice - Dynamic Verification Active</p>
                            <p className="mt-0.5">Thank you for your business with {settings?.appName || 'SalonEcom'}</p>
                        </div>

                        {/* Pagination Element (Print Only) */}
                        <div className="page-footer print:block hidden" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderInvoiceModal;
