'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    
    try {
      const res = await signIn('credentials', {
        email: formData.get('email'),
        password: formData.get('password'),
        redirect: false,
      });

      if (res?.error) {
        setError('Invalid credentials');
        return;
      }

      // Get the session to check user role
      const response = await fetch('/api/auth/session');
      const session = await response.json();

      // Redirect based on role
      if (session?.user?.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/list/home');
      }
      
      router.refresh();
    } catch (error) {
      setError('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="Enter your email"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mainColor-500 focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="Enter your password"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mainColor-500 focus:border-transparent pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 px-3 flex items-center"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5 text-gray-500" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-500" />
                )}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded">{error}</div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-mainColor-600 text-white py-2 px-4 rounded-md hover:bg-mainColor-700 transition-colors duration-200 disabled:opacity-50"
        >
          {isLoading ? 'Loading...' : 'Sign In'}
        </button>
      </form>

      <div className="text-center text-sm text-gray-500">
        <div className="mb-2">
          <Link 
            href="/forgot-password" 
            className="text-mainColor-600 hover:text-mainColor-700 font-medium"
          >
            Forgot your password?
          </Link>
        </div>
        Don&apos;t have an account?{' '}
        <Link 
          href="/register" 
          className="text-mainColor-600 hover:text-mainColor-700 font-medium"
        >
          Sign up
        </Link>
      </div>
    </div>
  );
}
