import ForgotPasswordForm from '../components/auth/ForgotPasswordForm';

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-6">
        <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
          <header className="text-center">
            <h1 className="text-2xl font-bold text-mainColor-700 mb-2">
              Forgot Password
            </h1>
            <p className="text-gray-500 text-sm">
              Enter your email to receive a password reset link
            </p>
          </header>
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  );
} 