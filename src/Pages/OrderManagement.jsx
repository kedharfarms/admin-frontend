import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { CloseOutlined } from '@ant-design/icons';

import Pagination from "../components/common/Pagination";
import DateFilter from "../components/common/DateFilter";
import { formatISTTime } from "../utils/utils";
import { getOrderStatusBadge } from "../constants/commonConstants";

export function OrdersView() {
    const BASE_URL = process.env.REACT_APP_API_URL;
    const token = localStorage.getItem("token");

    const [orders, setOrders] = useState([]);
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [searchQuery, setSearchQuery] = useState("");

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const [isLoading, setIsLoading] = useState(false);
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
    }, [currentPage, searchQuery, statusFilter, startDate, endDate]);

    const clearAllFilters = () => {
        setSearchQuery('');
        setStartDate('');
        setEndDate('');
        setStatusFilter('');
        if (dateFilterRef.current) {
        dateFilterRef.current.clear();
        }
    };

    return (
        <div className="p-6">

            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Orders</h1>
                <p className="text-gray-600">Manage and track orders</p>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg border mb-6">
                <div className="flex flex-row gap-4">

                    {/* Status */}
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setCurrentPage(1);
                            setStatusFilter(e.target.value);
                        }}
                        className="px-3 py-2 border rounded-lg w-[200px]"
                    >
                        <option value="ALL">All</option>
                        <option value="PROCESSING">Processing</option>
                        <option value="PAYMENT_PENDING">Payment Pending</option>
                        <option value="OUT_FOR_DELIVERY">Out For Delivery</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                        <option value="REJECTED">Rejected</option>
                    </select>

                    {/* Search */}
                    <div className="relative">
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
                        searchQuery
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
                <table className="w-full">
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
                                <td className="px-4 py-2">{order.user_name}</td>
                                <td className="px-4 py-2">{order.delivery_address}</td>
                                <td className="px-4 py-2">₹{order.total_amount}</td>
                                <td className="px-4 py-2">
                                    {formatISTTime(order.created_at)}
                                </td>
                                <td className="px-4 py-2">
                                    <span className={`px-2 py-1 text-xs rounded ${getOrderStatusBadge(order.current_status)}`}>
                                        {order.current_status}
                                    </span>
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

            {/* Pagination */}
            {totalPages > 0 && (
                <div className="px-4 py-1 border-t border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
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
        </div>
    );
}