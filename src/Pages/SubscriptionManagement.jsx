import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import Pagination from "../components/common/Pagination";

export function SubscriptionManagement() {
    const BASE_URL = process.env.REACT_APP_API_URL;
    const token = localStorage.getItem("token");

    const navigate = useNavigate();

    const [subscriptions, setSubscriptions] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

    const [isLoading, setIsLoading] = useState(false);

    // Fetch API
    const fetchSubscriptions = async () => {
        if (isLoading) return;

        try {
            setIsLoading(true);

            const res = await axios({
                method: "GET",
                url: `${BASE_URL}/subscription-management`,
                headers: {
                    Authorization: token,
                },
                params: {
                    page: currentPage,
                    page_size: pageSize,
                    search: searchQuery,
                },
            });

            const data = res?.data?.data;

            console.log(data)

            setSubscriptions(data?.data || []);
            setTotalPages(data?.total_pages || 1);
        } catch (error) {
            const message =
                error?.response?.data?.message || error.message;
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    // Debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchSubscriptions();
        }, 400);

        return () => clearTimeout(timer);
    }, [searchQuery, currentPage]);

    const getStatusBadge = (status) => {
        const colors = {
            ACTIVE: "bg-green-100 text-green-800",
            PAYMENT_PENDING: "bg-yellow-100 text-yellow-800",
            CANCELLED: "bg-red-100 text-red-800",
            EXPIRED: "bg-gray-100 text-gray-800",
        };
        return colors[status] || "bg-gray-100 text-gray-800";
    };

    return (
        <div className="p-6">

            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold">
                    Subscriptions
                </h1>
                <p className="text-gray-600">
                    Manage all subscriptions
                </p>
            </div>

            {/* Search */}
            <div className="bg-white rounded-lg border p-4 mb-6">
                <div className="max-w-md">
                    <label className="block text-sm mb-2 text-gray-700">
                        Subscription ID / User
                    </label>

                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />

                        <input
                            type="text"
                            placeholder="Search subscription..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border rounded-lg overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">
                                S.No
                            </th>
                            <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">
                                Subscription No
                            </th>
                            <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">
                                Customer Name
                            </th>
                            <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">
                                Plan
                            </th>
                            <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">
                                Status
                            </th>
                            <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">
                                Price / Delivery
                            </th>
                            <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">
                                Start Date
                            </th>
                            <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">
                                Created At
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {subscriptions.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={7}
                                    className="text-center py-6 text-gray-500"
                                >
                                    No subscriptions found
                                </td>
                            </tr>
                        ) : (
                            subscriptions.map((sub, index) => (
                                <tr
                                    key={sub.id}
                                    onClick={() =>
                                        navigate(`/subscriptions/${sub.id}`)
                                    }
                                    className="hover:bg-gray-50 cursor-pointer"
                                >
                                    <td className="px-4 py-2">
                                        {(currentPage - 1) * pageSize + index + 1}
                                    </td>
                                    <td className="px-4 py-2">
                                        {sub.subscription_no}
                                    </td>

                                    <td className="px-4 py-2">
                                        {sub.user_name}
                                    </td>

                                    <td className="px-4 py-2">
                                        {sub.plan_name}
                                    </td>

                                    <td className="px-4 py-2">
                                        <span
                                            className={`px-2 py-1 text-xs rounded ${getStatusBadge(
                                                sub.status
                                            )}`}
                                        >
                                            {sub.status}
                                        </span>
                                    </td>

                                    <td className="px-4 py-2">
                                        ₹{sub.price_per_delivery}
                                    </td>

                                    <td className="px-4 py-2 text-sm text-gray-600">
                                        {new Date(
                                            sub.start_date
                                        ).toLocaleDateString()}
                                    </td>

                                    <td className="px-4 py-2 text-sm text-gray-600">
                                        {new Date(
                                            sub.created_at
                                        ).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {isLoading && (
                    <div className="text-center py-4 text-gray-500">
                        Loading...
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            )}

            {/* Footer */}
            <div className="mt-4 text-sm text-gray-600">
                Showing {subscriptions.length} subscription(s)
            </div>
        </div>
    );
}