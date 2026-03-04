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
  Shield
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
    <header className="sticky top-0 z-50 w-full bg-white border-b border-neutral-200 shadow-sm font-sans">
      <div className="border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 md:h-16 flex items-center justify-between">

          <Link to="/" className="flex items-center gap-2 group">
            {settings?.logoUrl ? (
              <img src={settings.logoUrl} alt={settings.appName || "Logo"} className="w-10 h-10 rounded-xl object-cover shadow-lg shadow-neutral-900/10" />
            ) : (
              <div className="w-10 h-10 bg-green-950/90 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform shadow-lg shadow-neutral-900/10">
                <span className="text-white font-black text-xl">S</span>
              </div>
            )}
            <span className="text-xl font-black tracking-tighter text-green-950/90 hidden sm:block">
              {settings?.appName ? (
                <>
                  {settings.appName.split(' ')[0]}<span className="text-emerald-500">{settings.appName.split(' ')[1]?.charAt(0)}</span>{settings.appName.split(' ')[1]?.slice(1)}
                </>
              ) : (
                <>Salon<span className="text-emerald-500">E</span>-Comm</>
              )}
            </span>
          </Link>

          <div className="flex items-center gap-4 md:gap-6">

            {user && <NotificationBell />}

            <Link to="/cart" className="relative p-2 text-neutral-600 hover:bg-neutral-100 rounded-full transition-colors group">
              <ShoppingCart size={20} className="group-hover:scale-105 transition-transform" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-blue-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold border border-white">
                  {totalItems}
                </span>
              )}
            </Link>

            <div className="block">
              {!user ? (
                <div className="flex items-center gap-3">
                  <Link to="/auth/signin" className="text-sm font-semibold text-neutral-600 hover:text-neutral-900">Login</Link>
                  <Link to="/auth/signup" className="">
                    <Button>
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
                          className="w-8 h-8 rounded-full object-cover border border-neutral-200 shadow-sm"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                          <User size={20} />
                        </div>
                      )}
                      <ChevronDown size={14} className="text-neutral-400 mr-1" />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 mt-2 p-2 rounded-2xl shadow-xl border-neutral-100" align="end">
                    <DropdownMenuLabel className="p-3">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mb-0.5">{user.role}</span>
                        <span className="text-sm font-bold text-neutral-900">{user.firstName} {user.lastName}</span>
                        <span className="text-xs text-neutral-500 font-medium">{user.email}</span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="my-1" />
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

      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-10 flex items-center justify-between gap-4">

          <div className="flex items-center h-full gap-8">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent hover:bg-transparent text-sm font-bold text-neutral-800 hover:text-emerald-700 data-[state=open]:bg-transparent p-0">
                    Shop By Category
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[800px] lg:w-[900px] p-6 bg-white">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-x-8 gap-y-8">
                        {parentCategories.map((parent) => {
                          const children = getChildren(parent._id);
                          return (
                            <div key={parent._id} className="space-y-2">
                              <NavigationMenuLink asChild>
                                <Link
                                  to={`/products?category=${parent.name}`}
                                  className="block text-sm font-black text-neutral-900 uppercase tracking-wider hover:text-emerald-600 mb-2 content-none bg-transparent"
                                >
                                  {parent.name}
                                </Link>
                              </NavigationMenuLink>
                              {children.length > 0 ? (
                                <ul className="">
                                  {children.map((child) => (
                                    <li key={child._id}>
                                      <NavigationMenuLink asChild>
                                        <Link
                                          to={`/products?category=${parent.name}&subcategory=${child.name}`}
                                          className="text-sm text-neutral-600 hover:text-emerald-600 hover:translate-x-1 transition-all inline-block capitalize"
                                        >
                                          {child.name}
                                        </Link>
                                      </NavigationMenuLink>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-sm text-neutral-400">Browse all {parent.name}</p>
                              )}
                            </div>
                          );
                        })}

                        <div className="bg-neutral-50 rounded-2xl p-6 flex flex-col items-start justify-center">
                          <h3 className="text-lg font-bold text-neutral-900 mb-2">New Arrivals</h3>
                          <p className="text-sm text-neutral-500 mb-4">Check out the latest professional gear.</p>
                          <NavigationMenuLink asChild>
                            <Link to="/products">
                              <Button>Shop New</Button>
                            </Link>
                          </NavigationMenuLink>
                        </div>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink asChild className="bg-transparent">
                    <Link
                      to="/products"
                      className={navigationMenuTriggerStyle()}
                    >
                      See All Products
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-white">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b border-neutral-100">
              <span className="font-bold text-lg">Menu</span>
              <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-neutral-100 rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {!user && (
                <div className="grid grid-cols-2 gap-3">
                  <Link to="/auth/signin" className="py-3 text-center border border-neutral-200 rounded-xl font-bold text-sm">Login</Link>
                  <Link to="/auth/signup" className="py-3 text-center bg-neutral-900 text-white rounded-xl font-bold text-sm">Sign Up</Link>
                </div>
              )}

              <div className="space-y-2">
                <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4">Categories</h3>
                {parentCategories.map((parent) => {
                  const children = getChildren(parent._id);
                  return (
                    <div key={parent._id} className="border-b border-neutral-50 pb-2">
                      <button
                        onClick={() => {
                          navigate(`/products?category=${parent.name}`);
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center justify-between w-full py-2 text-left font-bold text-neutral-800"
                      >
                        {parent.name}
                        <ChevronRight size={16} className="text-neutral-300" />
                      </button>
                      {children.length > 0 && (
                        <div className="pl-4 space-y-2 mt-1 border-l-2 border-neutral-100">
                          {children.map(child => (
                            <Link
                              key={child._id}
                              to={`/products?category=${parent.name}&subcategory=${child.name}`}
                              className="block text-sm text-neutral-500 hover:text-emerald-600 py-1 capitalize"
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
          </div>
        </div>
      )}
    </header>
  );
}
