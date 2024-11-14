import LoginForm from './components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-6">
        <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
          <header className="text-center">
            <h1 className="text-2xl font-bold text-mainColor-700 mb-2">
              Welcome Back
            </h1>
            <h1 className="text-4xl font-bold text-mainColor-700 mb-2">
              To Tapales Clinic
            </h1>
            <p className="text-gray-500 text-sm">Sign in to your account</p>
          </header>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
