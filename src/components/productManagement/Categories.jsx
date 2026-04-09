// components/ProductManagement/Categories.jsx

import { useEffect, useState } from 'react';
import { Edit, Trash2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import {
    ResponsiveTable, TableHeader, TableRow,
    TableCell, StatusBadge, Modal, Input, SelectInput, Textarea, Toggle,
} from './ProductTableComponents';
import Pagination from '../common/Pagination';
import axios from 'axios';

const DEFAULT_FORM = {
    name: '',
    description: '',
    parent_id: '',
    is_opening_soon: false,
    image_url: '',
};

export default function Categories({ 
    categories,
    totalPages,
    pageSize,
    totalRecords,
    currentPage,
    isLoading = false,
    handlePageChange,
    onRefresh
}) {
    const BASE_URL = process.env.REACT_APP_API_URL;
    const token = localStorage.getItem('token');

    const [showModal, setShowModal] = useState(false);
    const [form, setForm]           = useState(DEFAULT_FORM);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [parentOptions, setParentOptions] = useState([]);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editForm, setEditForm] = useState(DEFAULT_FORM);
    const [selectedId, setSelectedId] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isSubmitting) return;

        try {
            setIsSubmitting(true);

            const response = await axios({
                method: 'POST',
                url: BASE_URL + '/product-management/categories',
                headers: {
                    Authorization: token,
                },
                data: {
                    name: form.name,
                    description: form.description,
                    parent_id: form.parent_id || null,
                    image_url: form.image_url || null,
                    is_opening_soon: form.is_opening_soon
                },
            });

            toast.success(`Category "${form.name}" created successfully!`);

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

    const fetchCategoryOptions = async () => {

        try {
            const response = await axios({
                method: 'GET',
                url: `${BASE_URL}/product-management/categories/options`,
                headers: {
                    Authorization: token,
                },
            });

            const data =  response?.data?.data || [];
            let options = data.map((c) => ({
                label: c.name,
                value: c.id,
            }));

            setParentOptions(options);
        } catch (error) {
            throw error;
        }
    };

    useEffect(() => {
        fetchCategoryOptions();
    }, []);

    const handleEdit = (category) => {
        setSelectedId(category.id);

        setEditForm({
            name: category.name || '',
            description: category.description || '',
            parent_id: category.parent_id || '',
            image_url: category.image_url || '',
            is_opening_soon: category.is_opening_soon || false,
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
                url: `${BASE_URL}/product-management/categories/${selectedId}`,
                headers: {
                    Authorization: token,
                },
                data: {
                    name: editForm.name,
                    description: editForm.description,
                    parent_id: editForm.parent_id || null,
                    image_url: editForm.image_url || null,
                    is_opening_soon: editForm.is_opening_soon,
                },
            });

            toast.success('Category updated successfully');
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

    const handleDelete = async () => {

        if (isSubmitting) return;
        try {
            setIsSubmitting(true);

            await axios({
                method: 'DELETE',
                url: `${BASE_URL}/product-management/categories/${selectedId}`,
                headers: {
                    Authorization: token,
                },
            });

            setShowDeleteModal(false);
            setSelectedId(null);

            toast.success('Category deleted successfully');
            onRefresh();

        } catch (error) {
            const message =
                error?.response?.data?.message || error.message;

            toast.error(message);
        }
        finally{
            setIsSubmitting(false)
        }
    };

    const openDeleteModal = (id) => {
        setSelectedId(id);
        setShowDeleteModal(true);
    };

    return (
        <>
            {/* Header */}
            <div className="mb-4 flex justify-end items-center">
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    <span className="hidden sm:inline">Add Category</span>
                    <span className="sm:hidden">Add</span>
                </button>
            </div>

            {/* Table */}
            <ResponsiveTable>
                <thead>
                    <tr>
                        <TableHeader>ID</TableHeader>
                        <TableHeader>Name</TableHeader>
                        <TableHeader>Description</TableHeader>
                        <TableHeader>Parent Category</TableHeader>
                        <TableHeader>Opening Soon</TableHeader>
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
                    ) : categories.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="py-5 text-center text-gray-500">
                                No categories found
                            </td>
                        </tr>
                    ) : null}
                    {categories.map((category, index) => {
                        const parent = category?.parent;
                        return (
                            <TableRow key={category.id}>
                                <TableCell>{
                                    (currentPage - 1) * pageSize + index + 1
                                }</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        {category.image_url && (
                                            <img
                                                src={category.image_url}
                                                alt={category.name}
                                                className="w-7 h-7 rounded object-cover"
                                            />
                                        )}
                                        <span className="font-medium">{category.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-gray-500 max-w-[200px] truncate">
                                    {category.description || '—'}
                                </TableCell>
                                <TableCell>
                                    {parent ? (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                            {parent.name}
                                        </span>
                                    ) : (
                                        <span className="text-gray-400 text-xs">Root</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        category.is_opening_soon
                                            ? 'bg-yellow-100 text-yellow-800'
                                            : 'bg-gray-100 text-gray-600'
                                    }`}>
                                        {category.is_opening_soon ? 'Yes' : 'No'}
                                    </span>
                                </TableCell>
                                <TableCell><StatusBadge active={category.is_active} /></TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(category)}
                                            className="p-1 hover:bg-gray-100 rounded"
                                        >
                                            <Edit className="w-4 h-4 text-gray-600" />
                                        </button>

                                        <button
                                            onClick={() => openDeleteModal(category.id)}
                                            className="p-1 hover:bg-gray-100 rounded"
                                        >
                                            <Trash2 className="w-4 h-4 text-red-600" />
                                        </button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </tbody>
            </ResponsiveTable>

            {/* Modal */}
            {showModal && (
                <Modal title="Add Category" disabled={isSubmitting} onClose={
                    () => {
                        setShowModal(false);
                        setForm(DEFAULT_FORM);
                    }
                } >
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="Name *"
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
                            label="Parent Category"
                            value={form.parent_id}
                            onChange={(e) => set('parent_id', e.target.value)}
                            options={parentOptions}
                            placeholder="None (Root category)"
                        />
                        <Input
                            label="Image URL"
                            value={form.image_url}
                            onChange={(e) => set('image_url', e.target.value)}
                            placeholder="https://..."
                        />
                        <Toggle
                            label="Opening Soon"
                            checked={form.is_opening_soon}
                            onChange={(val) => set('is_opening_soon', val)}
                        />
                        <div className="flex gap-2 pt-2">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
                            >
                                {isSubmitting ? 'Creating...' : 'Create Category'}
                            </button>
                            <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={
                                    () => {
                                        setShowModal(false);
                                        setForm(DEFAULT_FORM);
                                    }
                                }
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {showEditModal && (
                <Modal
                    title="Edit Category"
                    disabled={isSubmitting}
                    onClose={() => {
                        setShowEditModal(false);
                        setEditForm(DEFAULT_FORM);
                        setSelectedId(null);
                    }}
                >
                    <form onSubmit={handleUpdate} className="space-y-4">
                        <Input
                            label="Name *"
                            value={editForm.name}
                            onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                            required
                        />

                        <Textarea
                            label="Description"
                            value={editForm.description}
                            onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                        />

                        <SelectInput
                            label="Parent Category"
                            value={editForm.parent_id}
                            onChange={(e) => setEditForm(prev => ({ ...prev, parent_id: e.target.value }))}
                            options={parentOptions}
                            placeholder="None (Root category)"
                        />

                        <Input
                            label="Image URL"
                            value={editForm.image_url}
                            onChange={(e) => setEditForm(prev => ({ ...prev, image_url: e.target.value }))}
                        />

                        <Toggle
                            label="Opening Soon"
                            checked={editForm.is_opening_soon}
                            onChange={(val) => setEditForm(prev => ({ ...prev, is_opening_soon: val }))}
                        />

                        <div className="flex gap-2 pt-2">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
                            >
                                {isSubmitting ? 'Updating...' : 'Update Category'}
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

            {showDeleteModal && (
                <Modal
                    title="Delete Category"
                    onClose={() => {
                        setShowDeleteModal(false);
                        setSelectedId(null);
                    }}
                    disabled={isSubmitting}
                >
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