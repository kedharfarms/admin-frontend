
export const unitOptions = [
    { label: 'Liter (ltr)', value: 'ltr' },
    { label: 'Kilogram (kg)', value: 'kg' },
];

export const getSubscriptionStatusBadge = (status) => {
    const colors = {
        ACTIVE: "bg-green-100 text-green-800",
        PAYMENT_PENDING: "bg-yellow-100 text-yellow-800",
        CANCELLED: "bg-red-100 text-red-800",
        EXPIRED: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
};
export const getOrderStatusBadge = (status) => {
    const colors = {
        DELIVERED: "bg-green-100 text-green-800",
        CANCELLED: "bg-gray-100 text-gray-800",
        REJECTED: "bg-red-100 text-red-800",
        PROCESSING: "bg-blue-100 text-blue-800",
        OUT_FOR_DELIVERY: "bg-yellow-100 text-yellow-800",
    };

    return colors[status] || "bg-gray-100 text-gray-800";
};

export const ORDER_STATUS = {
    PAYMENT_PENDING: 'PAYMENT_PENDING',
    PAYMENT_INITIATED: 'PAYMENT_INITIATED',
    PROCESSING: 'PROCESSING',
    OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
    DELIVERED: 'DELIVERED',
    REJECTED: 'REJECTED',
    CANCELLED: 'CANCELLED',
    EXPIRED: 'EXPIRED',
};
