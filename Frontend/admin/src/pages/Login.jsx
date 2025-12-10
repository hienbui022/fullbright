import LoginForm from '../components/Auth/LoginForm';

const Login = () => {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img
          src="https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=1471&auto=format&fit=crop"
          alt="English Learning"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-blue-900/40 flex items-center justify-center">
          <div className="text-center text-white p-8">
            <h2 className="text-4xl font-bold mb-4">English Fullbright</h2>
            <p className="text-xl">Leading English Learning Platform in Vietnam</p>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <img
              src="https://img.icons8.com/color/96/000000/graduation-cap.png"
              alt="Logo"
              className="mx-auto h-16 w-16"
            />
            <h1 className="mt-4 text-3xl font-extrabold text-gray-900">English Fullbright</h1>
            <p className="mt-2 text-sm text-gray-600">Content Management System</p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default Login;