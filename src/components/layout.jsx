import React, { useState } from 'react';
import {
    LayoutDashboard,
    Package,
    Truck,
    Users,
    Box,
    Settings,
    Gift,
    Menu,
    X
} from 'lucide-react';
import { useNavigate } from "react-router-dom";
import ConfirmationModal from './common/ConfirmationModal';

export function Layout({ children, activeTab, onTabChange }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const navigate = useNavigate();

    const menuItems = [
        { id: 'ongoing', label: 'Ongoing Deliveries', icon: Truck },
        { id: 'orders', label: 'Order Management', icon: LayoutDashboard },
        { id: 'subscriptions', label: 'Subscription Managemnt', icon: Package },
        { id: 'users', label: 'User Management', icon: Users },
        { id: 'products', label: 'Product Management', icon: Box },
        { id: 'inventory', label: 'Inventory Management', icon: Settings },
        { id: 'coupons', label: 'Coupon Management', icon: Gift },
    ];

    const handleTabClick = (id) => {
        onTabChange(id);
        setSidebarOpen(false);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");

        navigate("/login");
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">

            {/* Sidebar */}
            <aside
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={`
                    fixed lg:static z-50 h-full
                    bg-[#7CA126] text-white flex flex-col
                    transition-all duration-300
                    ${isHovered ? 'w-64' : 'w-20'}
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    lg:translate-x-0
                `}
            >
                {/* Header */}
                <div className="p-4 border-b border-[#94BF30] flex items-center justify-between">
                    {isHovered && (
                        <div>
                            <h1 className="text-lg font-bold text-white">KedharFarms</h1>
                            <p className="text-xs text-white">Admin</p>
                        </div>
                    )}

                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden hover:bg-[#94BF30] p-2 rounded-lg"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-4">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;

                        return (
                            <button
                                key={item.id}
                                onClick={() => handleTabClick(item.id)}
                                className={`
                                    w-full flex items-center gap-3 px-4 py-3
                                    transition-all
                                    ${isActive ? 'bg-white text-[#94BF30]' : ''}
                                    hover:bg-white hover:text-[#94BF30]
                                `}
                            >
                                <Icon className="w-5 h-5 min-w-[20px]" />

                                {/* Label appears only on hover */}
                                <span
                                    className={`
                                        text-sm font-medium whitespace-nowrap
                                        transition-opacity duration-200
                                        ${isHovered ? 'opacity-100' : 'opacity-0'}
                                    `}
                                >
                                    {item.label}
                                </span>
                            </button>
                        );
                    })}
                </nav>
                <div className="p-4 border-t border-[#94BF30]">
                    <button
                        onClick={() => setShowLogoutModal(true)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white hover:text-[#7CA126] transition"
                    >
                        {/* You can use any icon */}
                        <span className="text-sm font-medium">
                            {isHovered ? "Logout" : "⏻"}
                        </span>
                    </button>
                </div>
            </aside>

            {/* Main Section */}
            <div className="flex flex-col flex-1 w-full">

                {/* Mobile Topbar */}
                <header className="lg:hidden bg-white border-b p-4 flex items-center">
                    <button onClick={() => setSidebarOpen(true)}>
                        <Menu className="w-6 h-6" />
                    </button>
                    <h2 className="ml-4 font-semibold">Admin Dashboard</h2>
                </header>

                <main className="flex-1 overflow-auto">
                    {children}
                </main>
            </div>
            <ConfirmationModal
                isOpen={showLogoutModal}
                onClose={() => {
                    setShowLogoutModal(false);
                }}
                title="Confirm Logout"
                zIndex="z-[60]"
                onConfirm={handleLogout}
                confirmText={`Confirm`}
            >
                <p className="text-sm text-gray-600 mb-4">
                Are you sure to logout?
                </p>

            </ConfirmationModal>
        </div>
    );
}