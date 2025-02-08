export const dynamic = 'force-dynamic';

import VerifyEmailForm from '../components/auth/VerifyEmailForm';

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-6">
        <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
          <header className="text-center">
            <h1 className="text-2xl font-bold text-mainColor-700 mb-2">
              Verify Your Email
            </h1>
            <p className="text-gray-500 text-sm">
              Please enter the 6-digit code sent to your email
            </p>
          </header>
          <VerifyEmailForm />
        </div>
      </div>
    </div>
  );
} 