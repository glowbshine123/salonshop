import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "../ui/breadcrumb";

export default function Breadcrumbs() {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);

    // Map for friendly names (optional)
    const routeNameMap = {
        'products': 'All Products',
        'cart': 'Shopping Cart',
        'login': 'Login',
        'signup': 'Sign Up',
        'checkout': 'Checkout',
        'profile': 'My Profile',
        'my-orders': 'My Orders',
        'category': 'Category'
    };

    if (pathnames.length === 0) {
        return null; // Don't show on home page
    }

    return (
        <div className="bg-white border-b border-neutral-100 py-3">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link to="/">Home</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>

                        {pathnames.map((value, index) => {
                            const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                            const isLast = index === pathnames.length - 1;

                            // Skip displaying IDs or some dynamic segments if needed, 
                            // or fetch their names. For now, we capitalize or use map.
                            let displayName = routeNameMap[value] || value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ');

                            // Handle Product Detail or Category Detail pages specially if needed
                            // e.g. if path is /product/123, we might want to show "Product" > "Product Name"
                            // But for now, simple path based breadcrumb

                            return (
                                <React.Fragment key={to}>
                                    <BreadcrumbSeparator />
                                    <BreadcrumbItem>
                                        {isLast ? (
                                            <BreadcrumbPage>{displayName}</BreadcrumbPage>
                                        ) : (
                                            <BreadcrumbLink asChild>
                                                <Link to={to}>{displayName}</Link>
                                            </BreadcrumbLink>
                                        )}
                                    </BreadcrumbItem>
                                </React.Fragment>
                            );
                        })}
                    </BreadcrumbList>
                </Breadcrumb>
            </div>
        </div>
    );
}
