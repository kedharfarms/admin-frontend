import { useEffect, useState } from "react";
import axios from "axios";
import Pagination from "../common/Pagination";

export default function OngoingOrders({
    data,
    isLoading,
    currentPage,
    totalPages,
    totalRecords,
    pageSize,
    onPageChange,
}) {
    const getStatusBadge = (status) => {
        const colors = {
            PROCESSING: "bg-blue-100 text-blue-800",
            OUT_FOR_DELIVERY: "bg-yellow-100 text-yellow-800",
        };
        return colors[status] || "bg-gray-100";
    };

    if (isLoading) return <p>Loading...</p>;

    return (
        <div className="bg-white border rounded-lg overflow-hidden">
            <table className="w-full">
                <thead className="bg-gray-50 border-b">
                    <tr>    
                        <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">
                            S.No
                        </th>
                        <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">Order No</th>    
                        <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">Customer</th>    
                        <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">Address</th>    
                        <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">Status</th>    
                        <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">Total</th>
                    </tr>
                </thead>

                <tbody>
                    {data.map((order, index) => (
                        <tr key={order?.id} className="hover:bg-gray-50 cursor-pointer">
                            <td className="px-4 py-2">
                                {(currentPage - 1) * pageSize + index + 1}
                            </td>
                            <td className="px-4 py-2">
                                {order?.order_no}
                            </td>

                            <td className="px-4 py-2">
                                {order?.user?.name}
                            </td>

                            <td className="px-4 py-2">
                                {order?.delivery_address?.city}
                            </td>

                            <td className="px-4 py-2">
                                <span
                                    className={`px-2 py-1 text-xs rounded ${getStatusBadge(
                                        order?.current_status
                                    )}`}
                                >
                                    {order?.current_status}
                                </span>
                            </td>

                            <td className="px-4 py-2">
                                ${order?.total_amount}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 0 && (
                <div className="px-4 py-1 border-t bg-gray-50">
                    <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                            {totalRecords} results
                        </div>

                        {totalPages > 1 && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={onPageChange}
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}