import React from 'react';
import { ArrowLeft } from 'lucide-react';
import {
    mockSubscriptions,
    mockUsers,
    mockAddresses,
    mockProductVariants,
} from '../../lib/mockData';

export function SubscriptionDetails({ subscriptionId, onBack }) {
    const subscription = mockSubscriptions.find(
        s => s.id === subscriptionId
    );

    const user = subscription
        ? mockUsers.find(u => u.id === subscription.user_id)
        : null;

    const defaultAddress = user
        ? mockAddresses.find(
            a => a.user_id === user.id && a.is_default
        )
        : null;

    const productVariant = subscription
        ? mockProductVariants.find(
            v => v.id === subscription.product_variant_id
        )
        : null;

    if (!subscription || !user) {
        return (
            <div className="p-8">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back
                </button>
                <div className="text-center text-gray-500">
                    Subscription not found
                </div>
            </div>
        );
    }

    const getStatusBadge = status => {
        const colors = {
            ACTIVE: 'bg-green-100 text-green-800',
            PAUSED: 'bg-yellow-100 text-yellow-800',
            CANCELLED: 'bg-red-100 text-red-800',
            EXPIRED: 'bg-gray-100 text-gray-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="p-8">
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
            >
                <ArrowLeft className="w-5 h-5" />
                Back to Subscriptions
            </button>

            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <h1 className="text-3xl">Subscription Details</h1>
                    <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${getStatusBadge(
                            subscription.current_status
                        )}`}
                    >
                        {subscription.current_status}
                    </span>
                </div>
                <p className="text-gray-600">
                    {subscription.subscription_no}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Customer Details */}
                <div className="bg-white rounded-lg border p-6">
                    <h3 className="text-sm text-gray-500 mb-4">
                        Customer Details
                    </h3>
                    <div className="space-y-2">
                        <div>
                            <p className="text-sm text-gray-600">Name</p>
                            <p className="text-gray-900">{user.name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Phone</p>
                            <p className="text-gray-900">
                                {user.phone_number}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">
                                Account Status
                            </p>
                            <p className="text-gray-900">
                                {user.is_active ? 'Active' : 'Inactive'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Delivery Details */}
                <div className="bg-white rounded-lg border p-6">
                    <h3 className="text-sm text-gray-500 mb-4">
                        Delivery Details
                    </h3>

                    {defaultAddress ? (
                        <div className="space-y-2">
                            <div>
                                <p className="text-sm text-gray-600">Address</p>
                                <p className="text-gray-900">
                                    {defaultAddress.name}
                                </p>
                                <p className="text-gray-600 text-sm">
                                    {defaultAddress.house}, {defaultAddress.street}
                                </p>
                                <p className="text-gray-600 text-sm">
                                    {defaultAddress.city}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-600">
                                    Preferred Time
                                </p>
                                <p className="text-gray-900">
                                    {subscription.preferred_time
                                        ? new Date(
                                            `2000-01-01T${subscription.preferred_time}`
                                        ).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })
                                        : 'Not specified'}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm">
                            No default address found
                        </p>
                    )}
                </div>

                {/* Subscription Details */}
                <div className="bg-white rounded-lg border p-6">
                    <h3 className="text-sm text-gray-500 mb-4">
                        Subscription Details
                    </h3>
                    <div className="space-y-2">
                        <div>
                            <p className="text-sm text-gray-600">Product</p>
                            <p className="text-gray-900">
                                {productVariant?.name || 'Unknown'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">
                                Price per Delivery
                            </p>
                            <p className="text-gray-900">
                                ${subscription.price_per_delivery.toFixed(2)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Start Date</p>
                            <p className="text-gray-900">
                                {new Date(
                                    subscription.start_date
                                ).toLocaleDateString()}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">
                                Payment Status
                            </p>
                            <p className="text-gray-900">
                                {subscription.payment_status}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">
                                Amount Paid
                            </p>
                            <p className="text-gray-900">
                                ${subscription.amount_paid.toFixed(2)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Product Information */}
            <div className="bg-white rounded-lg border p-6">
                <h3 className="text-sm text-gray-500 mb-4">
                    Product Information
                </h3>

                {productVariant && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <p className="text-sm text-gray-600">Product Name</p>
                            <p className="text-gray-900">
                                {productVariant.name}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Unit Quantity</p>
                            <p className="text-gray-900">
                                {productVariant.unit_quantity}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">
                                Regular Price
                            </p>
                            <p className="text-gray-900">
                                ${productVariant.price.toFixed(2)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Status</p>
                            <p className="text-gray-900">
                                {productVariant.is_active
                                    ? 'Active'
                                    : 'Inactive'}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
