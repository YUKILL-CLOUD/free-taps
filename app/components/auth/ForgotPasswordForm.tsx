'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      setSuccess(true);
    } catch (error) {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {success ? (
        <div className="text-center">
          <h2 className="text-xl font-semibold text-green-600 mb-2">Check Your Email</h2>
          <p className="text-gray-600">
            If an account exists for {email}, you will receive a password reset link.
          </p>
          <Link 
            href="/"
            className="block mt-4 text-mainColor-600 hover:text-mainColor-700"
          >
            Back to Login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mainColor-500"
              placeholder="Enter your email"
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded">{error}</div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-mainColor-600 text-white py-2 px-4 rounded-md hover:bg-mainColor-700 transition-colors duration-200 disabled:opacity-50"
          >
            {isLoading ? 'Sending...' : 'Reset Password'}
          </button>

          <div className="text-center text-sm text-gray-500">
            Remember your password?{' '}
            <Link 
              href="/"
              className="text-mainColor-600 hover:text-mainColor-700 font-medium"
            >
              Sign in
            </Link>
          </div>
        </form>
      )}
    </div>
  );
} 