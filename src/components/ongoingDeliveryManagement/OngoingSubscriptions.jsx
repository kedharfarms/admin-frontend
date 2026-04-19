import { useEffect, useState } from "react";
import axios from "axios";
import Pagination from "../common/Pagination";
import { FiMoreVertical, FiUserPlus } from 'react-icons/fi';
import { populateAddress } from "../../utils/utils";
import { getSubscriptionStatusBadge } from "../../constants/commonConstants";
import toast from "react-hot-toast";
import ConfirmationModal from "../common/ConfirmationModal";

export default function OngoingSubscriptions({
    data,
    isLoading,
    currentPage,
    pageSize,
    totalPages,
    totalRecords,
    refreshSubscriptions,
    onPageChange,
}) {
    const BASE_URL = process.env.REACT_APP_API_URL;
    const token = localStorage.getItem("token");

    const [openMenuId, setOpenMenuId] = useState(null);
    const [selectedSubscription, setSelectedSubsciption] = useState(null);
    const [isExecuting, setIsExecuting] = useState(false);

    useEffect(() => {
        const closeMenu = () => setOpenMenuId(null);
        document.addEventListener('click', closeMenu);
        return () => document.removeEventListener('click', closeMenu);
    }, []);

    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showDeliveredModal, setShowDeliveredModal] = useState(false);


    const markRejectedHandler = async() => {
        if(isExecuting) return;
        setIsExecuting(true);
        try{
            await axios({
                method: 'POST',
                url : BASE_URL + `/subscription-management/${selectedSubscription.id}/cancel-delivery`,
                headers: {
                    Authorization: token
                }
            });
            setShowRejectModal(false);

            refreshSubscriptions();
        }
        catch(error){
            const errorMessage = error?.response?.data?.message || error?.message;
            toast.error(errorMessage);
        }
        finally{
            setIsExecuting(false);
        }
    }

    const markDeliveredHandler = async() => {
        if(isExecuting) return;
        setIsExecuting(true);
        try{
            await axios({
                method: 'POST',
                url : BASE_URL + `/subscription-management/${selectedSubscription.id}/mark-delivered`,
                headers: {
                    Authorization: token
                }
            });
            setShowDeliveredModal(false);

            refreshSubscriptions();
        }
        catch(error){
            const errorMessage = error?.response?.data?.message || error?.message;
            toast.error(errorMessage);
        }
        finally{
            setIsExecuting(false);
        }
    }

    if (isLoading) return <p>Loading...</p>;

    return (
        <div className="bg-white border rounded-lg overflow-hidden">
            <table className="w-full">
                <thead className="bg-gray-50 border-b">
                    <tr>
                        <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">
                            S.No
                        </th>
                        <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">Sub No</th>
                        <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">Customer Name</th>
                        <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">Plan</th>
                        <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">Delivery Slot</th>
                        <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase w-80">Delivery Address</th>
                        <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">Status</th> 
                        <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">Action</th>   
                    </tr>
                </thead>

                <tbody>
                    {data.map((subscription, index) => (
                        <tr key={subscription.id} className="hover:bg-gray-50 cursor-pointer"
                                    onClick={() =>
                                        window.open(`/subscriptions/${subscription.id}`, "_blank")
                                    }
                        >
                            <td className="px-4 py-2">
                                {(currentPage - 1) * pageSize + index + 1}
                            </td>

                            <td
                            className="px-4 py-2"
                            onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(subscription?.subscription_no);
                            }}
                            >
                            {subscription.subscription_no}
                            </td>

                            <td className="px-4 py-2">
                                {subscription.user?.name}
                            </td>

                            <td className="px-4 py-2">
                                {subscription.subscription_plan?.title} - {subscription.subscription_plan?.sub_title}
                            </td>

                            <td className="px-4 py-2">
                                {subscription.delivery_slot?.toUpperCase()}
                            </td>

                            <td className="px-4 py-2 w-80">
                                {populateAddress(subscription.delivery_address)}
                            </td>
                            <td className="px-4 py-2">
                                <span
                                    className={`px-2 py-1 text-xs rounded ${getSubscriptionStatusBadge(
                                        subscription.status
                                    )}`}
                                >
                                    {subscription.status}
                                </span>
                            </td>

                            <td className="px-3 py-2 text-center relative">
                                <div className="flex items-center justify-center gap-2">
                                    <button
                                        className="p-2 rounded hover:bg-gray-200"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenMenuId(openMenuId === subscription.id ? null : subscription.id);
                                            setSelectedSubsciption(subscription);
                                        }}
                                    >
                                        <FiMoreVertical size={18} />
                                    </button>
                                </div>

                                {/* ACTION MENU */}
                                {openMenuId === subscription.id && (
                                <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-20">
                                    <button
                                    className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100 text-left text-sm"
                                    onClick={(e) => {
                                        e.stopPropagation(); 
                                        setSelectedSubsciption(subscription);
                                        setShowDeliveredModal(true);
                                        setOpenMenuId(null);
                                    }}
                                    >
                                        Mark Delivered
                                    </button>
                                    
                                    <button
                                        className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100 text-left text-sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedSubsciption(subscription);
                                            setShowRejectModal(true);
                                            setOpenMenuId(null);
                                        }}
                                    >
                                        Cancel Delivery
                                    </button>
                                </div>
                                )}
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
            
            <ConfirmationModal
                isOpen={!!( showRejectModal && selectedSubscription)}
                onClose={() => {
                    setShowRejectModal(false);
                    setSelectedSubsciption(null);
                }}
                title="Confirm Cancel Delivery"
                subtitle={`Move subscription ${selectedSubscription?.subscription_no} to Cancelled?`}
                zIndex="z-[60]"
                isLoading={isExecuting}
                onConfirm={markRejectedHandler}
                confirmText={`Confirm`}
            >
                <p className="text-sm text-gray-600 mb-4">
                This action will update the subscription status and cannot be undone.
                </p>

            </ConfirmationModal>

            <ConfirmationModal
                isOpen={!!( showDeliveredModal && selectedSubscription)}
                onClose={() => {
                    setShowDeliveredModal(false);
                    setSelectedSubsciption(null);
                }}
                title="Confirm Delivered Subscription"
                subtitle={`Move subscription ${selectedSubscription?.subscription_no} to Delivered?`}
                zIndex="z-[60]"
                isLoading={isExecuting}
                onConfirm={markDeliveredHandler}
                confirmText={`Confirm`}
            >
                <p className="text-sm text-gray-600 mb-4">
                This action will update the subscription status and cannot be undone.
                </p>

            </ConfirmationModal>
        </div>
    );
}