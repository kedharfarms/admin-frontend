import { useEffect, useState } from "react";
import axios from "axios";
import Pagination from "../common/Pagination";

export default function OngoingSubscriptions({
    data,
    isLoading,
    currentPage,
    totalPages,
    totalRecords,
    onPageChange,
}) {
    if (isLoading) return <p>Loading...</p>;

    return (
        <div className="bg-white border rounded">
            <table className="w-full">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="p-3">Sub No</th>
                        <th className="p-3">Customer</th>
                        <th className="p-3">Plan</th>
                        <th className="p-3">Status</th>
                    </tr>
                </thead>

                <tbody>
                    {data.map((s) => (
                        <tr key={s.id} className="border-b">
                            <td className="p-3 text-green-600">
                                {s.subscription_no}
                            </td>

                            <td className="p-3">
                                {s.user?.name}
                            </td>

                            <td className="p-3">
                                {s.plan?.name}
                            </td>

                            <td className="p-3">
                                {s.status}
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