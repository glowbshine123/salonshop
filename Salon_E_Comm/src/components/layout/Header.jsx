import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Bell,
  Zap,
  Info,
  ShieldCheck,
  LayoutDashboard,
  Package,
  ShoppingBag,
  ChevronRight,
  Shield,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import NotificationBell from './NotificationBell';
import { categoryAPI, settingsAPI } from '../../utils/apiClient';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from '../ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "../ui/navigation-menu";

export default function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { getCartTotal } = useCart();
  const { totalItems } = getCartTotal();
  const [searchValue, setSearchValue] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [categories, setCategories] = useState([]);
  const [settings, setSettings] = useState(null);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesData, settingsData] = await Promise.all([
          categoryAPI.getAll(),
          settingsAPI.get()
        ]);
        setCategories(categoriesData || []);
        setSettings(settingsData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    fetchData();
  }, []);

  const parentCategories = categories.filter(c => !c.parent);
  const getChildren = (parentId) => categories.filter(c => c.parent === parentId);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/products?search=${searchValue}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-neutral-100 shadow-sm transition-all duration-300">
      {/* Top Banner - Subtle */}
      <div className="bg-primary-light/30 h-8 flex items-center justify-center">
        <p className="text-[10px] md:text-xs font-semibold text-primary/80 tracking-widest uppercase flex items-center gap-2">
          <Zap size={12} className="fill-primary" /> Free Shipping on Orders over ₹999
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-4">
        <div className="flex items-center justify-between gap-4">

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 -ml-2 text-neutral-600"
            onClick={() => setIsMenuOpen(true)}
          >
            <Menu size={24} />
          </button>

          {/* Logo - Centered on Mobile, Left on Desktop */}
          <Link to="/" className="flex items-center gap-2 group order-1 md:order-none">
            <div className="relative">
              <div className="w-10 h-10 bg-primary-light rounded-full flex items-center justify-center overflow-hidden">
                <img src="https://img.icons8.com/ios-filled/50/FF1B6B/sparkling-diamond.png" alt="Sparkle" className="w-6 h-6 opacity-80" />
              </div>
              <div className="absolute -top-1 -right-1">
                <Sparkles size={14} className="text-accent-color animate-pulse" />
              </div>
            </div>
            <div className="flex flex-col -space-y-1">
              <span className="text-2xl font-display font-black tracking-tight text-neutral-900 group-hover:text-primary transition-colors">
                Glow B Shine
              </span>
              <span className="text-[9px] font-bold text-accent-color uppercase tracking-[0.3em] font-body text-center md:text-left">
                Premium Beauty
              </span>
            </div>
          </Link>

          {/* Search Bar - Hidden on Mobile, Shown on Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-primary transition-colors">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Search products..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full h-11 pl-12 pr-4 bg-neutral-50 border border-neutral-100 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/30 transition-all placeholder:text-neutral-400"
            />
          </form>

          {/* Icons Context */}
          <div className="flex items-center gap-2 md:gap-5 order-2 md:order-none">
            <button className="md:hidden p-2 text-neutral-600">
              <Search size={22} />
            </button>

            {user && <NotificationBell />}

            <Link to="/cart" className="relative p-2 text-neutral-700 hover:text-primary transition-all group">
              <ShoppingBag size={22} className="group-hover:scale-110 transition-transform" />
              {totalItems > 0 && (
                <span className="absolute top-1 right-0.5 bg-primary text-white text-[9px] w-4.5 h-4.5 flex items-center justify-center rounded-full font-bold border-2 border-white shadow-sm">
                  {totalItems}
                </span>
              )}
            </Link>

            <div className="hidden sm:block">
              {!user ? (
                <div className="flex items-center gap-3">
                  <Link to="/auth/signin" className="text-sm font-bold text-neutral-600 hover:text-primary py-2 px-3 rounded-xl hover:bg-primary-light/50 transition-all">Log In</Link>
                  <Link to="/auth/signup">
                    <Button className="h-10 rounded-full px-6 bg-primary hover:bg-primary-dark shadow-md shadow-primary/20 font-bold tracking-tight">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger className="focus:outline-none">
                    <div className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full hover:bg-neutral-50 border border-neutral-100 transition-all cursor-pointer">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={`${user.firstName}'s avatar`}
                          className="w-8 h-8 rounded-full object-cover border border-primary/20 shadow-sm"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-primary-light text-primary rounded-full flex items-center justify-center font-bold text-sm">
                          <User size={18} />
                        </div>
                      )}
                      <ChevronDown size={14} className="text-neutral-400 mr-1" />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 mt-3 p-2 rounded-2xl shadow-2xl border-neutral-100 animate-in fade-in zoom-in-95" align="end">
                    <DropdownMenuLabel className="p-3">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-primary font-bold uppercase tracking-wider mb-0.5">{user.role}</span>
                        <span className="text-sm font-bold text-neutral-900">{user.firstName} {user.lastName}</span>
                        <span className="text-xs text-neutral-500 font-medium">{user.email}</span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="my-1 opacity-50" />
                    {user.role === 'SALON_OWNER' && (
                      <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                        <Link to="/profile" className="flex items-center gap-2.5 p-2.5 text-neutral-600 font-medium hover:text-neutral-900 hover:bg-neutral-50">
                          <User size={16} /> My Profile
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                      <Link to="/my-orders" className="flex items-center gap-2.5 p-2.5 text-neutral-600 font-medium hover:text-neutral-900 hover:bg-neutral-50">
                        <Package size={16} /> My Orders
                      </Link>
                    </DropdownMenuItem>
                    {user.role === 'SALON_OWNER' && (
                      <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                        <Link to="/my-rewards" className="flex items-center gap-2.5 p-2.5 text-neutral-600 font-medium hover:text-neutral-900 hover:bg-neutral-50">
                          <Zap size={16} /> My Rewards
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {user.role === 'ADMIN' && (
                      <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                        <Link to="/admin" className="flex items-center gap-2.5 p-2.5 text-neutral-600 font-medium hover:text-neutral-900 hover:bg-neutral-50">
                          <Shield size={16} /> Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {user.role === 'AGENT' && (
                      <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                        <Link to="/agent-dashboard" className="flex items-center gap-2.5 p-2.5 text-neutral-600 font-medium hover:text-neutral-900 hover:bg-neutral-50">
                          <Zap size={16} /> Agent Dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="my-1" />
                    <DropdownMenuItem className="rounded-xl cursor-pointer text-red-500 hover:text-red-600 hover:bg-red-50" onSelect={logout}>
                      <div className="flex items-center gap-2.5 p-2.5 font-medium">
                        <LogOut size={16} /> Logout
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Navigation - Centered Desktop */}
      <div className="bg-white border-b border-neutral-50 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-11 flex items-center justify-center gap-8">
          <NavigationMenu>
            <NavigationMenuList className="gap-2">
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent hover:bg-primary-light/50 text-xs font-bold text-neutral-800 hover:text-primary data-[state=open]:bg-primary-light/30 transition-all h-9 px-4 rounded-full uppercase tracking-wider">
                  Browse Categories
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-[800px] lg:w-[940px] p-8 bg-white/95 backdrop-blur-xl rounded-b-3xl shadow-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-x-10 gap-y-10">
                      {parentCategories.map((parent) => {
                        const children = getChildren(parent._id);
                        return (
                          <div key={parent._id} className="space-y-4">
                            <NavigationMenuLink asChild>
                              <Link
                                to={`/products?category=${parent.name}`}
                                className="block text-xs font-black text-neutral-900 uppercase tracking-[0.2em] border-l-2 border-primary pl-3 hover:text-primary transition-colors"
                              >
                                {parent.name}
                              </Link>
                            </NavigationMenuLink>
                            {children.length > 0 ? (
                              <ul className="space-y-2 pl-3">
                                {children.map((child) => (
                                  <li key={child._id}>
                                    <NavigationMenuLink asChild>
                                      <Link
                                        to={`/products?category=${parent.name}&subcategory=${child.name}`}
                                        className="text-[13px] font-medium text-neutral-500 hover:text-primary hover:translate-x-1 transition-all inline-block capitalize"
                                      >
                                        {child.name}
                                      </Link>
                                    </NavigationMenuLink>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-[11px] text-neutral-400 pl-3 italic font-medium">All collections</p>
                            )}
                          </div>
                        );
                      })}

                      <div className="bg-primary-light/50 rounded-2xl p-6 border border-primary/10 flex flex-col items-start justify-center relative overflow-hidden group/new">
                        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover/new:rotate-12 transition-transform">
                          <Sparkles size={60} className="text-primary" />
                        </div>
                        <h3 className="text-base font-display font-black text-neutral-900 mb-1">Seasonal Drops</h3>
                        <p className="text-xs text-neutral-600 mb-5 leading-relaxed">Discover our new handcrafted rituals for the season.</p>
                        <NavigationMenuLink asChild>
                          <Link to="/products?sort=newest">
                            <Button className="h-9 px-6 rounded-full bg-neutral-900 text-white font-bold text-[11px] uppercase tracking-tighter hover:bg-neutral-800">Shop New</Button>
                          </Link>
                        </NavigationMenuLink>
                      </div>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    to="/products"
                    className="inline-flex items-center justify-center h-9 px-4 rounded-full text-xs font-bold text-neutral-600 hover:text-primary hover:bg-primary-light/50 transition-all uppercase tracking-wider"
                  >
                    Bestsellers
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link to="/help" className="inline-flex items-center justify-center h-9 px-4 rounded-full text-xs font-bold text-neutral-400 hover:text-primary hover:bg-primary-light/50 transition-all uppercase tracking-wider">
                  Rituals & Tips
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[100] bg-white animate-in slide-in-from-left duration-300">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-5 border-b border-neutral-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center">
                  <Sparkles size={16} className="text-primary" />
                </div>
                <span className="font-display font-black text-xl tracking-tight">Glow B Shine</span>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2.5 bg-neutral-50 rounded-full text-neutral-600 active:scale-95 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {!user && (
                <div className="grid grid-cols-2 gap-4">
                  <Link to="/auth/signin" className="py-3.5 text-center border border-neutral-100 rounded-2xl font-bold text-xs uppercase tracking-widest text-neutral-600" onClick={() => setIsMenuOpen(false)}>Log In</Link>
                  <Link to="/auth/signup" className="py-3.5 text-center bg-primary text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20" onClick={() => setIsMenuOpen(false)}>Sign Up</Link>
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-4">Product Rituals</h3>
                  <div className="space-y-1">
                    {parentCategories.map((parent) => {
                      const children = getChildren(parent._id);
                      return (
                        <div key={parent._id} className="py-1">
                          <button
                            onClick={() => {
                              navigate(`/products?category=${parent.name}`);
                              setIsMenuOpen(false);
                            }}
                            className="flex items-center justify-between w-full py-2.5 text-left font-bold text-neutral-800 hover:text-primary transition-colors"
                          >
                            <span className="text-base">{parent.name}</span>
                            <ChevronRight size={18} className="text-neutral-200" />
                          </button>
                          {children.length > 0 && (
                            <div className="pl-4 mt-1 border-l-2 border-primary-light flex flex-wrap gap-2 py-2">
                              {children.map(child => (
                                <Link
                                  key={child._id}
                                  to={`/products?category=${parent.name}&subcategory=${child.name}`}
                                  className="px-3 py-1.5 bg-neutral-50 text-[13px] text-neutral-500 font-medium rounded-full active:bg-primary-light active:text-primary transition-colors capitalize"
                                  onClick={() => setIsMenuOpen(false)}
                                >
                                  {child.name}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-50">
                  <Link to="/products" className="flex items-center justify-between py-3 font-bold text-neutral-800" onClick={() => setIsMenuOpen(false)}>
                    <span className="text-base">View All Collections</span>
                    <ArrowRight size={18} className="text-neutral-200" />
                  </Link>
                  <Link to="/help" className="flex items-center justify-between py-3 font-bold text-neutral-800" onClick={() => setIsMenuOpen(false)}>
                    <span className="text-base">Beauty Tips & Rituals</span>
                    <ArrowRight size={18} className="text-neutral-200" />
                  </Link>
                </div>
              </div>
            </div>

            <div className="p-6 bg-neutral-50/50">
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest text-center">Glow B Shine © 2026</p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
