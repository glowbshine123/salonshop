import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLoading } from '../context/LoadingContext';
import { useAuth } from '../context/AuthContext';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Eye,
  EyeOff,
  Loader2,
  Sparkles,
  ChevronLeft
} from 'lucide-react';
import AuthSidePanel from "@/components/auth/AuthSidePanel";
import { settingsAPI } from '@/utils/apiClient';
import AuthFooter from '@/components/auth/AuthFooter';
import AuthHeader from '@/components/auth/AuthHeader';

export default function SignupPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [categories, setCategories] = useState('');
  const [userType, setUserType] = useState('SALON_OWNER');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [logoUrl, setLogoUrl] = useState(null);

  const navigate = useNavigate();
  const { finishLoading } = useLoading();
  const { register } = useAuth();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await settingsAPI.get();
        if (data?.logoUrl) {
          setLogoUrl(data.logoUrl);
        }
      } catch (err) {
        console.error("Failed to fetch settings:", err);
      } finally {
        finishLoading();
      }
    };
    fetchSettings();
  }, []);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (!firstName || !lastName || !email || !password || !confirmPassword || !phone) {
      setError('Please fill all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const user = await register({
        firstName,
        lastName,
        email,
        password,
        phone,
        categories,
        role: userType,
      });

      if (user.role === 'ADMIN') {
        navigate('/admin');
      } else if (user.role === 'AGENT') {
        navigate('/agent-dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Signup failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white font-body selection:bg-primary/10">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 md:p-12 lg:p-20 relative bg-white">

        {/* Decorative background element for luxury feel */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent-color to-primary-light" />

        {/* Back Button - Premium */}
        <Link
          to="/"
          className="absolute top-8 left-8 group"
        >
          <div className="flex items-center gap-2 px-4 py-2 bg-bg-secondary rounded-full text-[10px] font-bold uppercase tracking-widest text-neutral-400 group-hover:text-primary transition-all group-hover:shadow-lg group-hover:shadow-primary/5">
            <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            House
          </div>
        </Link>

        <div className="max-w-md w-full space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">

          {/* Header */}
          <div className="space-y-4">
            <div className="w-16 h-16 bg-bg-secondary rounded-[24px] flex items-center justify-center border border-primary/5 shadow-inner">
              <Sparkles className="text-primary animate-pulse" size={28} />
            </div>
            <div className="space-y-1">
              <h1 className="text-4xl md:text-5xl font-display font-black text-neutral-900 leading-[0.9] tracking-tighter">
                BECOME A <br />
                <span className="text-primary italic">PARTNER</span>.
              </h1>
              <p className="text-neutral-400 text-xs font-bold uppercase tracking-[0.2em]">
                Join our premium salon network today.
              </p>
            </div>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSignup} className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">First Name</Label>
                <Input
                  id="firstName"
                  placeholder="e.g. Alexis"
                  className="h-14 bg-bg-secondary border-0 rounded-2xl focus:ring-primary/20 transition-all font-medium placeholder:text-neutral-200"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Last Name</Label>
                <Input
                  id="lastName"
                  placeholder="e.g. Bloom"
                  className="h-14 bg-bg-secondary border-0 rounded-2xl focus:ring-primary/20 transition-all font-medium placeholder:text-neutral-200"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="luxury@salon.com"
                className="h-14 bg-bg-secondary border-0 rounded-2xl focus:ring-primary/20 transition-all font-medium placeholder:text-neutral-200"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Contact Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+91 00000 00000"
                className="h-14 bg-bg-secondary border-0 rounded-2xl focus:ring-primary/20 transition-all font-medium placeholder:text-neutral-200"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <Label htmlFor="categories" className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Trading Categories</Label>
                <span className="text-[8px] font-bold text-primary-light uppercase tracking-tighter bg-primary/5 px-2 py-0.5 rounded-full">Pro Tip: Use Commas</span>
              </div>
              <Input
                id="categories"
                placeholder="Escentials, Skincare, Haircare..."
                className="h-14 bg-bg-secondary border-0 rounded-2xl focus:ring-primary/20 transition-all font-medium placeholder:text-neutral-200"
                value={categories}
                onChange={e => setCategories(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Access Pin</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="h-14 bg-bg-secondary border-0 rounded-2xl focus:ring-primary/20 transition-all font-medium placeholder:text-neutral-200"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-300 hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Verify Pin</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="h-14 bg-bg-secondary border-0 rounded-2xl focus:ring-primary/20 transition-all font-medium placeholder:text-neutral-200"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-300 hover:text-primary transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-rose-50 text-rose-500 text-[10px] font-black uppercase tracking-widest rounded-2xl text-center border border-rose-100 flex items-center justify-center gap-2">
                <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-16 bg-primary hover:bg-primary-dark text-white font-black rounded-full tracking-[0.2em] uppercase transition-all shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                "Establish Membership"
              )}
            </Button>
          </form>

          {/* Footer Navigation */}
          <div className="space-y-8 pt-8 border-t border-primary/5">
            <p className="text-center text-xs font-bold text-neutral-400 uppercase tracking-widest">
              Part of our network?{' '}
              <Link to="/auth/signin" className="text-primary font-black hover:underline ml-1">
                Enter Ritual
              </Link>
            </p>
            <AuthFooter />
          </div>
        </div>
      </div>

      {/* Right Side - Visual Panel */}
      <AuthSidePanel />
    </div>
  );
}
