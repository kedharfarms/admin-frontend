import { useEffect, useState } from 'react';
import { Edit2, Search } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Pagination from '../components/common/Pagination';
import {
    ResponsiveTable,
    TableHeader,
    TableRow,
    TableCell,
    Modal,
    Input
} from '../components/productManagement/ProductTableComponents';

export function InventoryManagement() {
    const BASE_URL = process.env.REACT_APP_API_URL;
    const token = localStorage.getItem('token');

    const [inventory, setInventory] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);

    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [quantity, setQuantity] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchInventory = async () => {
        if (isLoading) return;

        try {
            setIsLoading(true);

            const res = await axios({
                method: 'GET',
                url: `${BASE_URL}/inventory-management`,
                headers: { Authorization: token },
                params: {
                    page: currentPage,
                    page_size: pageSize,
                    search: searchTerm,
                },
            });

            const data = res?.data?.data;

            setInventory(data?.data || []);
            setTotalPages(data?.total_pages || 1);
            setTotalRecords(data?.total_records || 0);

        } catch (error) {
            const message =
                error?.response?.data?.message || error.message;
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchInventory();
        }, 400);

        return () => clearTimeout(timer);
    }, [currentPage, searchTerm]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleEdit = (item) => {
        setSelectedItem(item);
        setQuantity(item.available || 0);
        setShowModal(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        try {
            setIsSubmitting(true);

            await axios({
                method: 'PUT',
                url: `${BASE_URL}/inventory-management/${selectedItem.id}`,
                headers: { Authorization: token },
                data: {
                    available: Number(quantity),
                },
            });

            toast.success('Inventory updated successfully');

            setShowModal(false);
            setSelectedItem(null);
            setQuantity(0);

            fetchInventory();

        } catch (error) {
            const message =
                error?.response?.data?.message || error.message;
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-4 md:p-6 lg:p-8">

            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold mb-2">
                    Inventory Management
                </h1>
                <p className="text-gray-600">
                    Manage product stock levels
                </p>
            </div>

            {/* Search */}
            <div className="mb-6 flex">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search by product..."
                        value={searchTerm}
                        onChange={(e) => {
                            setCurrentPage(1); // 🔥 reset page
                            setSearchTerm(e.target.value);
                        }}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Table */}
            <ResponsiveTable>
                <thead>
                    <tr>
                        <TableHeader>ID</TableHeader>
                        <TableHeader>Product</TableHeader>
                        <TableHeader>Available</TableHeader>
                        <TableHeader>Committed</TableHeader>
                        <TableHeader>Total Stock</TableHeader>
                        <TableHeader>Actions</TableHeader>
                    </tr>
                </thead>

                <tbody>
                    {inventory.length === 0 && isLoading && (
                        <tr>
                            <td colSpan={6} className="py-5 text-center">
                                <div className="flex flex-col items-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
                                    <p className="text-sm text-gray-600">Loading...</p>
                                </div>
                            </td>
                        </tr>
                    )}

                    {inventory.map((item, index) => {
                        const total = item.available + item.committed;

                        return (
                            <TableRow key={item.id}>
                                <TableCell>
                                    {(currentPage - 1) * pageSize + index + 1}
                                </TableCell>

                                <TableCell className="font-medium">
                                    {item.product_name}
                                    <span className="px-2 py-1 ml-2 text-xs bg-blue-100 rounded">
                                        {item.base_unit}
                                    </span>
                                </TableCell>

                                <TableCell>{item.available}</TableCell>
                                <TableCell>{item.committed}</TableCell>
                                <TableCell>{total}</TableCell>

                                <TableCell>
                                    <button
                                        onClick={() => handleEdit(item)}
                                        className="flex items-center gap-2 px-2 py-1 text-blue-600 hover:bg-blue-50 rounded"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                        Update
                                    </button>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </tbody>
            </ResponsiveTable>

            {/* Pagination */}
            {totalPages > 0 && (
                <div className="px-4 py-2 border-t bg-gray-50">
                    <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                            Showing <b>{pageSize}</b> rows • <b>{totalRecords}</b> total
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

            {/* Modal */}
            {showModal && (
                <Modal
                    title="Update Inventory"
                    onClose={() => {
                        setShowModal(false);
                        setSelectedItem(null);
                        setQuantity(0);
                    }}
                    disabled={isSubmitting}
                >
                    <form onSubmit={handleUpdate} className="space-y-4">

                        <div>
                            <label className="block text-sm text-gray-600 mb-1">
                                Product
                            </label>
                            <div className="px-3 py-2 border rounded-lg bg-gray-50 text-gray-800">
                                {selectedItem?.product_name || '—'}
                            </div>
                        </div>
                        <Input
                            label="Available Quantity *"
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            required
                        />

                        <div className="flex gap-2 pt-2">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg"
                            >
                                {isSubmitting ? 'Updating...' : 'Update'}
                            </button>

                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 border rounded-lg"
                            >
                                Cancel
                            </button>
                        </div>

                    </form>
                </Modal>
            )}
        </div>
    );
}