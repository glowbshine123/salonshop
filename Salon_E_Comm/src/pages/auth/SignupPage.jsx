import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLoading } from '../../context/LoadingContext';
import { useAuth } from '../../context/AuthContext';
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
    <div className="flex min-h-screen bg-white">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 p-2 h-screen sticky top-0">
        <div className="h-full bg-input-bg p-4 md:p-12 flex flex-col justify-center relative overflow-y-auto scrollbar-hide">

          {/* Back Button */}
          <Link to="/" className="absolute top-4 left-4">
            <Button variant="outline" className="border-border-strong border rounded-sm hover:bg-transparent gap-1">
              <ChevronLeft size={20} />
              Home
            </Button>
          </Link>

          <div className="max-w-xs w-full mx-auto relative z-10 space-y-4 pt-128">
            {/* Branding */}
            <AuthHeader title="Get Started." subtitle="Create your account to get started." />

            {/* Form */}
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" placeholder="John" className="h-12 bg-input-bg border-border-strong rounded-sm" value={firstName} onChange={e => setFirstName(e.target.value)} required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" placeholder="Doe" className="h-12 bg-input-bg border-border-strong rounded-sm" value={lastName} onChange={e => setLastName(e.target.value)} required />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="name@example.com" className="h-12 bg-input-bg border-border-strong rounded-sm" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>

              <div className="space-y-1">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" placeholder="+91 00000 00000" className="h-12 bg-input-bg border-border-strong rounded-sm" value={phone} onChange={e => setPhone(e.target.value)} required />
              </div>

              <div className="space-y-1">
                <Label htmlFor="categories">Categories (What you are selling, comma separated)</Label>
                <Input id="categories" placeholder="Chair, hair brush, etc." className="h-12 bg-input-bg border-border-strong rounded-sm" value={categories} onChange={e => setCategories(e.target.value)} />
              </div>

              <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="h-12 bg-input-bg border-border-strong pr-10 rounded-sm"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="h-12 bg-input-bg border-border-strong pr-10 rounded-sm"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-600 text-[10px] font-bold uppercase tracking-wide rounded-sm text-center">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full h-12 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-sm tracking-wide" disabled={loading}>
                {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
                CREATE ACCOUNT
              </Button>
            </form>

            <p className="text-center text-sm font-medium text-foreground">
              Already have an account?{' '}
              <Link to="/auth/signin" className="text-foreground font-bold hover:underline">
                Sign In
              </Link>
            </p>

            <AuthFooter />
          </div>
        </div>
      </div>

      <AuthSidePanel />
    </div>
  );
}
