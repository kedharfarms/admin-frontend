import { useEffect, useState } from 'react';
import { Edit, Trash2, Plus } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

import {
    ResponsiveTable, TableHeader, TableRow,
    TableCell, StatusBadge, Modal,
    Input, SelectInput
} from './ProductTableComponents.jsx';

import Pagination from '../common/Pagination';
import { unitOptions, productTypeOptions, PRODUCT_TYPE } from '../../constants/commonConstants.js';

const DEFAULT_FORM = {
    name: '',
    category_id: '',
    base_unit: 'ltr',
    product_type: PRODUCT_TYPE.SIMPLE,
};

export default function Products({
    products = [],
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

    const set = (field, value) =>
        setForm((prev) => ({ ...prev, [field]: value }));

    const openCreateModal = () => {
        setForm({
            ...DEFAULT_FORM,
            category_id: categoryOptions[0]?.value ?? '',
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        try {
            setIsSubmitting(true);

            await axios({
                method: 'POST',
                url: BASE_URL + '/product-management/products',
                headers: {
                    Authorization: token,
                },
                data: {
                    name: form.name,
                    category_id: form.category_id,
                    base_unit: form.product_type === PRODUCT_TYPE.COMBO ? null : form.base_unit,
                    product_type: form.product_type,
                },
            });

            toast.success(`Product "${form.name}" created successfully!`);

            setShowModal(false);
            setForm(DEFAULT_FORM);
            onRefresh();
        } catch (error) {
            const message =
                error?.response?.data?.message || error.message;

            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (product) => {
        setSelectedId(product.id);

        setEditForm({
            name: product.name || '',
            category_id: product.category_id || '',
            base_unit: product.base_unit || 'ltr',
            product_type: product.product_type || PRODUCT_TYPE.SIMPLE,
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
                url: `${BASE_URL}/product-management/products/${selectedId}`,
                headers: {
                    Authorization: token,
                },
                data: {
                    name: editForm.name,
                    category_id: editForm.category_id,
                    base_unit: editForm.product_type === PRODUCT_TYPE.COMBO ? null : editForm.base_unit,
                    product_type: editForm.product_type,
                },
            });

            toast.success('Product updated successfully');

            setShowEditModal(false);
            setEditForm(DEFAULT_FORM);
            setSelectedId(null);

            onRefresh();
        } catch (error) {
            const message =
                error?.response?.data?.message || error.message;

            toast.error(message);
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
                url: `${BASE_URL}/product-management/products/${selectedId}`,
                headers: {
                    Authorization: token,
                },
            });

            toast.success('Product deleted successfully');

            setShowDeleteModal(false);
            setSelectedId(null);

            onRefresh();
        } catch (error) {
            const message =
                error?.response?.data?.message || error.message;

            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const fetchCategoryOptions = async () => {
        try {
            const response = await axios({
                method: 'GET',
                url: `${BASE_URL}/product-management/categories/options`,
                headers: {
                    Authorization: token,
                },
            });

            const data = response?.data?.data || [];

            const options = data.map((c) => ({
                label: c.name,
                value: c.id,
            }));

            setCategoryOptions(options);
        } catch (error) {
            toast.error('Failed to load categories');
        }
    };

    useEffect(() => {
        fetchCategoryOptions();
    }, []);

    useEffect(() => {
        if (categoryOptions.length > 0) {
            setForm((prev) => ({
                ...prev,
                category_id: prev.category_id || categoryOptions[0].value,
            }));
        }
    }, [categoryOptions]);

    return (
        <>
            {/* Header */}
            <div className="mb-4 flex justify-end items-center">
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    <Plus className="w-5 h-5" />
                    <span className="hidden sm:inline">Add Product</span>
                    <span className="sm:hidden">Add</span>
                </button>
            </div>

            {/* Table */}
            <ResponsiveTable>
                <thead>
                    <tr>
                        <TableHeader>ID</TableHeader>
                        <TableHeader>Name</TableHeader>
                        <TableHeader>Category</TableHeader>
                        <TableHeader>Type</TableHeader>
                        <TableHeader>Base Unit</TableHeader>
                        <TableHeader>Status</TableHeader>
                        <TableHeader>Actions</TableHeader>
                    </tr>
                </thead>

                <tbody>
                    {isLoading ? (
                        <tr>
                            <td colSpan={7} className="py-5 text-center">
                                <div className="flex flex-col items-center">
                                    <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                                    Loading...
                                </div>
                            </td>
                        </tr>
                    ) : products.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="py-5 text-center text-gray-500">
                                No products found
                            </td>
                        </tr>
                    ) : (
                        products.map((product, index) => (
                            <TableRow key={product.id}>
                                <TableCell>
                                    {(currentPage - 1) * pageSize + index + 1}
                                </TableCell>

                                <TableCell className="font-medium">
                                    {product.name}
                                </TableCell>

                                <TableCell>
                                    {product?.category?.name || '—'}
                                </TableCell>

                                <TableCell>
                                    <span className={`px-2 py-1 text-xs rounded ${
                                        product.product_type === PRODUCT_TYPE.COMBO
                                            ? 'bg-purple-100 text-purple-800'
                                            : 'bg-gray-100 text-gray-700'
                                    }`}>
                                        {product.product_type === PRODUCT_TYPE.COMBO ? 'Combo' : 'Simple'}
                                    </span>
                                </TableCell>

                                <TableCell>
                                    {product.product_type === PRODUCT_TYPE.COMBO ? (
                                        '—'
                                    ) : (
                                        <span className="px-2 py-1 text-xs bg-blue-100 rounded">
                                            {product.base_unit}
                                        </span>
                                    )}
                                </TableCell>

                                <TableCell>
                                    <StatusBadge active={product.is_active} />
                                </TableCell>

                                <TableCell>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(product)}
                                            className="p-1 hover:bg-gray-100 rounded"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>

                                        <button
                                            onClick={() => openDeleteModal(product.id)}
                                            className="p-1 hover:bg-gray-100 rounded"
                                        >
                                            <Trash2 className="w-4 h-4 text-red-600" />
                                        </button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </tbody>
            </ResponsiveTable>

            {/* CREATE MODAL */}
            {showModal && (
                <Modal title="Add Product" size="lg" onClose={() => setShowModal(false)}>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="Product Name"
                            value={form.name}
                            onChange={(e) => set('name', e.target.value)}
                            required
                        />

                        <SelectInput
                            label="Category"
                            value={form.category_id}
                            onChange={(e) => set('category_id', e.target.value)}
                            options={categoryOptions}
                            placeholder="Select Category"
                            required
                        />

                        <SelectInput
                            label="Product Type"
                            value={form.product_type}
                            onChange={(e) => set('product_type', e.target.value)}
                            options={productTypeOptions}
                        />

                        {form.product_type !== PRODUCT_TYPE.COMBO && (
                            <SelectInput
                                label="Base Unit"
                                value={form.base_unit}
                                onChange={(e) => set('base_unit', e.target.value)}
                                options={unitOptions}
                            />
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-blue-600 text-white py-2 rounded"
                        >
                            {isSubmitting ? 'Creating...' : 'Create'}
                        </button>
                    </form>
                </Modal>
            )}

            {/* EDIT MODAL */}
            {showEditModal && (
                <Modal title="Edit Product" size="lg" onClose={() => setShowEditModal(false)}>
                    <form onSubmit={handleUpdate} className="space-y-4">
                        <Input
                            label="Product Name"
                            value={editForm.name}
                            onChange={(e) =>
                                setEditForm({ ...editForm, name: e.target.value })
                            }
                        />

                        <SelectInput
                            label="Category"
                            value={editForm.category_id}
                            onChange={(e) =>
                                setEditForm({ ...editForm, category_id: e.target.value })
                            }
                            options={categoryOptions}
                        />

                        <SelectInput
                            label="Product Type"
                            value={editForm.product_type}
                            onChange={(e) =>
                                setEditForm({ ...editForm, product_type: e.target.value })
                            }
                            options={productTypeOptions}
                        />

                        {editForm.product_type !== PRODUCT_TYPE.COMBO && (
                            <SelectInput
                                label="Base Unit"
                                value={editForm.base_unit}
                                onChange={(e) =>
                                    setEditForm({ ...editForm, base_unit: e.target.value })
                                }
                                options={unitOptions}
                            />
                        )}

                        <button className="w-full bg-blue-600 text-white py-2 rounded">
                            Update
                        </button>
                    </form>
                </Modal>
            )}

            {/* DELETE MODAL */}
            {showDeleteModal && (
                <Modal title="Delete Product" onClose={() => setShowDeleteModal(false)}>
                    <div className="space-y-4">
                        <p>Are you sure you want to delete this product?</p>

                        <div className="flex gap-2">
                            <button
                                onClick={handleDelete}
                                className="flex-1 bg-red-600 text-white py-2 rounded"
                            >
                                Delete
                            </button>

                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 border py-2 rounded"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Pagination */}
            {totalPages > 0 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            )}
        </>
    );
}