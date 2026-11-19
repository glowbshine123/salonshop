import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import Breadcrumbs from '../common/Breadcrumbs';
import { SidebarProvider } from '../ui/sidebar';
import AppSidebar from './MobileSidebar';
import './MainLayout.css';

export default function MainLayout({ children }) {
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="main-layout min-h-screen flex flex-col w-full bg-white">
        <Header />
        <Breadcrumbs />
        <main className="main-content flex-1">
          {children || <Outlet />}
        </main>
        <Footer />
        <AppSidebar />
      </div>
    </SidebarProvider>
  );
}

