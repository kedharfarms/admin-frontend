import { useEffect, useState } from "react";
import axios from "axios";
import Pagination from "../common/Pagination";
import { formatISTTime, populateAddress } from "../../utils/utils";
import { getOrderStatusBadge, ORDER_STATUS } from "../../constants/commonConstants";
import { FiMoreVertical, FiUserPlus } from 'react-icons/fi';
import ConfirmationModal from "../common/ConfirmationModal";
import toast from "react-hot-toast";

export default function OngoingOrders({
    data,
    isLoading,
    currentPage,
    totalPages,
    totalRecords,
    pageSize,
    onPageChange,
    refreshOrders
}) {
    const BASE_URL = process.env.REACT_APP_API_URL;
    const token = localStorage.getItem("token");

    const [openMenuId, setOpenMenuId] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isExecuting, setIsExecuting] = useState(false);

    const [showMarkOfdModal, setShowMarkOfdModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showDeliveredModal, setShowDeliveredModal] = useState(false);

    useEffect(() => {
        const closeMenu = () => setOpenMenuId(null);
        document.addEventListener('click', closeMenu);
        return () => document.removeEventListener('click', closeMenu);
    }, []);

    const markOfdHandler = async() => {
        if(isExecuting) return;
        setIsExecuting(true);
        try{
            await axios({
                method: 'POST',
                url : BASE_URL + `/order-management/${selectedOrder.id}/mark-ofd`,
                headers: {
                    Authorization: token
                }
            });

            setShowMarkOfdModal(false);

            refreshOrders();
        }
        catch(error){
            const errorMessage = error?.response?.data?.message || error?.message;
            toast.error(errorMessage);
        }
        finally{
            setIsExecuting(false);
        }
    }


    const markRejectedHandler = async() => {
        if(isExecuting) return;
        setIsExecuting(true);
        try{
            await axios({
                method: 'POST',
                url : BASE_URL + `/order-management/${selectedOrder.id}/reject`,
                headers: {
                    Authorization: token
                }
            });
            setShowRejectModal(false);

            refreshOrders();
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
                url : BASE_URL + `/order-management/${selectedOrder.id}/mark-delivered`,
                headers: {
                    Authorization: token
                }
            });
            setShowDeliveredModal(false);

            refreshOrders();
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
                        <th className="px-4 py-2 text-left w-60 text-xs text-gray-500 uppercase">Order No</th>    
                        <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">Customer Name</th>   
                        <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase w-80">Delivery Address</th>
                        <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">Order Value</th>
                        <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">Created At</th>
                        <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">Status</th>    
                        <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">Action</th>    
                    </tr>
                </thead>

                <tbody>
                    {data.map((order, index) => (
                        <tr key={order?.id} className="hover:bg-gray-50 cursor-pointer"
                                    onClick={() =>
                                        window.open(`/orders/${order.id}`, "_blank")
                                    }>
                            <td className="px-4 py-2">
                                {(currentPage - 1) * pageSize + index + 1}
                            </td>
                            <td className="px-4 py-2 w-60"
                                onClick={() => navigator.clipboard.writeText(order?.order_no)}>
                                {order?.order_no}
                                <span className="ml-2 text-xs bg-orange-500 hover:bg-orange-600 rounded-full text-white px-2 py-0.5 transition-colors font-medium whitespace-nowrap">
                                    {order.payment_method}
                                </span>
                                
                            </td>

                            <td className="px-4 py-2">
                                {order?.user?.name}
                            </td>

                            <td className="px-4 py-2 w-80">
                                {populateAddress(order?.delivery_address)}
                            </td>


                            <td className="px-4 py-2 text-center">
                                {order?.total_amount}
                            </td>

                            <td className="px-4 py-2">
                                {formatISTTime(order?.created_at)}
                            </td>
                            
                            <td className="px-4 py-2">
                                <span
                                    className={`px-2 py-1 text-xs rounded ${getOrderStatusBadge(
                                        order?.current_status
                                    )}`}
                                >
                                    {order?.current_status}
                                </span>
                            </td>

                            <td className="px-3 py-2 text-center relative">
                                <div className="flex items-center justify-center gap-2">
                                    <button
                                        className="p-2 rounded hover:bg-gray-200"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenMenuId(openMenuId === order.id ? null : order.id);
                                            setSelectedOrder(order);
                                        }}
                                    >
                                        <FiMoreVertical size={18} />
                                    </button>
                                </div>

                                {/* ACTION MENU */}
                                {openMenuId === order.id && (
                                <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-20">
                                    {(order.current_status === ORDER_STATUS.PROCESSING) &&
                                        <button
                                        className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100 text-left text-sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedOrder(order);
                                            setShowMarkOfdModal(true);
                                            setOpenMenuId(null);
                                        }}
                                        >
                                            Mark Out For Delivery 
                                        </button>
                                    }
                                    {(order.current_status === ORDER_STATUS.OUT_FOR_DELIVERY) &&
                                        <button
                                        className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100 text-left text-sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedOrder(order);
                                            setShowDeliveredModal(true);
                                            setOpenMenuId(null);
                                        }}
                                        >
                                            Mark Delivered
                                        </button>
                                    }
                                    <button
                                        className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100 text-left text-sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedOrder(order);
                                            setShowRejectModal(true);
                                            setOpenMenuId(null);
                                        }}
                                    >
                                        Reject Order
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
                isOpen={!!( showMarkOfdModal && selectedOrder)}
                onClose={() => {
                    setShowMarkOfdModal(false);
                    setSelectedOrder(null);
                }}
                title="Confirm Mark Out for Delivery"
                subtitle={`Move order ${selectedOrder?.order_no} to Out For Delivery?`}
                zIndex="z-[60]"
                isLoading={isExecuting}
                onConfirm={markOfdHandler}
                confirmText={`Confirm`}
            >
                <p className="text-sm text-gray-600 mb-4">
                This action will update the order status and trigger the next workflow step.
                </p>

            </ConfirmationModal>

            <ConfirmationModal
                isOpen={!!( showRejectModal && selectedOrder)}
                onClose={() => {
                    setShowRejectModal(false);
                    setSelectedOrder(null);
                }}
                title="Confirm Reject Order"
                subtitle={`Move order ${selectedOrder?.order_no} to Rejected?`}
                zIndex="z-[60]"
                isLoading={isExecuting}
                onConfirm={markRejectedHandler}
                confirmText={`Confirm`}
            >
                <p className="text-sm text-gray-600 mb-4">
                This action will update the order status and cannot be undone.
                </p>

            </ConfirmationModal>

            <ConfirmationModal
                isOpen={!!( showDeliveredModal && selectedOrder)}
                onClose={() => {
                    setShowDeliveredModal(false);
                    setSelectedOrder(null);
                }}
                title="Confirm Delivered Order"
                subtitle={`Move order ${selectedOrder?.order_no} to Delivered?`}
                zIndex="z-[60]"
                isLoading={isExecuting}
                onConfirm={markDeliveredHandler}
                confirmText={`Confirm`}
            >
                <p className="text-sm text-gray-600 mb-4">
                This action will update the order status and cannot be undone.
                </p>

            </ConfirmationModal>
        </div>
    );
}