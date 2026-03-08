import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useSocket } from '../../context/SocketContext';
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
  LayoutDashboard,
  Bell
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
import LogoutModal from '../auth/LogoutModal';

export default function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { getCartTotal } = useCart();
  const { totalItems } = getCartTotal();
  const { toggleSidebar } = useSidebar();
  const { unreadCount } = useSocket();
  const [searchValue, setSearchValue] = useState('');
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const menuItems = [
    {
      title: "My Profile",
      icon: <User size={18} />,
      url: "/profile",
      show: user?.role === 'SALON_OWNER'
    },
    {
      title: "My Orders",
      icon: <Package size={18} />,
      url: "/my-orders",
      show: true
    },
    {
      title: "My Rewards",
      icon: <Zap size={18} />,
      url: "/my-rewards",
      show: user?.role === 'SALON_OWNER'
    },
    {
      title: "Notifications",
      icon: <Bell size={18} />,
      url: "/notifications",
      show: true,
      hasDot: unreadCount > 0
    },
    {
      title: "Admin Dashboard",
      icon: <Shield size={18} />,
      url: "/admin",
      show: user?.role === 'ADMIN'
    },
    {
      title: "Agent Dashboard",
      icon: <LayoutDashboard size={18} />,
      url: "/agent-dashboard",
      show: user?.role === 'AGENT'
    }
  ];

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
            <button
              onClick={toggleSidebar}
              className="md:hidden p-2 text-foreground-secondary hover:bg-secondary rounded-xl transition-colors"
            >
              <Menu size={24} />
            </button>

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
                  className="w-full bg-secondary hover:bg-secondary-hover border-transparent focus:bg-white focus:border-primary pl-10 pr-4 py-1.5 rounded-md text-base transition-colors outline-none text-foreground-primary placeholder:text-foreground-muted"
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
              <Link to="/cart" className="relative p-2 text-foreground-secondary hover:bg-secondary rounded-md transition-colors group">
                <ShoppingCart size={24} />
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
                      <Button size="sm">
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger className="focus:outline-none">
                      {user.avatarUrl ? (
                        <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-border-strong hover:border-primary-hover transition-colors ease-in">
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
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-64 mt-2 p-2 rounded-md shadow-xl border-border-strong bg-card-secondary" align="end">
                      <DropdownMenuLabel className="p-2">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-primary font-bold uppercase tracking-wider mb-0.5">{user.role}</span>
                          <div className='flex items-center gap-2'>
                            {user.avatarUrl && <div>
                              <img
                                src={user.avatarUrl}
                                alt={`${user.firstName}'s avatar`}
                                className="w-10 h-10 object-cover rounded-md"
                              />
                            </div>}
                            <div className='flex flex-col'>
                              <span className="text-sm font-bold text-foreground-primary capitalize">{user.firstName} {user.lastName}</span>
                              <span className="text-xs text-foreground-muted font-medium truncate">{user.email}</span>
                            </div>
                          </div>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-border-soft" />

                      {menuItems.filter(item => item.show).map((item) => (
                        <DropdownMenuItem key={item.title} asChild className="rounded-md cursor-pointer">
                          <Link to={item.url} className="flex items-center justify-between p-1 text-foreground-secondary font-semibold hover:bg-secondary hover:text-foreground-primary transition-all ">
                            <div className="flex items-center gap-3">
                              {item.icon} {item.title}
                            </div>
                            {item.hasDot && (
                              <div className="w-2 h-2 bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)] animate-pulse" />
                            )}
                          </Link>
                        </DropdownMenuItem>
                      ))}

                      <DropdownMenuSeparator className="bg-border-soft" />
                      <DropdownMenuItem
                        className="rounded-md cursor-pointer text-destructive hover:bg-destructive-bg! transition-all font-bold tracking-wide"
                        onSelect={() => setIsLogoutModalOpen(true)}
                      >
                        <div className="flex items-center gap-3 p-1">
                          <LogOut size={18} /> Logout
                        </div>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
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
