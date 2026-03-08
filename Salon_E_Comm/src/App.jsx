import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import ProductDetailPage from './pages/product/ProductDetailPage';
import ProductsPage from './pages/product/ProductsPage';
import CheckoutPage from './pages/product/CheckoutPage';
import CartPage from './pages/product/CartPage';
import MyOrdersPage from './pages/product/MyOrdersPage';
import RewardPage from './pages/product/RewardPage';
import ProfilePage from './pages/user/ProfilePage';
import NotificationsPage from './pages/user/NotificationsPage';
import FAQPage from './pages/policy/FAQPage';
import RewardPolicyPage from './pages/policy/RewardPolicyPage';
import TermsPage from './pages/policy/TermsPage';
import PrivacyPage from './pages/policy/PrivacyPage';
import ShippingPolicyPage from './pages/policy/ShippingPolicyPage';
import ContactPage from './pages/ContactPage';
import AboutUsPage from './pages/policy/AboutUsPage';
import WhyChooseUsPage from './pages/policy/WhyChooseUsPage';
import MainLayout from './components/layout/MainLayout';

import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoutes from './pages/admin/AdminRoutes';
import AgentRoutes from './pages/agent/AgentRoutes';
import { SocketProvider } from './context/SocketContext';
import { LoadingProvider } from './context/LoadingContext';
import { Toaster } from 'react-hot-toast';
import PageLoader from './components/common/PageLoader';

const App = () => {
  return (
    <AuthProvider>
      <LoadingProvider>
        <SocketProvider>
          <CartProvider>
            <BrowserRouter>
              <PageLoader />

              <Routes>
                <Route element={<MainLayout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/products/:id" element={<ProductDetailPage />} />
                  <Route path="/products" element={<ProductsPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/faq" element={<FAQPage />} />
                  <Route path="/reward-policy" element={<RewardPolicyPage />} />
                  <Route path="/terms" element={<TermsPage />} />
                  <Route path="/privacy" element={<PrivacyPage />} />
                  <Route path="/shipping-policy" element={<ShippingPolicyPage />} />
                  <Route path="/about" element={<AboutUsPage />} />
                  <Route path="/why-choose-us" element={<WhyChooseUsPage />} />
                  <Route path="/contact" element={<ContactPage />} />

                  <Route
                    path="/checkout"
                    element={
                      <ProtectedRoute roles={['SALON_OWNER', 'AGENT', 'ADMIN']}>
                        <CheckoutPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/my-orders"
                    element={
                      <ProtectedRoute roles={['SALON_OWNER', 'AGENT', 'ADMIN']}>
                        <MyOrdersPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/my-rewards"
                    element={
                      <ProtectedRoute roles={['SALON_OWNER']}>
                        <RewardPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute roles={['SALON_OWNER', 'AGENT', 'ADMIN']}>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/notifications"
                    element={
                      <ProtectedRoute roles={['SALON_OWNER', 'AGENT', 'ADMIN']}>
                        <NotificationsPage />
                      </ProtectedRoute>
                    }
                  />
                </Route>

                <Route
                  path="/admin/*"
                  element={
                    <ProtectedRoute roles={['ADMIN']}>
                      <AdminRoutes />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/agent-dashboard/*"
                  element={
                    <ProtectedRoute roles={['AGENT']}>
                      <AgentRoutes />
                    </ProtectedRoute>
                  }
                />


                {/* Auth Routes (No Header/Footer) */}
                <Route path="/auth/signin" element={<LoginPage />} />
                <Route path="/auth/signup" element={<SignupPage />} />


              </Routes>
            </BrowserRouter>
          </CartProvider>
        </SocketProvider>
        <Toaster position="bottom-right" reverseOrder={false} />
      </LoadingProvider>
    </AuthProvider>
  );
};

export default App;
