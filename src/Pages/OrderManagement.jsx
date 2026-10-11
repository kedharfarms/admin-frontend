import { useState, useEffect, useRef } from "react";
import { Plus, Search, Trash2, X } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { CloseOutlined } from '@ant-design/icons';

import Pagination from "../components/common/Pagination";
import DateFilter from "../components/common/DateFilter";
import { formatISTTime } from "../utils/utils";
import { DELIVERY_TYPES, getOrderStatusBadge } from "../constants/commonConstants";

export function OrdersView() {
    const BASE_URL = process.env.REACT_APP_API_URL;
    const token = localStorage.getItem("token");

    const [orders, setOrders] = useState([]);
    const [orderSource, setOrderSource] = useState("ONLINE");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [searchQuery, setSearchQuery] = useState("");
    const [userOptions, setUserOptions] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState("");

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const [isLoading, setIsLoading] = useState(false);
    const [offlineVariants, setOfflineVariants] = useState([]);
    const [isLoadingOfflineVariants, setIsLoadingOfflineVariants] = useState(false);
    const [selectedVariantId, setSelectedVariantId] = useState("");
    const [offlineItems, setOfflineItems] = useState([]);
    const [offlinePaymentMethod, setOfflinePaymentMethod] = useState("CASH");
    const [offlineAmountPaidInput, setOfflineAmountPaidInput] = useState("");
    const [isOfflineModalOpen, setIsOfflineModalOpen] = useState(false);
    const [isCreatingOfflineOrder, setIsCreatingOfflineOrder] = useState(false);
    const navigate = useNavigate();

    const dateFilterRef = useRef();

    const fetchOrders = async () => {
        if (isLoading) return;

        try {
            setIsLoading(true);

            const res = await axios({
                method: "GET",
                url: `${BASE_URL}/order-management`,
                headers: { Authorization: token },
                params: {
                    page: currentPage,
                    page_size: pageSize,
                    search: searchQuery,
                    status:
                        statusFilter !== "ALL"
                            ? statusFilter
                            : undefined,
                    start_date: startDate,
                    end_date: endDate,
                    order_source: orderSource,
                    ...(selectedUserId ? { user_id: selectedUserId } : {}),
                },
            });

            const data = res?.data?.data;

            setOrders(data?.data || []);
            setTotalPages(data?.total_pages || 1);
            setTotalRecords(data?.total_records || 0);

        } catch (error) {
            const message =
                error?.response?.data?.message || error.message;
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchOrders();
        }, 400);

        return () => clearTimeout(timer);
    }, [currentPage, searchQuery, selectedUserId, statusFilter, startDate, endDate, orderSource]);

    useEffect(() => {
        const fetchUserOptions = async () => {
            try {
                const response = await axios({
                    method: "GET",
                    url: `${BASE_URL}/user-management/options`,
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUserOptions(response?.data?.data || []);
            } catch (error) {
                toast.error(error?.response?.data?.message || error.message);
            }
        };

        fetchUserOptions();
    }, [BASE_URL, token]);

    const clearAllFilters = () => {
        setSearchQuery('');
        setStartDate('');
        setEndDate('');
        setStatusFilter('ALL');
        setSelectedUserId('');
        setCurrentPage(1);
        if (dateFilterRef.current) {
        dateFilterRef.current.clear();
        }
    };

    const openOfflineOrderModal = async () => {
        setIsOfflineModalOpen(true);
        setIsLoadingOfflineVariants(true);
        try {
            const response = await axios.get(`${BASE_URL}/order-management/offline-variants`, {
                headers: { Authorization: token },
            });
            setOfflineVariants(response?.data?.data || []);
        } catch (error) {
            toast.error(error?.response?.data?.message || error.message);
        } finally {
            setIsLoadingOfflineVariants(false);
        }
    };

    const addOfflineItem = () => {
        const variant = offlineVariants.find((item) => String(item.id) === String(selectedVariantId));
        if (!variant) return;

        const existing = offlineItems.find((item) => item.product_variant_id === variant.id);
        if ((existing?.quantity || 0) + 1 > variant.available_quantity) {
            toast.error(`Only ${variant.available_quantity} available`);
            return;
        }

        setOfflineItems((items) => existing
            ? items.map((item) => item.product_variant_id === variant.id
                ? { ...item, quantity: item.quantity + 1 }
                : item)
            : [...items, { product_variant_id: variant.id, quantity: 1 }]);
        setSelectedVariantId("");
    };

    const updateOfflineQuantity = (variantId, quantity) => {
        const variant = offlineVariants.find((item) => item.id === variantId);
        const nextQuantity = Number(quantity);
        if (!Number.isInteger(nextQuantity) || nextQuantity < 1) return;
        if (nextQuantity > variant.available_quantity) {
            toast.error(`Only ${variant.available_quantity} available`);
            return;
        }
        setOfflineItems((items) => items.map((item) => item.product_variant_id === variantId
            ? { ...item, quantity: nextQuantity }
            : item));
    };

    const createOfflineOrder = async (event) => {
        event.preventDefault();
        if (!offlineItems.length || isCreatingOfflineOrder) return;

        try {
            setIsCreatingOfflineOrder(true);
            const response = await axios.post(`${BASE_URL}/order-management/offline`, {
                payment_method: offlinePaymentMethod,
                amount_paid: Number(offlineAmountPaid.toFixed(2)),
                items: offlineItems,
            }, { headers: { Authorization: token } });

            toast.success(`Sale ${response?.data?.data?.order_no} recorded`);
            setIsOfflineModalOpen(false);
            setOfflineItems([]);
            setOfflineAmountPaidInput("");
            setCurrentPage(1);
            setOrderSource("OFFLINE");
            setSelectedUserId("");
            setStatusFilter("ALL");
        } catch (error) {
            toast.error(error?.response?.data?.message || error.message);
        } finally {
            setIsCreatingOfflineOrder(false);
        }
    };

    const offlineTotal = offlineItems.reduce((total, item) => {
        const variant = offlineVariants.find((option) => option.id === item.product_variant_id);
        return total + Number(variant?.mrp || 0) * item.quantity;
    }, 0);
    const offlineAmountPaid = offlineAmountPaidInput.trim() === ""
        ? offlineTotal
        : Number(offlineAmountPaidInput);
    const offlineDiscount = Number.isFinite(offlineAmountPaid)
        ? Math.max(0, offlineTotal - offlineAmountPaid)
        : 0;
    const isOfflineAmountInvalid = !Number.isFinite(offlineAmountPaid)
        || offlineAmountPaid < 0
        || offlineAmountPaid > offlineTotal;

    return (
        <div className="p-4 md:p-6">

            {/* Header */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Orders</h1>
                    <p className="text-gray-600">Manage and track orders</p>
                </div>
                <button
                    type="button"
                    onClick={openOfflineOrderModal}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#087443] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#06633a]"
                >
                    <Plus className="h-4 w-4" />
                    Record offline sale
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg border mb-6">
                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4">

                    <select
                        value={orderSource}
                        onChange={(e) => {
                            setCurrentPage(1);
                            setOrderSource(e.target.value);
                            setStatusFilter("ALL");
                            if (e.target.value !== "ONLINE") setSelectedUserId("");
                        }}
                        className="px-3 py-2 border rounded-lg w-full sm:w-[180px]"
                    >
                        <option value="ONLINE">Online orders</option>
                        <option value="OFFLINE">Offline sales</option>
                        <option value="ALL">All orders</option>
                    </select>

                    {/* Status */}
                    {orderSource !== "OFFLINE" && <select
                        value={statusFilter}
                        onChange={(e) => {
                            setCurrentPage(1);
                            setStatusFilter(e.target.value);
                        }}
                        className="px-3 py-2 border rounded-lg w-full sm:w-[200px]"
                    >
                        <option value="ALL">All</option>
                        <option value="PROCESSING">Processing</option>
                        <option value="PAYMENT_PENDING">Payment Pending</option>
                        <option value="OUT_FOR_DELIVERY">Out For Delivery</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                        <option value="REJECTED">Rejected</option>
                    </select>}

                    {/* User */}
                    {orderSource !== "OFFLINE" && <select
                        value={selectedUserId}
                        onChange={(e) => {
                            setCurrentPage(1);
                            setSelectedUserId(e.target.value);
                        }}
                        className="px-3 py-2 border rounded-lg w-full sm:w-[240px]"
                    >
                        <option value="">All users</option>
                        {userOptions.map((user) => (
                            <option key={user.id} value={user.id}>
                                {`${user.name || 'Unnamed user'} - ${user.phone_number || 'No phone number'}`}
                            </option>
                        ))}
                    </select>}

                    {/* Search */}
                    <div className="relative w-full sm:w-[240px]">
                        <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search order..."
                            value={searchQuery}
                            onChange={(e) => {
                                setCurrentPage(1);
                                setSearchQuery(e.target.value);
                            }}
                            className="w-full pl-10 pr-3 py-2 border rounded-lg"
                        />
                    </div>

                    {/* Date Range Filter */}
                    <div className="col-span-2">
                        <DateFilter
                            ref={dateFilterRef}
                            value={[startDate, endDate]}
                            onChange={(dates) => {
                                setStartDate(dates?.[0] || "");
                                setEndDate(dates?.[1] || "");
                                setCurrentPage(1);
                            }}
                        />
                    </div>

                    {(statusFilter!="ALL" ||
                        startDate ||
                        endDate ||
                        searchQuery ||
                        selectedUserId
                    ) && (
                        <button
                        onClick={clearAllFilters}
                        className="h-[37.5px] w-[100px] flex items-center gap-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg px-4 text-sm font-medium"
                        >
                        <CloseOutlined style={{ fontSize: '14px' }} />
                        Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                <table className="w-full min-w-[850px]">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-2 text-left">S.No</th>
                            <th className="px-4 py-2 text-left">Order No</th>
                            <th className="px-4 py-2 text-left">Customer Name</th>
                            <th className="px-4 py-2 text-left w-[320px]">Address</th>
                            <th className="px-4 py-2 text-left">Order Value</th>
                            <th className="px-4 py-2 text-left">Create At</th>
                            <th className="px-4 py-2 text-left">Status</th>
                        </tr>
                    </thead>

                    <tbody>
                        {orders.map((order, index) => (
                            <tr
                                key={order.id}
                                onClick={() =>
                                    window.open(`/orders/${order.id}`, "_blank")
                                }
                                className="hover:bg-gray-50 cursor-pointer"
                            >
                                <td className="px-4 py-2">
                                    {(currentPage - 1) * pageSize + index + 1}
                                </td>
                                <td className="px-4 py-2">{order.order_no}</td>
                                <td className="px-4 py-2">{order.order_source === "OFFLINE" ? "Walk-in sale" : order.user_name}</td>
                                {
                                    order.order_source === "OFFLINE" ?
                                <td className="px-4 py-2 text-gray-500">No delivery</td> : order.delivery_type === DELIVERY_TYPES.STORE_PICKUP ?
                                <td className="px-4 py-2 text-red-500">Store Pickup</td>:
                                <td className="px-4 py-2">{order.delivery_address}</td>
                                }
                                <td className="px-4 py-2">₹{order.total_amount}</td>
                                <td className="px-4 py-2">
                                    {formatISTTime(order.created_at)}
                                </td>
                                <td className="px-4 py-2">
                                    <span className={`px-2 py-1 text-xs rounded ${getOrderStatusBadge(order.current_status)}`}>
                                        {order.order_source === "OFFLINE" ? "DELIVERED · PAID" : order.current_status}
                                    </span>
                                    {order.order_source === "OFFLINE" && (
                                        <div className="mt-1 text-xs text-gray-500">Paid via {order.payment_method}</div>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {isLoading ? (
                        <tr>
                            <td colSpan={7} className="py-5 text-center">
                            <div className="flex flex-col items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
                                <p className="text-sm text-gray-600">Loading...</p>
                            </div>
                            </td>
                        </tr>
                        ) : orders.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="py-5 text-center">
                            <p className="text-sm text-gray-600">No orders found</p>
                            </td>
                        </tr>
                        ) : null}
                    </tbody>
                </table>
                </div>
            </div>

            {/* Pagination */}
            {totalPages > 0 && (
                <div className="px-4 py-1 border-t border-gray-200 bg-gray-50">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="text-sm text-gray-600">
                        Showing <span className="font-medium">{pageSize}</span> rows per page
                        <span className="mx-2">•</span>
                        <span className="font-medium">{totalRecords}</span> total results
                        </div>
                        {totalPages > 1 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                        )}
                    </div>
                </div>
            )}

            {isOfflineModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-6">
                    <form onSubmit={createOfflineOrder} className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b px-4 py-4 sm:px-6">
                            <div>
                                <h2 className="text-lg font-semibold">Record offline sale</h2>
                                <p className="mt-1 text-sm text-gray-500">Walk-in sale · marked delivered and paid</p>
                            </div>
                            <button type="button" onClick={() => setIsOfflineModalOpen(false)} className="rounded p-2 text-gray-500 hover:bg-gray-100" aria-label="Close">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-5 overflow-y-auto p-4 sm:p-6">
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
                                <select
                                    value={selectedVariantId}
                                    onChange={(e) => setSelectedVariantId(e.target.value)}
                                    disabled={isLoadingOfflineVariants}
                                    className="min-w-0 rounded-lg border px-3 py-2.5 text-sm"
                                >
                                    <option value="">{isLoadingOfflineVariants ? "Loading products..." : "Select a product or combo"}</option>
                                    {offlineVariants.map((variant) => (
                                        <option key={variant.id} value={variant.id} disabled={variant.available_quantity < 1}>
                                            {variant.product_name} · {variant.name} · ₹{variant.mrp} · stock {variant.available_quantity}
                                        </option>
                                    ))}
                                </select>
                                <button type="button" onClick={addOfflineItem} disabled={!selectedVariantId} className="inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium disabled:opacity-50">
                                    <Plus className="h-4 w-4" /> Add item
                                </button>
                            </div>

                            <div className="divide-y rounded-lg border">
                                {offlineItems.length === 0 ? (
                                    <p className="px-4 py-8 text-center text-sm text-gray-500">No items added</p>
                                ) : offlineItems.map((item) => {
                                    const variant = offlineVariants.find((option) => option.id === item.product_variant_id);
                                    return (
                                        <div key={item.product_variant_id} className="grid grid-cols-[1fr_72px_80px_36px] items-center gap-2 px-3 py-3 sm:grid-cols-[1fr_100px_110px_40px] sm:px-4">
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium">{variant?.product_name} · {variant?.name}</p>
                                                <p className="text-xs text-gray-500">₹{Number(variant?.mrp || 0).toFixed(2)} each · stock {variant?.available_quantity}</p>
                                            </div>
                                            <input
                                                type="number"
                                                min="1"
                                                max={variant?.available_quantity}
                                                value={item.quantity}
                                                onChange={(e) => updateOfflineQuantity(item.product_variant_id, e.target.value)}
                                                className="w-full rounded border px-2 py-2 text-center text-sm"
                                                aria-label={`Quantity for ${variant?.name}`}
                                            />
                                            <span className="text-right text-sm font-medium">₹{(Number(variant?.mrp || 0) * item.quantity).toFixed(2)}</span>
                                            <button type="button" onClick={() => setOfflineItems((items) => items.filter((entry) => entry.product_variant_id !== item.product_variant_id))} className="rounded p-2 text-gray-500 hover:bg-red-50 hover:text-red-600" aria-label={`Remove ${variant?.name}`}>
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <label className="text-sm font-medium text-gray-700">
                                    Payment method
                                    <select value={offlinePaymentMethod} onChange={(e) => setOfflinePaymentMethod(e.target.value)} className="mt-1 w-full rounded-lg border bg-white px-3 py-2.5 font-normal">
                                        <option value="CASH">Cash</option>
                                        <option value="UPI">UPI</option>
                                    </select>
                                </label>
                                <div className="flex items-end justify-between border-t pt-3 sm:border-0 sm:pt-0">
                                    <span className="text-sm text-gray-500">Items total</span>
                                    <span className="text-xl font-semibold">₹{offlineTotal.toFixed(2)}</span>
                                </div>
                            </div>

                            <label className="block text-sm font-medium text-gray-700">
                                Amount paid <span className="font-normal text-gray-500">(optional; defaults to item total)</span>
                                <input
                                    type="number"
                                    min="0"
                                    max={offlineTotal}
                                    step="0.01"
                                    value={offlineAmountPaidInput}
                                    onChange={(e) => setOfflineAmountPaidInput(e.target.value)}
                                    placeholder={offlineTotal.toFixed(2)}
                                    className="mt-1 w-full rounded-lg border px-3 py-2.5 font-normal"
                                />
                                {isOfflineAmountInvalid && (
                                    <span className="mt-1 block text-xs font-normal text-red-600">
                                        Amount paid must be between ₹0 and ₹{offlineTotal.toFixed(2)}
                                    </span>
                                )}
                            </label>

                            <div className="space-y-2 rounded-lg bg-gray-50 p-3 text-sm">
                                {offlineDiscount > 0 && (
                                    <div className="flex justify-between text-gray-600">
                                        <span>Discount</span>
                                        <span>-₹{offlineDiscount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between font-semibold">
                                    <span>Amount recorded as paid</span>
                                    <span>₹{Number.isFinite(offlineAmountPaid) ? offlineAmountPaid.toFixed(2) : "0.00"}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col-reverse gap-2 border-t p-4 sm:flex-row sm:justify-end sm:px-6">
                            <button type="button" onClick={() => setIsOfflineModalOpen(false)} className="rounded-lg border px-4 py-2.5 text-sm font-medium">Cancel</button>
                            <button type="submit" disabled={!offlineItems.length || isCreatingOfflineOrder || isOfflineAmountInvalid} className="rounded-lg bg-[#087443] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
                                {isCreatingOfflineOrder ? "Recording..." : "Record paid sale"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
