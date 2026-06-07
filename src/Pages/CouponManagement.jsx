import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import {
    Plus,
    Search,
    Trash2,
} from 'lucide-react';
import { CloseOutlined } from '@ant-design/icons';
import toast from 'react-hot-toast';

import Pagination from '../components/common/Pagination';
import DateFilter from '../components/common/DateFilter';
import ConfirmationModal from '../components/common/ConfirmationModal';
import { formatISTTime } from '../utils/utils';

export function CouponManagement() {
    const BASE_URL = process.env.REACT_APP_API_URL;
    const token = localStorage.getItem('token');

    const [coupons, setCoupons] = useState([]);

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] =
        useState('ALL');

    const [currentPage, setCurrentPage] =
        useState(1);

    const [pageSize] = useState(10);

    const [totalPages, setTotalPages] =
        useState(1);

    const [totalRecords, setTotalRecords] =
        useState(0);

    const [showModal, setShowModal] =
        useState(false);

    const [showDeleteModal, setShowDeleteModal] =
        useState(false);

    const [selectedCoupon, setSelectedCoupon] =
        useState(null);

    const [isLoading, setIsLoading] =
        useState(false);

    const [isExecuting, setIsExecuting] =
        useState(false);

    const [formData, setFormData] = useState({
        code: '',
        name: '',
        description: '',
        coupon_type: 'cart_flat',
        discount_value: '',
        min_order_amount: '',
        max_discount_amount: '',
        usage_limit: '',
        usage_per_user: 1,
        valid_from: '',
        valid_until: '',
    });

    useEffect(() => {
        fetchCoupons();
    }, [
        currentPage,
        searchQuery,
        statusFilter,
    ]);

    const fetchCoupons = async () => {
        if (isLoading) return;

        try {
            setIsLoading(true);

            const res = await axios({
                method: 'GET',
                url: BASE_URL + '/coupons',
                headers: {
                    Authorization: token,
                },
                params: {
                    page: currentPage,
                    page_size: pageSize,
                    search: searchQuery || '',
                    is_active:
                        statusFilter !== 'ALL'
                            ? statusFilter === 'ACTIVE'
                            : '',
                },
            });

            const data = res?.data?.data;

            setCoupons(data?.data || []);

            setTotalPages(
                data?.total_pages || 1
            );

            setTotalRecords(
                data?.total_records || 0
            );
        } catch (error) {
            const message =
                error?.response?.data?.message ||
                error.message;

            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isExecuting) return;

        setIsExecuting(true);

        try {
            if (
                !formData.code ||
                !formData.name ||
                !formData.discount_value
            ) {
                throw new Error(
                    'Please fill required fields'
                );
            }
            const data = {
                code: formData.code,
                name: formData.name,
                description: formData.description,
                coupon_type: formData.coupon_type,
                discount_value: Number(
                    formData.discount_value
                ),
                min_order_amount:
                    formData.min_order_amount !== ''
                        ? Number(
                            formData.min_order_amount
                        )
                        : 0,
                max_discount_amount:
                    formData.max_discount_amount !== ''
                        ? Number(
                            formData.max_discount_amount
                        )
                        : null,
                usage_limit:
                    formData.usage_limit !== ''
                        ? Number(
                            formData.usage_limit
                        )
                        : null,
                usage_per_user:
                    formData.usage_per_user !== ''
                        ? Number(
                            formData.usage_per_user
                        )
                        : 1,
                valid_from:
                    formData.valid_from || null,
                valid_until:
                    formData.valid_until || null,
                is_active: true,
            };

            await axios({
                method: 'POST',
                url: BASE_URL + '/coupons',
                data: data,
                headers: {
                    Authorization: token,
                },
            });

            toast.success(
                'Coupon created successfully'
            );

            setShowModal(false);

            setFormData({
                code: '',
                name: '',
                description: '',
                coupon_type: 'cart_flat',
                discount_value: '',
                min_order_amount: '',
                max_discount_amount: '',
                usage_limit: '',
                usage_per_user: 1,
                valid_from: '',
                valid_until: '',
            });

            fetchCoupons();
        } catch (error) {
            const message =
                error?.response?.data?.message ||
                error.message;

            toast.error(message);
        } finally {
            setIsExecuting(false);
        }
    };

    const handleDelete = async () => {
        if (isExecuting) return;

        setIsExecuting(true);

        try {
            await axios({
                method: 'DELETE',
                url: `${BASE_URL}/coupons/${selectedCoupon?.id}`,
                headers: {
                    Authorization: token,
                },
            });

            toast.success(
                'Coupon deleted successfully'
            );

            setShowDeleteModal(false);

            fetchCoupons();
        } catch (error) {
            const message =
                error?.response?.data?.message ||
                error.message;

            toast.error(message);
        } finally {
            setIsExecuting(false);
        }
    };

    const clearAllFilters = () => {
        setSearchQuery('');
        setStatusFilter('ALL');
    };

    return (
        <div className="p-6">
            {/* HEADER */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">
                        Coupon Management
                    </h1>

                    <p className="text-gray-600">
                        Manage platform coupons
                    </p>
                </div>

                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    <Plus size={16} />
                    Create Coupon
                </button>
            </div>

            {/* FILTERS */}
            <div className="bg-white p-4 rounded-lg border mb-6">
                <div className="flex flex-row gap-4">
                    {/* STATUS */}
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setCurrentPage(1);

                            setStatusFilter(
                                e.target.value
                            );
                        }}
                        className="px-3 py-2 border rounded-lg w-[200px]"
                    >
                        <option value="ALL">
                            All Status
                        </option>

                        <option value="ACTIVE">
                            Active
                        </option>

                        <option value="INACTIVE">
                            Inactive
                        </option>
                    </select>

                    {/* SEARCH */}
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />

                        <input
                            type="text"
                            placeholder="Search coupon..."
                            value={searchQuery}
                            onChange={(e) => {
                                setCurrentPage(1);

                                setSearchQuery(
                                    e.target.value
                                );
                            }}
                            className="w-full pl-10 pr-3 py-2 border rounded-lg"
                        />
                    </div>

                    {/* CLEAR */}
                    {(statusFilter !== 'ALL' ||
                        searchQuery) && (
                        <button
                            onClick={clearAllFilters}
                            className="h-[37.5px] w-[100px] flex items-center gap-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg px-4 text-sm font-medium"
                        >
                            <CloseOutlined
                                style={{
                                    fontSize: '14px',
                                }}
                            />

                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* TABLE */}
            <div className="bg-white border rounded-lg overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left">
                                S.No
                            </th>

                            <th className="px-4 py-3 text-left">
                                Code
                            </th>

                            <th className="px-4 py-3 text-left">
                                Name
                            </th>

                            <th className="px-4 py-3 text-left">
                                Type
                            </th>

                            <th className="px-4 py-3 text-left">
                                Discount Value
                            </th>

                            <th className="px-4 py-3 text-left">
                                Valid Until
                            </th>

                            <th className="px-4 py-3 text-left">
                                Status
                            </th>

                            <th className="px-4 py-3 text-center">
                                Action
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {coupons.map(
                            (coupon, index) => (
                                <tr
                                    key={coupon.id}
                                    className="hover:bg-gray-50"
                                >
                                    <td className="px-4 py-3">
                                        {(currentPage - 1) *
                                            pageSize +
                                            index +
                                            1}
                                    </td>

                                    <td className="px-4 py-3 font-medium">
                                        {coupon.code}
                                    </td>

                                    <td className="px-4 py-3">
                                        {coupon.name}
                                    </td>

                                    <td className="px-4 py-3">
                                        {
                                            coupon.coupon_type
                                        }
                                    </td>

                                    <td className="px-4 py-3">
                                        {
                                            coupon.discount_value
                                        }
                                    </td>

                                    <td className="px-4 py-3">
                                        {coupon.valid_until
                                            ? formatISTTime(
                                                  coupon.valid_until
                                              )
                                            : '-'}
                                    </td>

                                    <td className="px-4 py-3">
                                        <span
                                            className={`px-2 py-1 text-xs rounded ${
                                                coupon.is_active
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-red-100 text-red-700'
                                            }`}
                                        >
                                            {coupon.is_active
                                                ? 'ACTIVE'
                                                : 'INACTIVE'}
                                        </span>
                                    </td>

                                    <td className="px-4 py-3 text-center">
                                        <button
                                            onClick={() => {
                                                setSelectedCoupon(
                                                    coupon
                                                );

                                                setShowDeleteModal(
                                                    true
                                                );
                                            }}
                                        >
                                            <Trash2 className="w-4 h-4 text-red-600" />
                                        </button>
                                    </td>
                                </tr>
                            )
                        )}

                        {isLoading ? (
                            <tr>
                                <td
                                    colSpan={8}
                                    className="py-5 text-center"
                                >
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>

                                        <p className="text-sm text-gray-600">
                                            Loading...
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        ) : coupons.length ===
                          0 ? (
                            <tr>
                                <td
                                    colSpan={8}
                                    className="py-5 text-center"
                                >
                                    <p className="text-sm text-gray-600">
                                        No coupons found
                                    </p>
                                </td>
                            </tr>
                        ) : null}
                    </tbody>
                </table>
            </div>

            {/* PAGINATION */}
            {totalPages > 0 && (
                <div className="px-4 py-1 border-t border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            Showing{' '}
                            <span className="font-medium">
                                {pageSize}
                            </span>{' '}
                            rows per page
                            <span className="mx-2">
                                •
                            </span>
                            <span className="font-medium">
                                {totalRecords}
                            </span>{' '}
                            total results
                        </div>

                        {totalPages > 1 && (
                            <Pagination
                                currentPage={
                                    currentPage
                                }
                                totalPages={
                                    totalPages
                                }
                                onPageChange={
                                    setCurrentPage
                                }
                            />
                        )}
                    </div>
                </div>
            )}

            {/* CREATE MODAL */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
                    <form
                        onSubmit={handleSubmit}
                        className="bg-white w-[750px] h-[85vh] rounded-2xl shadow-xl flex flex-col overflow-hidden"
                    >
                        {/* FIXED HEADER */}
                        <div className="px-6 py-5 border-b bg-white sticky top-0 z-10">
                            <h2 className="text-xl font-semibold text-gray-800">
                                Create Coupon
                            </h2>

                            <p className="text-sm text-gray-500 mt-1">
                                Create and manage platform coupons
                            </p>
                        </div>

                        {/* SCROLLABLE CONTENT */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                {/* CODE */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">
                                        Coupon Code*
                                    </label>

                                    <input
                                        type="text"
                                        placeholder="WELCOME100"
                                        value={formData.code}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                code: e.target.value,
                                            })
                                        }
                                        className="w-full border rounded-lg p-2.5"
                                    />
                                </div>

                                {/* NAME */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">
                                        Coupon Name*
                                    </label>

                                    <input
                                        type="text"
                                        placeholder="Welcome Offer"
                                        value={formData.name}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                name: e.target.value,
                                            })
                                        }
                                        className="w-full border rounded-lg p-2.5"
                                    />
                                </div>

                                {/* TYPE */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">
                                        Coupon Type*
                                    </label>

                                    <select
                                        value={formData.coupon_type}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                coupon_type: e.target.value,
                                            })
                                        }
                                        className="w-full border rounded-lg p-2.5"
                                    >
                                        <option value="cart_flat">
                                            Cart Flat
                                        </option>

                                        <option value="cart_percentage">
                                            Cart Percentage
                                        </option>

                                        <option value="subscription_flat">
                                            Subscription Flat
                                        </option>

                                        <option value="subscription_percentage">
                                            Subscription Percentage
                                        </option>
                                    </select>
                                </div>

                                {/* DISCOUNT */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">
                                        Discount Value*
                                    </label>

                                    <input
                                        type="number"
                                        placeholder="100"
                                        value={formData.discount_value}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                discount_value:
                                                    e.target.value,
                                            })
                                        }
                                        className="w-full border rounded-lg p-2.5"
                                    />
                                </div>

                                {/* MIN ORDER */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">
                                        Min Order Amount
                                    </label>

                                    <input
                                        type="number"
                                        placeholder="500"
                                        value={formData.min_order_amount}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                min_order_amount:
                                                    e.target.value,
                                            })
                                        }
                                        className="w-full border rounded-lg p-2.5"
                                    />
                                </div>

                                {/* MAX DISCOUNT */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">
                                        Max Discount Amount
                                    </label>

                                    <input
                                        type="number"
                                        placeholder="300"
                                        value={
                                            formData.max_discount_amount
                                        }
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                max_discount_amount:
                                                    e.target.value,
                                            })
                                        }
                                        className="w-full border rounded-lg p-2.5"
                                    />
                                </div>

                                {/* USAGE LIMIT */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">
                                        Usage Limit
                                    </label>

                                    <input
                                        type="number"
                                        placeholder="100"
                                        value={formData.usage_limit}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                usage_limit:
                                                    e.target.value,
                                            })
                                        }
                                        className="w-full border rounded-lg p-2.5"
                                    />
                                </div>

                                {/* USAGE PER USER */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">
                                        Usage Per User
                                    </label>

                                    <input
                                        type="number"
                                        placeholder="1"
                                        value={formData.usage_per_user}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                usage_per_user:
                                                    e.target.value,
                                            })
                                        }
                                        className="w-full border rounded-lg p-2.5"
                                    />
                                </div>

                                {/* VALID FROM */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">
                                        Valid From
                                    </label>

                                    <input
                                        type="datetime-local"
                                        value={formData.valid_from}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                valid_from:
                                                    e.target.value,
                                            })
                                        }
                                        className="w-full border rounded-lg p-2.5"
                                    />
                                </div>

                                {/* VALID UNTIL */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">
                                        Valid Until
                                    </label>

                                    <input
                                        type="datetime-local"
                                        value={formData.valid_until}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                valid_until:
                                                    e.target.value,
                                            })
                                        }
                                        className="w-full border rounded-lg p-2.5"
                                    />
                                </div>
                            </div>

                            {/* DESCRIPTION */}
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Description
                                </label>

                                <textarea
                                    placeholder="Enter coupon description"
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            description:
                                                e.target.value,
                                        })
                                    }
                                    rows={3}
                                    className="w-full border rounded-lg p-2.5"
                                />
                            </div>
                        </div>

                        {/* FIXED FOOTER */}
                        <div className="px-6 py-4 border-t bg-white sticky bottom-0 z-10">
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowModal(false)
                                    }
                                    className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-100"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={isExecuting}
                                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {isExecuting
                                        ? 'Creating...'
                                        : 'Create Coupon'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {/* DELETE MODAL */}
            {showDeleteModal && (
                <ConfirmationModal
                    isOpen={showDeleteModal}
                    onClose={() =>
                        setShowDeleteModal(false)
                    }
                    title="Confirm Delete"
                    zIndex="z-[60]"
                    onConfirm={handleDelete}
                    confirmText="Confirm"
                    isLoading={isExecuting}
                >
                    <div className="space-y-4">
                        <p>
                            Are you sure you want to
                            delete coupon{' '}
                            <span className="font-semibold">
                                {
                                    selectedCoupon?.code
                                }
                            </span>
                            ?
                        </p>
                    </div>
                </ConfirmationModal>
            )}
        </div>
    );
}