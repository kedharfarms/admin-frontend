import { useEffect, useState } from 'react';
import { Edit, Trash2, Plus } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

import {
    ResponsiveTable, TableHeader, TableRow,
    TableCell, StatusBadge, Modal,
    Input, SelectInput
} from './ProductTableComponents';

import Pagination from '../common/Pagination';

const DEFAULT_FORM = {
    title: '',
    sub_title: '',
    price_per_delivery: '',
    validity_days: '',
    frequency: '',
    category_id: '',
    image_urls: [],
};

export default function SubscriptionPlans({
    plans = [],
    totalPages,
    pageSize,
    totalRecords,
    currentPage,
    handlePageChange,
    onRefresh,
    isLoading = false,
}) {
    const BASE_URL = process.env.REACT_APP_API_URL;
    const token = localStorage.getItem('token');

    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState(DEFAULT_FORM);

    const [showEditModal, setShowEditModal] = useState(false);
    const [editForm, setEditForm] = useState(DEFAULT_FORM);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    const [categoryOptions, setCategoryOptions] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const set = (f, v) => setForm(plan => ({ ...plan, [f]: v }));
    const setEdit = (f, v) => setEditForm(plan => ({ ...plan, [f]: v }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        try {
            setIsSubmitting(true);

            await axios.post(
                BASE_URL + '/product-management/subscription-plan',
                {
                    ...form,
                    price_per_delivery: Number(form.price_per_delivery),
                    validity_days: Number(form.validity_days),
                },
                { headers: { Authorization: token } }
            );

            toast.success('Plan created');
            setShowModal(false);
            setForm(DEFAULT_FORM);
            onRefresh();
        } catch (e) {
            toast.error(e?.response?.data?.message || e.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        try {
            setIsSubmitting(true);

            await axios.put(
                `${BASE_URL}/product-management/subscription-plan/${selectedId}`,
                {
                    ...editForm,
                    price_per_delivery: Number(editForm.price_per_delivery),
                    validity_days: Number(editForm.validity_days),
                },
                { headers: { Authorization: token } }
            );

            toast.success('Updated');
            setShowEditModal(false);
            onRefresh();
        } catch (e) {
            toast.error(e?.response?.data?.message || e.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (isSubmitting) return;

        try {
            setIsSubmitting(true);

            await axios.delete(
                `${BASE_URL}/product-management/subscription-plan/${selectedId}`,
                { headers: { Authorization: token } }
            );

            toast.success('Deleted');
            setShowDeleteModal(false);
            onRefresh();
        } catch (e) {
            toast.error(e?.response?.data?.message || e.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const fetchCategoryOptions = async () => {
        const res = await axios.get(
            `${BASE_URL}/product-management/categories/options`,
            { headers: { Authorization: token } }
        );

        setCategoryOptions(
            (res.data.data || []).map(c => ({
                label: c.name,
                value: c.id
            }))
        );
    };

    useEffect(() => {
        fetchCategoryOptions();
    }, []);

    const handleImageChange = (val, isEdit = false) => {
        const urls = val.split(',').map(x => x.trim()).filter(Boolean);
        isEdit ? setEdit('image_urls', urls) : set('image_urls', urls);
    };

    return (
        <>
            <div className="mb-4 flex justify-end">
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                    <Plus /> Add Plan
                </button>
            </div>

            <ResponsiveTable>
                <thead>
                    <tr>
                        <TableHeader>ID</TableHeader>
                        <TableHeader>Title</TableHeader>
                        <TableHeader>Category</TableHeader>
                        <TableHeader>Price/Delivery</TableHeader>
                        <TableHeader>Days</TableHeader>
                        <TableHeader>Freq</TableHeader>
                        <TableHeader>Status</TableHeader>
                        <TableHeader>Actions</TableHeader>
                    </tr>
                </thead>

                <tbody>
                    {plans.map((plan, i) => (
                        <TableRow key={plan.id}>
                            <TableCell>{i + 1}</TableCell>
                            <TableCell>{plan.title}-{plan.sub_title}</TableCell>
                            <TableCell>{plan.category?.name}</TableCell>
                            <TableCell>₹{plan.price_per_delivery}</TableCell>
                            <TableCell>{plan.validity_days}</TableCell>
                            <TableCell>{plan.frequency}</TableCell>
                            <TableCell>
                                <StatusBadge active={plan.is_active} />
                            </TableCell>
                            <TableCell>
                                <div className="flex gap-2">
                                    <button onClick={() => {
                                        setSelectedId(plan.id);
                                        setEditForm(plan);
                                        setShowEditModal(true);
                                    }}>
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => {
                                        setSelectedId(plan.id);
                                        setShowDeleteModal(true);
                                    }}>
                                            <Trash2 className="w-4 h-4 text-red-600" />
                                    </button>
                                </div>
                            </TableCell>
                        </TableRow>
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
                    ) : plans.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="py-5 text-center text-gray-500">
                                No Plan found
                            </td>
                        </tr>
                    ) : null}
                </tbody>
            </ResponsiveTable>

            {/* CREATE MODAL */}
            {showModal && (
                <Modal
                    title="Add Subscription Plan"
                    disabled={isSubmitting}
                    onClose={() => {
                        setShowModal(false);
                        setForm(DEFAULT_FORM);
                    }}
                >
                    <form onSubmit={handleSubmit} className="space-y-4">

                        <Input
                            label="Title *"
                            value={form.title}
                            onChange={(e) => set('title', e.target.value)}
                            required
                        />

                        <Input
                            label="Sub Title *"
                            value={form.sub_title}
                            onChange={(e) => set('sub_title', e.target.value)}
                            required
                        />

                        <Input
                            label="Price Per Delivery *"
                            type="number"
                            value={form.price_per_delivery}
                            onChange={(e) => set('price_per_delivery', e.target.value)}
                            required
                        />

                        <Input
                            label="Validity (Days) *"
                            type="number"
                            value={form.validity_days}
                            onChange={(e) => set('validity_days', e.target.value)}
                            required
                        />

                        <SelectInput
                            label="Frequency *"
                            value={form.frequency}
                            onChange={(e) => set('frequency', e.target.value)}
                            options={[
                                { label: 'Daily', value: 'daily' },
                                { label: 'Alternate', value: 'alternate' },
                                { label: 'Weekly', value: 'weekly' },
                            ]}
                            placeholder="Select Frequency"
                            required
                        />

                        <SelectInput
                            label="Category *"
                            value={form.category_id}
                            onChange={(e) => set('category_id', e.target.value)}
                            options={categoryOptions}
                            placeholder="Select Category"
                            required
                        />

                        <Input
                            label="Image URLs (comma separated)"
                            placeholder="https://..., https://..."
                            onChange={(e) => handleImageChange(e.target.value)}
                        />

                        <div className="flex gap-2 pt-2">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
                            >
                                {isSubmitting ? 'Creating...' : 'Create Plan'}
                            </button>

                            <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={() => {
                                    setShowModal(false);
                                    setForm(DEFAULT_FORM);
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                        </div>

                    </form>
                </Modal>
            )}

            {/* DELETE MODAL */}
            {showDeleteModal && (
                <Modal title="Delete Plan" onClose={() => setShowDeleteModal(false)}>
                    <div className="space-y-4">
                        <p className="text-gray-600">
                            This action cannot be undone. Are you sure you want to delete this plan?
                        </p>
                        <div className="flex flex-row gap-2 pt-2">
                            <button
                                onClick={handleDelete}
                                disabled={isSubmitting}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                            >
                                {isSubmitting ? 'Deleting...' : 'Delete'}
                            </button>

                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setSelectedId(null);
                                }}
                                className="flex-1 px-4 py-2 border rounded-lg"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* EDIT MODAL */}
            {showEditModal && (
                <Modal
                    title="Edit Subscription Plan"
                    disabled={isSubmitting}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedId(null);
                        setEditForm(DEFAULT_FORM);
                    }}
                >
                    <form onSubmit={handleUpdate} className="space-y-4">

                        <Input
                            label="Title *"
                            value={editForm.title}
                            onChange={(e) => setEdit('title', e.target.value)}
                            required
                        />

                        <Input
                            label="Sub Title *"
                            value={editForm.sub_title}
                            onChange={(e) => setEdit('sub_title', e.target.value)}
                            required
                        />

                        <Input
                            label="Price Per Delivery *"
                            type="number"
                            value={editForm.price_per_delivery}
                            onChange={(e) => setEdit('price_per_delivery', e.target.value)}
                            required
                        />

                        <Input
                            label="Validity (Days) *"
                            type="number"
                            value={editForm.validity_days}
                            onChange={(e) => setEdit('validity_days', e.target.value)}
                            required
                        />

                        <SelectInput
                            label="Frequency *"
                            value={editForm.frequency}
                            onChange={(e) => setEdit('frequency', e.target.value)}
                            options={[
                                { label: 'Daily', value: 'daily' },
                                { label: 'Alternate', value: 'alternate' },
                                { label: 'Weekly', value: 'weekly' },
                            ]}
                            placeholder="Select Frequency"
                            required
                        />

                        <SelectInput
                            label="Category *"
                            value={editForm.category_id}
                            onChange={(e) => setEdit('category_id', e.target.value)}
                            options={categoryOptions}
                            placeholder="Select Category"
                            required
                        />

                        <Input
                            label="Image URLs (comma separated)"
                            value={(editForm.image_urls || []).join(', ')}
                            placeholder="https://..., https://..."
                            onChange={(e) => handleImageChange(e.target.value, true)}
                        />

                        <div className="flex gap-2 pt-2">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
                            >
                                {isSubmitting ? 'Updating...' : 'Update Plan'}
                            </button>

                            <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={() => {
                                    setShowEditModal(false);
                                    setSelectedId(null);
                                    setEditForm(DEFAULT_FORM);
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                        </div>

                    </form>
                </Modal>
            )}
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
                            onPageChange={handlePageChange}
                        />
                    )}
                    </div>
                </div>
            )}
        </>
    );
}