import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import {
  Search,
  ShoppingCart,
  Menu,
  X,
  User,
  ChevronDown,
  LogOut,
  Package,
  Zap,
  Shield,
  LayoutDashboard
} from 'lucide-react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useSidebar } from '../ui/sidebar';
import LogoutModal from '../common/LogoutModal';

export default function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { getCartTotal } = useCart();
  const { totalItems } = getCartTotal();
  const { toggleSidebar } = useSidebar();
  const [searchValue, setSearchValue] = useState('');
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/products?search=${searchValue}`);
    }
  };

  const handleLogout = () => {
    setIsLogoutModalOpen(false);
    logout();
    navigate('/auth/signin');
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-background border-b border-border-soft shadow-sm font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

          {/* Left Section: Mobile Hamburger / Desktop Logo */}
          <div className="flex-1 flex items-center justify-start">
            {/* Hamburger (Mobile Only) */}
            {user && (
              <button
                onClick={toggleSidebar}
                className="md:hidden p-2 text-foreground-secondary hover:bg-secondary rounded-xl transition-colors"
              >
                <Menu size={24} />
              </button>
            )}

            {/* Logo (Desktop Only) */}
            <div className="hidden md:block">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="w-fit h-10 bg-primary/10 rounded-xl flex items-center justify-center transition-transform overflow-hidden">
                  <img src="/logo.jpeg" alt="Logo" className="w-full h-full object-contain" />
                </div>
              </Link>
            </div>
          </div>

          {/* Center Section: Mobile Logo Only */}
          <div className="flex-1 flex items-center justify-center md:hidden">
            <Link to="/" className="flex items-center group">
              <div className="w-fit h-10 bg-primary/10 rounded-xl flex items-center justify-center transition-transform overflow-hidden">
                <img src="/logo.jpeg" alt="Logo" className="w-full h-full object-contain" />
              </div>
            </Link>
          </div>

          {/* Right Section: Search + Icons (Desktop & Mobile) */}
          <div className="flex-1 flex items-center justify-end gap-2 md:gap-6">

            {/* Search Bar (Desktop) */}
            <div className="hidden md:block w-full max-w-sm">
              <form onSubmit={handleSearch} className="relative group">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="w-full bg-secondary hover:bg-secondary-hover border-transparent focus:bg-white focus:border-primary/30 h-10 pl-10 pr-4 rounded-xl text-sm transition-all outline-none text-foreground-primary placeholder:text-foreground-muted"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted group-focus-within:text-primary transition-colors" size={16} />
              </form>
            </div>

            {/* Icons Area */}
            <div className="flex items-center gap-1 md:gap-4">
              {/* Search Icon (Mobile Only) */}
              <button
                onClick={() => navigate('/products')}
                className="md:hidden p-2 text-foreground-secondary hover:bg-secondary rounded-xl transition-colors"
              >
                <Search size={24} />
              </button>

              {/* Cart Icon */}
              <Link to="/cart" className="relative p-2 text-foreground-secondary hover:bg-secondary rounded-xl transition-colors group">
                <ShoppingCart size={24} className="group-hover:scale-110 transition-transform" />
                {totalItems > 0 && (
                  <span className="absolute top-1 right-1 bg-primary text-white text-[10px] w-4.5 h-4.5 flex items-center justify-center rounded-full font-bold border-2 border-background">
                    {totalItems}
                  </span>
                )}
              </Link>

              {/* Profile Dropdown (Desktop Only) */}
              <div className="hidden md:block">
                {!user ? (
                  <div className="flex items-center gap-3">
                    <Link to="/auth/signin">
                      <Button variant="ghost" className="text-sm font-bold text-foreground-secondary hover:text-foreground-primary">
                        Login
                      </Button>
                    </Link>
                    <Link to="/auth/signup">
                      <Button size="sm" className="bg-primary hover:bg-primary-hover text-white rounded-xl font-bold shadow-sm">
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger className="focus:outline-none">
                      <div className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full hover:bg-secondary border border-border-soft transition-all cursor-pointer">
                        {user.avatarUrl ? (
                          <div className="w-8 h-8 rounded-full overflow-hidden border border-primary/20">
                            <img
                              src={user.avatarUrl}
                              alt={`${user.firstName}'s avatar`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-8 h-8 bg-primary-muted text-primary rounded-full flex items-center justify-center font-bold text-sm">
                            <User size={18} />
                          </div>
                        )}
                        <ChevronDown size={14} className="text-foreground-muted mr-1" />
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-64 mt-2 p-2 rounded-2xl shadow-xl border-border-soft bg-white" align="end">
                      <DropdownMenuLabel className="p-3">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-primary font-bold uppercase tracking-wider mb-0.5">{user.role}</span>
                          <span className="text-sm font-bold text-foreground-primary">{user.firstName} {user.lastName}</span>
                          <span className="text-xs text-foreground-muted font-medium truncate">{user.email}</span>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="my-1 bg-border-soft" />

                      {user.role === 'SALON_OWNER' && (
                        <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                          <Link to="/profile" className="flex items-center gap-3 p-2.5 text-foreground-secondary font-semibold hover:bg-secondary hover:text-foreground-primary transition-all">
                            <User size={18} /> My Profile
                          </Link>
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                        <Link to="/my-orders" className="flex items-center gap-3 p-2.5 text-foreground-secondary font-semibold hover:bg-secondary hover:text-foreground-primary transition-all">
                          <Package size={18} /> My Orders
                        </Link>
                      </DropdownMenuItem>

                      {user.role === 'SALON_OWNER' && (
                        <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                          <Link to="/my-rewards" className="flex items-center gap-3 p-2.5 text-foreground-secondary font-semibold hover:bg-secondary hover:text-foreground-primary transition-all">
                            <Zap size={18} /> My Rewards
                          </Link>
                        </DropdownMenuItem>
                      )}

                      {user.role === 'ADMIN' && (
                        <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                          <Link to="/admin" className="flex items-center gap-3 p-2.5 text-foreground-secondary font-semibold hover:bg-secondary hover:text-foreground-primary transition-all">
                            <Shield size={18} /> Admin Dashboard
                          </Link>
                        </DropdownMenuItem>
                      )}

                      {user.role === 'AGENT' && (
                        <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                          <Link to="/agent-dashboard" className="flex items-center gap-3 p-2.5 text-foreground-secondary font-semibold hover:bg-secondary hover:text-foreground-primary transition-all">
                            <LayoutDashboard size={18} /> Agent Dashboard
                          </Link>
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuSeparator className="my-1 bg-border-soft" />
                      <DropdownMenuItem
                        className="rounded-xl cursor-pointer text-destructive hover:bg-destructive/10 transition-all font-bold"
                        onSelect={() => setIsLogoutModalOpen(true)}
                      >
                        <div className="flex items-center gap-3 p-2.5">
                          <LogOut size={18} /> Logout
                        </div>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>


            {!user && (
              <Link to="/auth/signin" className="md:hidden">
                <Button size="sm" className="bg-primary text-xs rounded-lg">Login</Button>
              </Link>
            )}

          </div>
        </div>
      </header>

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
      />
    </>
  );
}
