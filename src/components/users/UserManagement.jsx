import { useState } from 'react';
import { Edit2, Plus, Trash2 } from 'lucide-react';
import { mockAdminUsers } from '../../lib/mockData';

const EMPTY_FORM = { username: '', password: '', role: 'user' };

export function UserManagement() {
    const [users, setUsers] = useState(mockAdminUsers);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState(EMPTY_FORM);

    const openCreate = () => {
        setEditingUser(null);
        setFormData(EMPTY_FORM);
        setShowModal(true);
    };

    const openEdit = (user) => {
        setEditingUser(user.id);
        setFormData({ username: user.username, password: user.password, role: user.role });
        setShowModal(true);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!formData.username || !formData.password) return;

        if (editingUser) {
            setUsers((currentUsers) => currentUsers.map((user) => user.id === editingUser
                ? { ...user, ...formData }
                : user));
        } else {
            const nextId = Math.max(0, ...users.map((user) => user.id)) + 1;
            setUsers((currentUsers) => [...currentUsers, { id: nextId, ...formData, is_active: true }]);
        }

        setShowModal(false);
        setFormData(EMPTY_FORM);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this admin user?')) {
            setUsers((currentUsers) => currentUsers.filter((user) => user.id !== id));
        }
    };

    return (
        <div className="p-8">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="mb-2 text-3xl">Admin User Management</h1>
                    <p className="text-gray-600">Create, edit, and delete admin users</p>
                </div>
                <button onClick={openCreate} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                    <Plus className="w-5 h-5" /> Create Admin User
                </button>
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                <div className="overflow-x-auto"><table className="w-full">
                    <thead className="border-b border-gray-200 bg-gray-50"><tr>
                        <th className="px-6 py-3 text-left text-xs uppercase text-gray-500">ID</th>
                        <th className="px-6 py-3 text-left text-xs uppercase text-gray-500">Username</th>
                        <th className="px-6 py-3 text-left text-xs uppercase text-gray-500">Role</th>
                        <th className="px-6 py-3 text-left text-xs uppercase text-gray-500">Status</th>
                        <th className="px-6 py-3 text-right text-xs uppercase text-gray-500">Actions</th>
                    </tr></thead>
                    <tbody className="divide-y divide-gray-200">
                        {users.map((user) => <tr key={user.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm">{user.id}</td>
                            <td className="px-6 py-4 text-sm">{user.username}</td>
                            <td className="px-6 py-4 text-sm"><span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs text-blue-800">{user.role.replace('_', ' ').toUpperCase()}</span></td>
                            <td className="px-6 py-4 text-sm"><span className={user.is_active ? 'text-green-700' : 'text-red-700'}>{user.is_active ? 'Active' : 'Inactive'}</span></td>
                            <td className="px-6 py-4 text-right"><button onClick={() => openEdit(user)} className="mr-2 p-2 text-blue-600"><Edit2 className="w-4 h-4" /></button><button onClick={() => handleDelete(user.id)} className="p-2 text-red-600"><Trash2 className="w-4 h-4" /></button></td>
                        </tr>)}
                    </tbody>
                </table></div>
            </div>

            {showModal && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                <div className="w-full max-w-md rounded-lg bg-white p-6">
                    <h2 className="mb-4 text-xl">{editingUser ? 'Edit Admin User' : 'Create Admin User'}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input className="w-full rounded-lg border px-3 py-2" placeholder="Username" value={formData.username} onChange={(event) => setFormData({ ...formData, username: event.target.value })} required />
                        <input className="w-full rounded-lg border px-3 py-2" type="password" placeholder="Password" value={formData.password} onChange={(event) => setFormData({ ...formData, password: event.target.value })} required />
                        <select className="w-full rounded-lg border px-3 py-2" value={formData.role} onChange={(event) => setFormData({ ...formData, role: event.target.value })}>
                            <option value="user">User</option><option value="admin">Admin</option><option value="super_admin">Super Admin</option>
                        </select>
                        <div className="flex justify-end gap-2"><button type="button" className="rounded-lg border px-4 py-2" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-white">{editingUser ? 'Update' : 'Create'}</button></div>
                    </form>
                </div>
            </div>}
        </div>
    );
}
