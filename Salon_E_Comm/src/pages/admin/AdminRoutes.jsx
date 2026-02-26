import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminHome from './AdminHome';
import AdminProducts from './AdminProducts';
import AdminCategories from './AdminCategories';
import AdminOrders from './AdminOrders';
import AdminAgents from './AdminAgents';
import AdminPayouts from './AdminPayouts';
import AdminCommissionSlabs from './AdminCommissionSlabs';
import AdminUsers from './AdminUsers';
import AdminSettings from './AdminSettings';
import AdminProfile from './AdminProfile';
import NotificationsPage from '../NotificationsPage';
import AdminDashboard from './AdminDashboard';
import AddProductPage from './AddProductPage';

export default function AdminRoutes() {
    return (
        <AdminLayout title="Admin Console">
            <Routes>
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="products/add" element={<AddProductPage />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="agents" element={<AdminAgents />} />
                <Route path="payouts" element={<AdminPayouts />} />
                <Route path="commissions" element={<AdminCommissionSlabs />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="profile" element={<AdminProfile />} />
                <Route path="notifications" element={<NotificationsPage />} />
            </Routes>
        </AdminLayout>
    );
}
