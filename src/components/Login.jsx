import React, { useState } from 'react';

const Login = () => {
  const [role, setRole] = useState('student'); // 'student' or 'teacher'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const isStudent = role === 'student';

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login attempt with:', { role, email, password });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        
        {/* Logo Placeholder */}
        <div className="bg-blue-600 p-8 text-center">
          <div className="w-20 h-20 bg-white rounded-full mx-auto flex items-center justify-center shadow-inner mb-4">
            <span className="text-blue-600 font-bold text-xl tracking-wider">CUET</span>
          </div>
          <h2 className="text-2xl font-bold text-white">Resource Booking</h2>
        </div>

        <div className="p-8">
          {/* Role Toggle */}
          <div className="flex rounded-lg bg-gray-100 p-1 mb-8 shadow-inner">
            <button
              type="button"
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all duration-200 ${
                isStudent 
                  ? 'bg-white text-blue-700 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setRole('student')}
            >
              Student
            </button>
            <button
              type="button"
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all duration-200 ${
                !isStudent 
                  ? 'bg-white text-blue-700 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setRole('teacher')}
            >
              Teacher
            </button>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                {isStudent ? 'Student Email' : 'Teacher Email'}
              </label>
              <input
                id="email"
                type="email"
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm"
                placeholder={isStudent ? 'studentID@cuet.ac.bd' : 'teachername@cuet.ac.bd'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700" htmlFor="password">
                  Password
                </label>
                <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500 hover:underline transition-colors">
                  Forgot password?
                </a>
              </div>
              <input
                id="password"
                type="password"
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-md"
            >
              Log In
            </button>
          </form>

          {/* Sign Up Section */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600 mb-4">Don't have an account?</p>
            <a
              href="#"
              className="inline-block w-full py-3 px-4 rounded-lg font-medium text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
            >
              Sign Up here
            </a>
          </div>
        </div>
      </div>

      {/* Footer Text */}
      <div className="mt-8 text-center max-w-sm">
        <p className="text-xs text-gray-500">
          Access restricted to authorized CUET students and faculty only.
        </p>
      </div>
    </div>
  );
};

export default Login;
