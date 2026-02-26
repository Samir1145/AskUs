import React, { useState } from 'react';
import { ArrowLeft, Mail } from 'lucide-react';

interface ForgotPasswordViewProps {
  onNavigateToLogin: () => void;
}

const ForgotPasswordView: React.FC<ForgotPasswordViewProps> = ({ onNavigateToLogin }) => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="flex flex-col h-full bg-white p-8 animate-in slide-in-from-right duration-300">
      <button onClick={onNavigateToLogin} className="self-start p-2 -ml-2 text-gray-400 hover:text-gray-900 mb-6">
        <ArrowLeft size={24} />
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h1>
        <p className="text-gray-500">Don't worry! It happens. Please enter the email associated with your account.</p>
      </div>

      {!submitted ? (
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

          <button 
            type="submit"
            className="w-full bg-primary text-white font-bold py-4 rounded-xl active:scale-[0.98] transition-all"
          >
            Reset Password
          </button>
        </form>
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-8 animate-in fade-in zoom-in duration-300">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
            <Mail size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Email Sent</h3>
          <p className="text-gray-500 mb-8">We have sent a password reset link to your email address.</p>
          <button 
            onClick={onNavigateToLogin}
            className="w-full bg-gray-100 text-gray-900 font-bold py-3 rounded-xl hover:bg-gray-200 transition-all"
          >
            Back to Login
          </button>
        </div>
      )}
    </div>
  );
};

export default ForgotPasswordView;