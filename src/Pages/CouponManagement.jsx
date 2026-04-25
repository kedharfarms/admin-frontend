import { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import Pagination from '../components/common/Pagination';
import { Modal } from '../components/productManagement/ProductTableComponents';
import ConfirmationModal from '../components/common/ConfirmationModal';
import toast from 'react-hot-toast';

export function CouponManagement() {

    const BASE_URL = process.env.REACT_APP_API_URL;
    const token = localStorage.getItem("token");

    const [coupons, setCoupons] = useState([]);
    const [users, setUsers] = useState([]);
    const [plans, setPlans] = useState([]);

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [selectedCoupon, setSelectedCoupon] = useState(null);

    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isExecuting, setIsExecuting] = useState(false);

    const [formData, setFormData] = useState({
        user_id: '',
        subscription_plan_id: '',
        amount: 0,
    });

    useEffect(() => {
        fetchCoupons();
        fetchDropdowns();
    }, [page]);

    const fetchCoupons = async () => {
        try {
            const res = await axios({
            method: 'GET',
            url: BASE_URL + '/coupons',
            params: {
                page,
                page_size: 10,
            },
            headers: {
                Authorization: token,
            },
        });

            setCoupons(res.data.data);
            setTotalPages(res.data.total_pages);
        } catch (error) {
            const message =
                error?.response?.data?.message || error.message;

            toast.error(message);
        }
    };

    const fetchDropdowns = async () => {
        try {
            const [userResponse, planResponse] = await Promise.all([
                axios({
                    method: 'GET',
                    url:  BASE_URL + '/users/options',
                    headers: {
                        Authorization: token,
                    },
                }),
                axios({
                    method: 'GET',
                    url:  BASE_URL + '/subscription-plans/options',
                    headers: {
                        Authorization: token,
                    },
                }),
            ]);

            setUsers(userResponse?.data?.data || []);
            setPlans(planResponse?.data?.data || []);
        } catch (error) {
            const message =
                error?.response?.data?.message || error.message;

            toast.error(message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if(isExecuting) return;
        setIsExecuting(true);

        try {
            if (!formData.user_id || !formData.subscription_plan_id || formData.amount <= 0) {
                throw new Error('Fill all fields');
                return;
            }

            if(Number(formData.amount) > Number(formData.subscription_plan_price * formData.validity)){
                throw new Error('Coupon Amount cannot be more than plan price')
            }

            await axios({
                method: 'POST',
                url:  BASE_URL + '/coupons',
                data: formData,
                headers: {
                    Authorization: token,
                },
            });

            toast.success('Coupon created');
            setFormData({
                user_id: '',
                subscription_plan_id: '',
                amount: 0,
            });
            setShowModal(false);
            fetchCoupons();
        } catch (error) {
            const message =
                error?.response?.data?.message || error.message;

            toast.error(message);
        } finally {
            setIsExecuting(false);
        }
    };

    const handleDelete = async () => {
        if(isExecuting) return;
        setIsExecuting(true);
        try {
            await axios({
                method: 'DELETE',
                url:  BASE_URL + `/coupons/${selectedCoupon?.id}`,
                headers: {
                    Authorization: token,
                },
            });
            setShowDeleteModal(false);

            fetchCoupons();
        } catch (error) {
            const message =
                error?.response?.data?.message || error.message;

            toast.error(message);
        } finally {
            setIsExecuting(false);
        }
    };

    const handlePageChange = (page) => {
        setPage(page);
    };

    return (
        <div className="p-8">
            <div className="flex flex-row items-center justify-between mb-6">
                <div className="mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">Coupon Management</h1>
                    {/* <p className="text-gray-600">Manage categories, products, and variants</p> */}
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2 h-auto bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    <Plus size={16} />
                    Create
                </button>
            </div>

            {/* TABLE */}
            <table className="w-full border">
                <thead className='w-full'>
                    <tr className="bg-gray-100 w-full">
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Id</th>

                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Code</th>
                                    
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">User</th>
                                    
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Plan</th>
                                    
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Amount</th>
                        <th className="px-4 py-3 text-xs font-medium text-gray-500 text-center uppercase tracking-wider bg-gray-50">Action</th>
                    </tr>
                </thead>

                <tbody>
                    {coupons.map((coupon, index) => (
                        <tr key={coupon.id} className="border-t">
                            <td className={`px-4 py-3 whitespace-nowrap text-sm`}>{(page - 1) * 10 + index + 1}</td>
                            <td className={`px-4 py-3 whitespace-nowrap text-sm`}>{coupon.code}</td>
                            <td className={`px-4 py-3 whitespace-nowrap text-sm`}>{coupon.user?.name}</td>
                            <td className={`px-4 py-3 whitespace-nowrap text-sm`}>{coupon.subscription_plan?.name || coupon.subscription_plan_id}</td>
                            <td className={`px-4 py-3 whitespace-nowrap text-sm`}>₹{coupon.amount}</td>

                            <td className={`px-4 py-3 text-center whitespace-nowrap text-sm`}>
                                <button onClick={() => {
                                    setShowDeleteModal(true);
                                    setSelectedCoupon(coupon);
                                }}>
                                    <Trash2 className="w-4 h-4 text-red-600" />
                                </button>
                            </td>
                        </tr>
                    ))}
                    {
                    coupons.length === 0 &&
                        <tr>
                            <td colSpan={6} className="py-5 text-center text-gray-500">
                                No coupons created yet
                            </td>
                        </tr>
                    }
                </tbody>
            </table>

            {/* PAGINATION */}
            {totalPages > 0 && (
                <div className="px-4 py-1 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                        Showing <span className="font-medium">{10}</span> rows per page
                        <span className="mx-2">•</span>
                        <span className="font-medium">{totalRecords}</span> total results
                    </div>

                    {totalPages > 1 && (
                        <Pagination
                            currentPage={page}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    )}
                    </div>
                </div>
            )}

            {/* MODAL */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
                    <form
                        onSubmit={handleSubmit}
                        className="bg-white w-[420px] rounded-2xl shadow-xl p-6 space-y-5"
                    >
                        <h2 className="text-xl font-semibold text-gray-800">
                            Create Coupon
                        </h2>

                        {/* USER SELECT */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                User
                            </label>
                            <select
                                className="w-full border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.user_id}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        user_id: Number(e.target.value),
                                    })
                                }
                            >
                                <option value="">Select User</option>
                                {users.map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* PLAN SELECT */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Subscription Plan
                            </label>
                            <select
                                className="w-full border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.subscription_plan_id}
                                onChange={(e) => {
                                    const selectedId = Number(e.target.value);
                                    const selectedPlan = plans.find(
                                        (p) => p.id === selectedId
                                    );

                                    setFormData({
                                        ...formData,
                                        subscription_plan_id: selectedId,
                                        subscription_plan_price:
                                            selectedPlan?.price_per_delivery || 0,
                                        validity: selectedPlan?.validity_days
                                    });
                                }}
                            >
                                <option value="">Select Plan</option>
                                {plans.map((plan) => (
                                    <option key={plan.id} value={plan.id}>
                                        {plan.title} - {plan.sub_title} -{" "}
                                        {plan.validity_days} days
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* PLAN PRICE */}
                        {formData.subscription_plan_id !== null &&
                            formData.subscription_plan_price !== null && (
                                <div className="bg-gray-50 border rounded-lg p-3 text-sm text-gray-700">
                                    <span className="font-medium">Plan Price:</span>{" "}
                                    ₹{formData.subscription_plan_price * formData.validity}
                                </div>
                            )}

                        {/* AMOUNT */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Coupon Amount
                            </label>
                            <input
                                type="number"
                                className="w-full border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter amount"
                                value={formData.amount}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        amount: Number(e.target.value),
                                    })
                                }
                            />
                        </div>

                        {/* ACTIONS */}
                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-100"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                            >
                                Create
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* DELETE MODAL */}
            {showDeleteModal && (
                <ConfirmationModal 
                    isOpen={showDeleteModal}
                    onClose={() => {
                        setShowDeleteModal(false);
                    }}
                    title="Confirm Delete"
                    zIndex="z-[60]"
                    onConfirm={handleDelete}
                    confirmText={`Confirm`}
                    isLoading={isExecuting}
                >
                    <div className="space-y-4">
                        <p>Are you sure you want to delete this coupon {selectedCoupon?.code}?</p>

                    </div>
                </ConfirmationModal>
            )}
        </div>
    );
}