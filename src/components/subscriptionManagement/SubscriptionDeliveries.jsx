import React, { useState, useMemo } from 'react';
import { Search, Check, Truck, XCircle } from 'lucide-react';
import {
    mockSubscriptionDeliveries,
    mockUsers,
    mockProductVariants,
} from '../../lib/mockData';

export function SubscriptionDeliveries({ onSubscriptionClick }) {
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDeliveries, setSelectedDeliveries] = useState(new Set());
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    const filteredDeliveries = useMemo(() => {
        return mockSubscriptionDeliveries.filter(delivery => {
            if (statusFilter !== 'ALL' && delivery.status !== statusFilter) return false;
            if (
                searchQuery &&
                !delivery.subscription_no
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())
            )
                return false;
            return true;
        });
    }, [statusFilter, searchQuery]);

    const getStatusBadge = status => {
        const colors = {
            PROCESSING: 'bg-blue-100 text-blue-800',
            OUT_FOR_DELIVERY: 'bg-yellow-100 text-yellow-800',
            DELIVERED: 'bg-green-100 text-green-800',
            CANCELLED: 'bg-gray-100 text-gray-800',
            REJECTED: 'bg-red-100 text-red-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getUserName = userId =>
        mockUsers.find(u => u.id === userId)?.name || 'Unknown';

    const getProductVariantName = variantId =>
        mockProductVariants.find(v => v.id === variantId)?.name || 'Unknown';

    const toggleDeliverySelection = deliveryId => {
        const newSelected = new Set(selectedDeliveries);
        newSelected.has(deliveryId)
            ? newSelected.delete(deliveryId)
            : newSelected.add(deliveryId);
        setSelectedDeliveries(newSelected);
    };

    const toggleSelectAll = () => {
        if (selectedDeliveries.size === filteredDeliveries.length) {
            setSelectedDeliveries(new Set());
        } else {
            setSelectedDeliveries(new Set(filteredDeliveries.map(d => d.id)));
        }
    };

    const handleBulkAction = action => {
        if (action === 'rejected') {
            setShowRejectModal(true);
        } else {
            alert(
                `Marked ${selectedDeliveries.size} delivery/deliveries as ${action.replace(
                    '_',
                    ' ',
                )}`,
            );
            setSelectedDeliveries(new Set());
        }
    };

    const handleReject = () => {
        if (!rejectReason.trim()) {
            alert('Please provide a reason for rejection');
            return;
        }
        alert(
            `Rejected ${selectedDeliveries.size} delivery/deliveries. Reason: ${rejectReason}`,
        );
        setSelectedDeliveries(new Set());
        setShowRejectModal(false);
        setRejectReason('');
    };

    return (
        <div className="p-8">
            <div className="mb-6">
                <h1 className="text-3xl mb-2">Subscription Deliveries</h1>
                <p className="text-gray-600">Manage upcoming subscription deliveries</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm mb-2 text-gray-700">Status</label>
                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg"
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="PROCESSING">Processing</option>
                            <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                            <option value="DELIVERED">Delivered</option>
                            <option value="REJECTED">Rejected</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm mb-2 text-gray-700">
                            Subscription ID
                        </label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search subscription number..."
                                className="w-full pl-10 pr-3 py-2 border rounded-lg"
                            />
                        </div>
                    </div>
                </div>

                {selectedDeliveries.size > 0 && (
                    <div className="pt-4 border-t flex gap-2 flex-wrap">
                        <span className="text-sm text-gray-600">
                            {selectedDeliveries.size} selected:
                        </span>
                        <button
                            onClick={() => handleBulkAction('out_for_delivery')}
                            className="btn-yellow"
                        >
                            <Truck className="w-4 h-4" /> Out for Delivery
                        </button>
                        <button
                            onClick={() => handleBulkAction('delivered')}
                            className="btn-green"
                        >
                            <Check className="w-4 h-4" /> Delivered
                        </button>
                        <button
                            onClick={() => handleBulkAction('rejected')}
                            className="btn-red"
                        >
                            <XCircle className="w-4 h-4" /> Reject
                        </button>
                    </div>
                )}
            </div>

            {/* ✅ Responsive Table */}
            <div className="bg-white rounded-lg border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-[900px] w-full text-sm">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left">
                                    <input
                                        type="checkbox"
                                        checked={
                                            selectedDeliveries.size === filteredDeliveries.length &&
                                            filteredDeliveries.length > 0
                                        }
                                        onChange={toggleSelectAll}
                                    />
                                </th>
                                <th className="px-6 py-3 text-left">Subscription No</th>
                                <th className="px-6 py-3 text-left">Customer</th>
                                <th className="px-6 py-3 text-left">Product</th>
                                <th className="px-6 py-3 text-left">Delivery Date</th>
                                <th className="px-6 py-3 text-left">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredDeliveries.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 text-gray-500">
                                        No deliveries found
                                    </td>
                                </tr>
                            ) : (
                                filteredDeliveries.map(delivery => (
                                    <tr
                                        key={delivery.id}
                                        className={`hover:bg-gray-50 ${selectedDeliveries.has(delivery.id)
                                                ? 'bg-blue-50'
                                                : ''
                                            }`}
                                    >
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedDeliveries.has(delivery.id)}
                                                onChange={() =>
                                                    toggleDeliverySelection(delivery.id)
                                                }
                                            />
                                        </td>
                                        <td
                                            className="px-6 py-4 cursor-pointer text-blue-600 whitespace-nowrap"
                                            onClick={() =>
                                                onSubscriptionClick(delivery.subscription_id)
                                            }
                                        >
                                            {delivery.subscription_no}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getUserName(delivery.user_id)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getProductVariantName(
                                                delivery.product_variant_id,
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {new Date(
                                                delivery.delivery_date,
                                            ).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(
                                                    delivery.status,
                                                )}`}
                                            >
                                                {delivery.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg max-w-md w-full">
                        <h3 className="text-xl mb-4">Reject Deliveries</h3>
                        <textarea
                            value={rejectReason}
                            onChange={e => setRejectReason(e.target.value)}
                            className="w-full border rounded-lg p-2 mb-4"
                            rows={4}
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setShowRejectModal(false)}
                                className="px-4 py-2 border rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg"
                            >
                                Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
