import React, { useState } from 'react';
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
  ChevronLeft
} from 'lucide-react';
import AuthSidePanel from "@/components/auth/AuthSidePanel";
import AuthHeader from "@/components/auth/AuthHeader";
import AuthFooter from "@/components/auth/AuthFooter";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { finishLoading } = useLoading();
  const { login } = useAuth();

  React.useEffect(() => {
    finishLoading();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      const user = await login({ email, password });
      if (user.role === 'ADMIN') {
        navigate('/admin');
      } else if (user.role === 'AGENT') {
        navigate('/agent-dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
      finishLoading();
    }
  };

  return (
    <div className="flex min-h-screen bg-white font-body selection:bg-primary/10">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 md:p-12 lg:p-20 relative bg-white">

        {/* Decorative background element */}
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

        <div className="max-w-sm w-full space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">

          {/* Header */}
          <AuthHeader title="WELCOME BACK." subtitle="Enter your ritual space." />

          {/* Form Section */}
          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="luxury@salon.com"
                className="h-14 bg-bg-secondary border-0 rounded-2xl focus:ring-primary/20 transition-all font-medium placeholder:text-neutral-200"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <Label htmlFor="password" className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Access Pin</Label>
                <button type="button" className="text-[9px] font-black uppercase tracking-widest text-primary hover:text-primary-dark transition-colors">
                  Forgotten?
                </button>
              </div>
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
                "Enter Session"
              )}
            </Button>
          </form>

          {/* Footer Navigation */}
          <div className="space-y-8 pt-8 border-t border-primary/5">
            <p className="text-center text-xs font-bold text-neutral-400 uppercase tracking-widest">
              New to our house?{' '}
              <Link to="/auth/signup" className="text-primary font-black hover:underline ml-1">
                Create Membership
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
