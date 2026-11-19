import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AgentLayout from '../../components/agent/AgentLayout';
import AgentHome from './AgentHome';
import AgentCustomers from './AgentCustomers';
import AgentPayouts from './AgentPayouts';
import AgentOrders from './AgentOrders';
import AgentRewards from './AgentRewards';
import AgentSettings from './AgentSettings';
import NotificationsPage from '../user/NotificationsPage';

export default function AgentRoutes() {
    return (
        <AgentLayout title="Agent Portal">
            <Routes>
                <Route index element={<AgentHome />} />
                <Route path="customers" element={<AgentCustomers />} />
                <Route path="payouts" element={<AgentPayouts />} />
                <Route path="orders" element={<AgentOrders />} />
                <Route path="rewards" element={<AgentRewards />} />
                <Route path="settings" element={<AgentSettings />} />
                <Route path="notifications" element={<NotificationsPage />} />
            </Routes>
        </AgentLayout>
    );
}
