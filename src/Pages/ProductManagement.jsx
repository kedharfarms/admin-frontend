// pages/ProductManagement.jsx

import { useEffect, useState } from 'react';
import { Search, Filter } from 'lucide-react';
import Categories from '../components/productManagement/Categories';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import Products from '../components/productManagement/Products';
import ProductVariants from '../components/productManagement/ProductVariants';
import SubscriptionPlans from '../components/productManagement/SubscriptionPlans';

const TABS = [
    { key: 'categories', label: 'Categories' },
    { key: 'products',   label: 'Products' },
    { key: 'variants',   label: 'Product Variants' },
    { key: 'subscription_plans',   label: 'Subcription Plans' },
];

export function ProductManagement() {
    const BASE_URL = process.env.REACT_APP_API_URL;
    const token = localStorage.getItem('token');

    const [searchParams, setSearchParams] = useSearchParams();

    const [activeTab, setActiveTab] = useState(
        searchParams.get('section') || 'categories'
    );

    const [searchTerm, setSearchTerm] = useState(
        searchParams.get('search') || ''
    );

    const [currentPage, setCurrentPage] = useState(
        Number(searchParams.get('page')) || 1
    );

    const [pageSize, setPageSize] = useState(
        Number(searchParams.get('page_size')) || 10
    );

    const [statusFilter, setStatusFilter] = useState(
        searchParams.get('is_active') || 'true'
    );

    const [data, setData] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);

    const [isLoading, setIsLoading] = useState(false);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const fetchData = async () => {
        if (isLoading) return;
        setData([]);
        setIsLoading(true);
        try {
            const params = {
                page: currentPage,
                page_size: pageSize,
                search: searchTerm || '',
                section: activeTab,
            }
            if(statusFilter){
                params.is_active = statusFilter
            }
            const response = await axios({
                method: 'GET',
                url: BASE_URL + '/product-management',
                params: params,
            });
            const resData = response?.data?.data;

            setData(resData?.data || []);
            setTotalPages(resData?.total_pages || 1);
            setTotalRecords(resData?.total_records || 0);

        } catch (error) {
            
            const message =
                error.response?.data?.message || error?.message;

            alert(message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        
        const isPageChange = currentPage != Number(searchParams.get('page'));

        if (!isPageChange && currentPage != 1) {
            setCurrentPage(1);
            return;
        }
        const updatedParams = {
            page: currentPage,
            page_size: pageSize,
            section: activeTab,
        };
        if (searchTerm) {
            updatedParams.search = searchTerm;
        }
        if (statusFilter !== '') {
            updatedParams.is_active = statusFilter;
        }
        setSearchParams(updatedParams);

        const timer = setTimeout(() => {
            fetchData();
        }, 400);

        return () => clearTimeout(timer);

    }, [searchTerm, currentPage, pageSize, activeTab, statusFilter]);
    
    return (
        <div className="p-4 md:p-6 lg:p-8">

            {/* Page Header */}
            <div className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold mb-2">Product Management</h1>
                <p className="text-gray-600">Manage categories, products, and variants</p>
            </div>

            {/* Search & Filter */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className=" w-[400px] relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Status Filter */}
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
                >
                    <option value="">All Status</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                </select>

            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
                {TABS.map(({ key, label }) => (
                    <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className={`flex-shrink-0 px-4 py-2 border-b-2 transition-colors whitespace-nowrap ${
                            activeTab === key
                                ? 'border-blue-600 text-blue-600 font-medium'
                                : 'border-transparent text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'categories' && 
                <Categories 
                    categories={data} 
                    currentPage={currentPage}
                    pageSize={pageSize}
                    totalPages={totalPages}
                    totalRecords={totalRecords}
                    isLoading={isLoading}
                    handlePageChange={handlePageChange}
                    onRefresh={fetchData}
                />
            }
            {activeTab === 'products'  &&
             <Products
                products={data} 
                currentPage={currentPage}
                pageSize={pageSize}
                totalPages={totalPages}
                totalRecords={totalRecords}
                isLoading={isLoading}
                handlePageChange={handlePageChange}
                onRefresh={fetchData}
             />}
            
            {activeTab === 'variants'   && 
            <ProductVariants
                variants={data} 
                currentPage={currentPage}
                pageSize={pageSize}
                totalPages={totalPages}
                totalRecords={totalRecords}
                isLoading={isLoading}
                handlePageChange={handlePageChange}
                onRefresh={fetchData} 
            />}
            
            {activeTab === 'subscription_plans'   && 
            <SubscriptionPlans
                plans={data} 
                currentPage={currentPage}
                pageSize={pageSize}
                totalPages={totalPages}
                totalRecords={totalRecords}
                isLoading={isLoading}
                handlePageChange={handlePageChange}
                onRefresh={fetchData} 
            />}

        </div>
    );
}