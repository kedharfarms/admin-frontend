import { useEffect, useState } from 'react';
import { Edit, Trash2, Plus } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

import {
    ResponsiveTable, TableHeader, TableRow,
    TableCell, StatusBadge, Modal,
    Input, SelectInput, Textarea
} from './ProductTableComponents';

import Pagination from '../common/Pagination';

const DEFAULT_FORM = {
    name: '',
    description: '',
    product_id: '',
    unit_quantity: '',
    mrp: '',
    image_urls: [],
};

export default function ProductVariants({
    variants = [],
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

    const [productOptions, setProductOptions] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const set = (field, value) =>
        setForm((prev) => ({ ...prev, [field]: value }));

    const setEdit = (field, value) =>
        setEditForm((prev) => ({ ...prev, [field]: value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        try {
            setIsSubmitting(true);

            await axios({
                method: 'POST',
                url: BASE_URL + '/product-management/product-variants',
                headers: { Authorization: token },
                data: {
                    ...form,
                    unit_quantity: Number(form.unit_quantity),
                    mrp: Number(form.mrp),
                },
            });

            toast.success(`Variant "${form.name}" created`);

            setShowModal(false);
            setForm(DEFAULT_FORM);
            onRefresh();
        } catch (error) {
            toast.error(error?.response?.data?.message || error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (variant) => {
        setSelectedId(variant.id);

        setEditForm({
            name: variant.name || '',
            description: variant.description || '',
            product_id: variant.product_id || '',
            unit_quantity: variant.unit_quantity || '',
            mrp: variant.mrp || '',
            image_urls: variant.image_urls || [],
        });

        setShowEditModal(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        try {
            setIsSubmitting(true);

            await axios({
                method: 'PUT',
                url: `${BASE_URL}/product-management/product-variants/${selectedId}`,
                headers: { Authorization: token },
                data: {
                    ...editForm,
                    unit_quantity: Number(editForm.unit_quantity),
                    mrp: Number(editForm.mrp),
                },
            });

            toast.success('Variant updated');

            setShowEditModal(false);
            setEditForm(DEFAULT_FORM);
            setSelectedId(null);

            onRefresh();
        } catch (error) {
            toast.error(error?.response?.data?.message || error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const openDeleteModal = (id) => {
        setSelectedId(id);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        if (isSubmitting) return;

        try {
            setIsSubmitting(true);

            await axios({
                method: 'DELETE',
                url: `${BASE_URL}/product-management/product-variants/${selectedId}`,
                headers: { Authorization: token },
            });

            toast.success('Variant deleted');

            setShowDeleteModal(false);
            setSelectedId(null);

            onRefresh();
        } catch (error) {
            toast.error(error?.response?.data?.message || error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const fetchProductOptions = async () => {
        try {
            const response = await axios({
                method: 'GET',
                url: `${BASE_URL}/product-management/products/options`,
                headers: { Authorization: token },
            });

            const options = (response?.data?.data || []).map((p) => ({
                label: `${p.name} (${p.base_unit})`,
                value: p.id,
            }));

            setProductOptions(options);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchProductOptions();
    }, []);

    const handleImageChange = (value, isEdit = false) => {
        const urls = value.split(',').map((u) => u.trim()).filter(Boolean);

        if (isEdit) {
            setEdit('image_urls', urls);
        } else {
            set('image_urls', urls);
        }
    };

    return (
        <>
            {/* Header */}
            <div className="mb-4 flex justify-end">
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                    <Plus className="w-5 h-5" />
                    Add Variant
                </button>
            </div>

            {/* Table */}
            <ResponsiveTable>
                <thead>
                    <tr>
                        <TableHeader>ID</TableHeader>
                        <TableHeader>Name</TableHeader>
                        <TableHeader>Product</TableHeader>
                        <TableHeader>Qty</TableHeader>
                        <TableHeader>MRP</TableHeader>
                        <TableHeader>Images</TableHeader>
                        <TableHeader>Status</TableHeader>
                        <TableHeader>Actions</TableHeader>
                    </tr>
                </thead>

                <tbody>
                    {isLoading ? (
                        <tr>
                            <td colSpan={7} className="py-5 text-center">
                                <div className="flex flex-col items-center justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
                                    <p className="text-sm text-gray-600">Loading...</p>
                                </div>
                            </td>
                        </tr>
                    ) : variants.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="py-5 text-center text-gray-500">
                                No Variants found
                            </td>
                        </tr>
                    ) : null}
                    {variants.map((variant, index) => (
                        <TableRow key={variant.id}>
                            <TableCell>
                                {(currentPage - 1) * pageSize + index + 1}
                            </TableCell>

                            <TableCell>
                                <div className="font-medium">{variant.name}</div>
                                <div className="text-xs text-gray-500">
                                    {variant.description}
                                </div>
                            </TableCell>

                            <TableCell>
                                {variant.product?.name || '—'}
                            </TableCell>

                            <TableCell>
                                {variant.unit_quantity} {variant.product?.base_unit}
                            </TableCell>

                            <TableCell>₹{variant.mrp}</TableCell>

                            <TableCell>
                                <div className="flex gap-1">
                                    {variant.image_urls?.slice(0, 2).map((img, i) => (
                                        <img key={i} src={img} className="w-8 h-8 rounded" />
                                    ))}
                                </div>
                            </TableCell>

                            <TableCell>
                                <StatusBadge active={variant.is_active} />
                            </TableCell>

                            <TableCell>
                                <div className="flex gap-2">
                                    <button onClick={() => handleEdit(variant)}>
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => openDeleteModal(variant.id)}>
                                        <Trash2 className="w-4 h-4 text-red-600" />
                                    </button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </tbody>
            </ResponsiveTable>

            {/* CREATE MODAL */}
            {showModal && (
                <Modal
                    title="Add Product Variant"
                    disabled={isSubmitting}
                    onClose={() => {
                        setShowModal(false);
                        setForm(DEFAULT_FORM);
                    }}
                >
                    <form onSubmit={handleSubmit} className="space-y-4">

                        <Input
                            label="Variant Name *"
                            value={form.name}
                            onChange={(e) => set('name', e.target.value)}
                            required
                        />

                        <Textarea
                            label="Description"
                            value={form.description}
                            onChange={(e) => set('description', e.target.value)}
                        />

                        <SelectInput
                            label="Product *"
                            value={form.product_id}
                            onChange={(e) => set('product_id', e.target.value)}
                            options={productOptions}
                            placeholder="Select Product"
                            required
                        />

                        <Input
                            label="Unit Quantity *"
                            type="number"
                            value={form.unit_quantity}
                            onChange={(e) => set('unit_quantity', e.target.value)}
                            required
                        />

                        <Input
                            label="MRP *"
                            type="number"
                            value={form.mrp}
                            onChange={(e) => set('mrp', e.target.value)}
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
                                {isSubmitting ? 'Creating...' : 'Create Variant'}
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
            
            {/* EDIT MODAL */}
            {showEditModal && (
                <Modal
                    title="Edit Product Variant"
                    disabled={isSubmitting}
                    onClose={() => {
                        setShowEditModal(false);
                        setEditForm(DEFAULT_FORM);
                        setSelectedId(null);
                    }}
                >
                    <form onSubmit={handleUpdate} className="space-y-4">

                        <Input
                            label="Variant Name *"
                            value={editForm.name}
                            onChange={(e) => setEdit('name', e.target.value)}
                            required
                        />

                        <Textarea
                            label="Description"
                            value={editForm.description}
                            onChange={(e) => setEdit('description', e.target.value)}
                        />

                        <SelectInput
                            label="Product *"
                            value={editForm.product_id}
                            onChange={(e) => setEdit('product_id', e.target.value)}
                            options={productOptions}
                            placeholder="Select Product"
                            required
                        />

                        <Input
                            label="Unit Quantity *"
                            type="number"
                            value={editForm.unit_quantity}
                            onChange={(e) => setEdit('unit_quantity', e.target.value)}
                            required
                        />

                        <Input
                            label="MRP *"
                            type="number"
                            value={editForm.mrp}
                            onChange={(e) => setEdit('mrp', e.target.value)}
                            required
                        />

                        <Input
                            label="Image URLs (comma separated)"
                            placeholder="https://..., https://..."
                            onChange={(e) => handleImageChange(e.target.value, true)}
                        />

                        <div className="flex gap-2 pt-2">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
                            >
                                {isSubmitting ? 'Updating...' : 'Update Variant'}
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setShowEditModal(false);
                                    setEditForm(DEFAULT_FORM);
                                    setSelectedId(null);
                                }}
                                className="px-4 py-2 border rounded-lg"
                            >
                                Cancel
                            </button>
                        </div>

                    </form>
                </Modal>
            )}

            {/* DELETE MODAL */}
            {showDeleteModal && (
                <Modal title="Delete Variant" onClose={() => setShowDeleteModal(false)}>
                    <div className="space-y-4">
                        <p className="text-gray-600">
                            This action cannot be undone. Are you sure you want to delete this category?
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