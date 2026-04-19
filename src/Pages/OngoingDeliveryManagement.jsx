import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { CloseOutlined } from "@ant-design/icons";
import DateFilter from "../components/common/DateFilter";

import OngoingOrders from "../components/ongoingDeliveryManagement/OngoingOrders";
import OngoingSubscriptions from "../components/ongoingDeliveryManagement/OngoingSubscriptions";
import { useSearchParams } from "react-router-dom";

const TABS = [
    { key: "subscriptions", label: "Subscriptions" },
    { key: "orders", label: "Orders" },
];

export default function OngoingDeliveryManagement() {
    const BASE_URL = process.env.REACT_APP_API_URL;
    const token = localStorage.getItem("token");
        
    const [searchParams, setSearchParams] = useSearchParams();

    const [activeTab, setActiveTab] = useState(
        searchParams.get("tab") || "subscriptions"
    );

    const [searchQuery, setSearchQuery] = useState(
        searchParams.get("search") || ""
    );

    const [statusFilter, setStatusFilter] = useState(
        searchParams.get("status") || "ALL"
    );

    const [startDate, setStartDate] = useState(
        searchParams.get("start_date") || ""
    );

    const [endDate, setEndDate] = useState(
        searchParams.get("end_date") || ""
    );

    const [currentPage, setCurrentPage] = useState(
        Number(searchParams.get("page")) || 1
    );

    const [pageSize, setPageSize] = useState(
        Number(searchParams.get("page_size")) || 10
    );
    const [data, setData] = useState([]);

    const [totalRecords, setTotalRecords] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const [isLoading, setIsLoading] = useState(false);

    const dateFilterRef = useRef();

    const fetchData = async () => {
        if (isLoading) return;

        try {
            setIsLoading(true);

            const url =
                activeTab === "orders"
                    ? "/ongoing/orders"
                    : "/ongoing/subscriptions";

            const res = await axios({
                method: "GET",
                url: `${BASE_URL}${url}`,
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

            const result = res?.data?.data;

            setData(result?.data || []);
            setTotalPages(result?.total_pages || 1);
            setTotalRecords(result?.total_rows || 0);

        } catch (error) {
            toast.error(
                error?.response?.data?.message || error.message
            );
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(fetchData, 400);
        return () => clearTimeout(timer);
    }, [activeTab, currentPage, searchQuery, statusFilter, startDate, endDate]);

    const clearAllFilters = () => {
        setSearchQuery("");
        setStartDate("");
        setEndDate("");
        setStatusFilter("ALL");
        if (dateFilterRef.current) dateFilterRef.current.clear();
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    return (
        <div className="p-6">

            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold">
                    Ongoing Delivery
                </h1>
                <p className="text-gray-600">
                    Manage ongoing orders & subscriptions
                </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-4 border-b">
                {TABS.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => {
                            setActiveTab(tab.key);
                            setCurrentPage(1);
                        }}
                        className={`pb-2 ${
                            activeTab === tab.key
                                ? "border-b-2 border-[#94BF30] text-[#94BF30]"
                                : "text-gray-500"
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Filters (SAME UI) */}
            <div className="bg-white p-4 rounded-lg border mb-6">
                <div className="flex flex-row gap-4">
                    {
                        activeTab == 'orders' && 
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
                            <option value="OUT_FOR_DELIVERY">Out For Delivery</option>
                        </select>
                    }

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => {
                                setCurrentPage(1);
                                setSearchQuery(e.target.value);
                            }}
                            className="pl-10 pr-3 py-2 border rounded-lg"
                        />
                    </div>
                    {
                        activeTab == 'orders' && 
                        <DateFilter
                            ref={dateFilterRef}
                            value={[startDate, endDate]}
                            onChange={(dates) => {
                                setStartDate(dates?.[0] || "");
                                setEndDate(dates?.[1] || "");
                                setCurrentPage(1);
                            }}
                        />
                    }

                    {(searchQuery || statusFilter !== "ALL" || startDate || endDate) && (
                        <button
                            onClick={clearAllFilters}
                            className="flex items-center gap-2 bg-gray-100 px-4 rounded-lg"
                        >
                            <CloseOutlined />
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* TABLE */}
            {activeTab === "orders" && (
                <OngoingOrders
                    data={data}
                    isLoading={isLoading}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalRecords={totalRecords}
                    onPageChange={handlePageChange}
                    pageSize={pageSize}
                    refreshOrders={fetchData}
                />
            )}

            {activeTab === "subscriptions" && (
                <OngoingSubscriptions
                    data={data}
                    isLoading={isLoading}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalRecords={totalRecords}
                    onPageChange={handlePageChange}
                    pageSize={pageSize}
                    refreshSubscriptions={fetchData}
                />
            )}
        </div>
    );
}