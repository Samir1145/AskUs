import React, { useState } from 'react';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';

interface LoginViewProps {
  onLogin: () => void;
  onNavigateToRegister: () => void;
  onNavigateToForgot: () => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin, onNavigateToRegister, onNavigateToForgot }) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="flex flex-col h-full bg-white p-8 justify-center animate-in fade-in duration-500">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
        <p className="text-gray-500">Sign in to continue to Resolution Bazaar</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
          <input 
            type="email" 
            required
            className="w-full px-4 py-3 rounded-xl bg-gray-50 border-gray-100 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all outline-none"
            placeholder="john@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"}
              required
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border-gray-100 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all outline-none"
              placeholder="••••••••"
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <div className="flex justify-end mt-2">
            <button type="button" onClick={onNavigateToForgot} className="text-sm font-semibold text-primary">Forgot Password?</button>
          </div>
        </div>

        <button 
          type="submit"
          className="w-full bg-primary text-white font-bold py-4 rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 hover:opacity-90"
        >
          Sign In
          <ArrowRight size={20} />
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-gray-500">Don't have an account? <button onClick={onNavigateToRegister} className="text-primary font-bold ml-1">Sign Up</button></p>
      </div>
    </div>
  );
};

export default LoginView;