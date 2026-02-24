import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ProductsPage from './pages/ProductsPage';
import CheckoutPage from './pages/CheckoutPage';
import CategoryPage from './pages/CategoryPage';
import BecomeSeller from './pages/BecomeSeller';
import AgentRewards from './pages/AgentRewards';
import HelpCenter from './pages/HelpCenter';
import CartPage from './pages/CartPage';
import MyOrdersPage from './pages/MyOrdersPage';
import RewardPage from './pages/RewardPage';
import ProfilePage from './pages/ProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import MainLayout from './components/layout/MainLayout';
import ScrollToTop from './components/ScrollToTop';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoutes from './pages/admin/AdminRoutes';
import AgentRoutes from './pages/agent/AgentRoutes';
import { SocketProvider } from './context/SocketContext';
import { Toaster } from 'react-hot-toast';

const App = () => {
  return (
    <AuthProvider>
      <SocketProvider>
        <CartProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              <Route element={<MainLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/products/:id" element={<ProductDetailPage />} />
                <Route path="/category/:category" element={<CategoryPage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/cart" element={<CartPage />} />

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

                <Route path="/become-seller" element={<BecomeSeller />} />
                <Route path="/agent-rewards" element={<AgentRewards />} />
                <Route path="/help" element={<HelpCenter />} />
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
    </AuthProvider>
  );
};

export default App;
