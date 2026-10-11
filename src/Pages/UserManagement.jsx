import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Pagination from '../components/common/Pagination';

const formatAddress = (address) => [
    address.house,
    address.street,
    address.city,
    address.pincode,
].filter(Boolean).join(', ') || 'Address details unavailable';

export function UserManagement() {
    const BASE_URL = process.env.REACT_APP_API_URL;
    const token = localStorage.getItem('token');
    const [users, setUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [userOptions, setUserOptions] = useState([]);
    const [selectedReferrerId, setSelectedReferrerId] = useState('');
    const pageSize = 10;

    const fetchUsers = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await axios({
                method: 'GET',
                url: `${BASE_URL}/user-management/`,
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    page: currentPage,
                    page_size: pageSize,
                    ...(selectedReferrerId ? { referred_by: selectedReferrerId } : {}),
                },
            });
            const data = response?.data?.data;
            setUsers(data?.data || []);
            setTotalPages(data?.total_pages || 1);
            setTotalRecords(data?.total_records || 0);
        } catch (error) {
            toast.error(error?.response?.data?.message || error.message);
        } finally {
            setIsLoading(false);
        }
    }, [BASE_URL, currentPage, selectedReferrerId, token]);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    useEffect(() => {
        const fetchUserOptions = async () => {
            try {
                const response = await axios({
                    method: 'GET',
                    url: `${BASE_URL}/user-management/options`,
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUserOptions(response?.data?.data || []);
            } catch (error) {
                toast.error(error?.response?.data?.message || error.message);
            }
        };

        fetchUserOptions();
    }, [BASE_URL, token]);

    const applyReferrerFilter = (referrerId) => {
        setSelectedReferrerId(String(referrerId));
        setCurrentPage(1);
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Users</h1>
                <p className="text-gray-600">View active customers and their delivery addresses</p>
            </div>
            <div className="mb-4 flex items-center gap-3 rounded-lg border bg-white p-4">
                <label htmlFor="referrer-filter" className="text-sm font-medium text-gray-700">Referred by</label>
                <select
                    id="referrer-filter"
                    value={selectedReferrerId}
                    onChange={(event) => applyReferrerFilter(event.target.value)}
                    className="min-w-56 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-green-600"
                >
                    <option value="">All users</option>
                    {userOptions.map((user) => (
                        <option key={user.id} value={user.id}>
                            {`${user.name || 'Unnamed user'} - ${user.phone_number || 'No phone number'}`}
                        </option>
                    ))}
                </select>
                {selectedReferrerId && (
                    <button
                        type="button"
                        className="text-sm font-medium text-green-700 hover:text-green-800"
                        onClick={() => applyReferrerFilter('')}
                    >
                        Clear filter
                    </button>
                )}
            </div>
            <div className="overflow-hidden rounded-lg border bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50"><tr>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">S.No</th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Name</th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Phone Number</th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Users Referred</th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Delivered Orders</th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Addresses</th>
                        </tr></thead>
                        <tbody className="divide-y divide-gray-200">
                            {isLoading ? <tr><td colSpan={6} className="py-8 text-center text-sm text-gray-600">Loading users...</td></tr>
                                : users.length === 0 ? <tr><td colSpan={6} className="py-8 text-center text-sm text-gray-600">No active users found</td></tr>
                                : users.map((user, index) => <tr key={user.id} className="align-top hover:bg-gray-50">
                                    <td className="px-4 py-4 text-sm text-gray-700">{(currentPage - 1) * pageSize + index + 1}</td>
                                    <td className="px-4 py-4 text-sm font-medium text-gray-900">{user.name || '—'}</td>
                                    <td className="px-4 py-4 text-sm text-gray-700">{user.phone_number || '—'}</td>
                                    <td className="px-4 py-4 text-sm">
                                        {Number(user.referral_count) > 0 ? (
                                            <button
                                                type="button"
                                                onClick={() => applyReferrerFilter(user.id)}
                                                className="rounded bg-green-100 px-2.5 py-1 font-semibold text-green-700 hover:bg-green-200"
                                                title={`Show users referred by ${user.name || 'this user'}`}
                                            >
                                                {user.referral_count}
                                            </button>
                                        ) : <span className="text-gray-500">0</span>}
                                    </td>
                                    <td className="px-4 py-4 text-sm font-medium text-gray-700">{user.delivered_order_count || 0}</td>
                                    <td className="min-w-[320px] px-4 py-4 text-sm text-gray-700">
                                        {user.addresses?.length ? <div className="space-y-2">
                                            {user.addresses.map((address) => <div key={address.id} className="rounded border border-gray-200 px-3 py-2">
                                                <div className="flex items-center gap-2">
                                                    {address.name && <span className="font-medium">{address.name}</span>}
                                                    {address.is_default && <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">Default</span>}
                                                </div>
                                                <p className="mt-1 text-gray-600">{formatAddress(address)}</p>
                                            </div>)}
                                        </div> : 'No active address'}
                                    </td>
                                </tr>)}
                        </tbody>
                    </table>
                </div>
            </div>
            {totalPages > 0 && <div className="flex items-center justify-between border border-t-0 bg-gray-50 px-4 py-2">
                <div className="text-sm text-gray-600">Showing <span className="font-medium">{users.length}</span> of <span className="font-medium">{totalRecords}</span> users</div>
                {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
            </div>}
        </div>
    );
}
