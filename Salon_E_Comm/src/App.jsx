import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ProductsPage from './pages/ProductsPage';
import CheckoutPage from './pages/CheckoutPage';
import CartPage from './pages/CartPage';
import MyOrdersPage from './pages/MyOrdersPage';
import RewardPage from './pages/RewardPage';
import ProfilePage from './pages/ProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import FAQPage from './pages/FAQPage';
import RewardPolicyPage from './pages/RewardPolicyPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import ShippingPolicyPage from './pages/ShippingPolicyPage';
import ContactPage from './pages/ContactPage';
import MainLayout from './components/layout/MainLayout';
import ScrollToTop from './components/ScrollToTop';
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
              <ScrollToTop />
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
