import React, { useState } from 'react';
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
    <div className="flex min-h-screen bg-white">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 p-2 flex flex-col relative ">
        <div className="flex-1  bg-neutral-50/50 p-8 md:p-12 flex flex-col justify-center relative overflow-hidden">

          {/* Back Button */}
          <Link to="/" className="absolute top-4 left-4">
            <Button variant="outline" className="border-neutral-800 border rounded-sm hover:bg-transparent gap-1">
              <ChevronLeft size={20} />
              Home
            </Button>
          </Link>

          <div className="max-w-sm w-full mx-auto relative z-10 space-y-4">
            {/* Branding */}
            <AuthHeader title="Welcome Back." subtitle="Login to your Account." />

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="h-12 bg-input-bg border-border-strong rounded-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <button type="button" className="text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-neutral-900 transition-colors">
                    Forgot?
                  </button>
                </div>
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

              {error && (
                <div className="p-3 bg-red-50 text-red-600 text-[10px] font-bold uppercase tracking-wide rounded-sm text-center">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full h-12 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-sm tracking-wide" disabled={loading}>
                {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
                SIGN IN
              </Button>
            </form>

            <p className="text-center text-sm font-medium text-foreground">
              Don't have an account?{' '}
              <Link to="/auth/signup" className="font-bold hover:underline">
                Create Account
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
