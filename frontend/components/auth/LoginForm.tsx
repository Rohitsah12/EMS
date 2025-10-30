'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function LoginForm() {
  const router = useRouter();
  const { login, isLoading, error, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    } else {
      const timer = setTimeout(() => setIsChecking(false), 600);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = await login(formData);
      if (result.meta.requestStatus === 'fulfilled') {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // 🔄 Show loading while checking authentication
  if (isChecking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 text-white transition-all duration-700 ease-in-out">
        <div className="flex flex-col items-center space-y-6 animate-fadeIn">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-blue-400 border-t-transparent animate-spin"></div>
            <Briefcase className="absolute inset-0 m-auto w-7 h-7 text-blue-300 animate-pulse" />
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold tracking-wide text-blue-100">Checking authentication...</p>
            <p className="text-sm text-blue-300 mt-1">Please wait a moment</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 p-4 text-white">
      <Card className="w-full max-w-md shadow-2xl border border-blue-700/40 bg-blue-900/70 backdrop-blur-lg text-white">
        <CardHeader className="space-y-4 text-center pb-8">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
            <Briefcase className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold text-white">Employee</CardTitle>
            <CardDescription className="text-blue-200 text-base mt-2">
              Management System
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-100/90 border border-red-300 rounded-lg flex items-start gap-2 text-red-800">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-blue-100">
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="h-11 bg-blue-800/60 border border-blue-600/50 text-white placeholder:text-blue-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2 relative">
              <Label htmlFor="password" className="text-sm font-semibold text-blue-100">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className="h-11 bg-blue-800/60 border border-blue-600/50 text-white placeholder:text-blue-300 focus:ring-2 focus:ring-blue-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300 hover:text-blue-100"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-150"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-blue-200">
            <p>Use your company credentials to access the portal</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
