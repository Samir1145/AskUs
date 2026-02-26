import React, { useState, useRef, useEffect } from 'react';
import { Eye, EyeOff, ArrowLeft, Mic, Globe } from 'lucide-react';
import { INDIAN_LANGUAGES } from '../constants';

interface RegisterViewProps {
  onRegister: () => void;
  onNavigateToLogin: () => void;
  language: string;
  onLanguageChange: (lang: string) => void;
}

const RegisterView: React.FC<RegisterViewProps> = ({ onRegister, onNavigateToLogin, language, onLanguageChange }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [description, setDescription] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onstart = () => setIsListening(true);
      recognitionRef.current.onend = () => setIsListening(false);
      
      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
             setDescription(prev => {
                 const spacer = prev.length > 0 && !prev.endsWith(' ') ? ' ' : '';
                 return prev + spacer + finalTranscript;
             });
        }
      };
    }
  }, []);

  const toggleMic = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim()) {
        onRegister();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white p-6 animate-in slide-in-from-right duration-300 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button 
            onClick={onNavigateToLogin} 
            className="p-2 -ml-2 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
        >
            <ArrowLeft size={26} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Create Account</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Language</label>
          <div className="relative">
            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <select
                value={language}
                onChange={(e) => onLanguageChange(e.target.value)}
                className="w-full pl-12 pr-5 py-4 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-primary/20 text-gray-900 transition-all outline-none font-medium appearance-none"
            >
                {INDIAN_LANGUAGES.map(lang => (
                    <option key={lang.code} value={lang.code}>
                        {lang.native} ({lang.name})
                    </option>
                ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                ▼
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
          <input 
            type="text" 
            required
            className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-primary/20 text-gray-900 placeholder-gray-400 transition-all outline-none font-medium"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
          <input 
            type="email" 
            required
            className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-primary/20 text-gray-900 placeholder-gray-400 transition-all outline-none font-medium"
            placeholder="john@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"}
              required
              className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-primary/20 text-gray-900 placeholder-gray-400 transition-all outline-none font-medium"
              placeholder="••••••••"
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Initial Use Case / Description <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <textarea 
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-primary/20 text-gray-900 placeholder-gray-400 transition-all outline-none font-medium resize-none h-36"
              placeholder="Briefly describe what tasks or problems you want the AI agents to help you solve..."
            />
            <button 
              type="button"
              onClick={toggleMic}
              className={`absolute right-3 bottom-3 p-2 rounded-full transition-colors ${
                  isListening ? 'bg-red-50 text-red-500 animate-pulse' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
              title="Speak Description"
            >
              <Mic size={20} />
            </button>
          </div>
        </div>

        <div className="pt-4 pb-8">
            <button 
              type="submit"
              disabled={!description.trim()}
              className="w-full bg-gray-900 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl active:scale-[0.98] transition-all"
            >
              Sign Up
            </button>
            <p className="text-center text-gray-500 mt-6 font-medium">
                Already have an account? <button onClick={onNavigateToLogin} className="text-primary font-bold ml-1 hover:underline">Sign In</button>
            </p>
        </div>
      </form>
    </div>
  );
};

export default RegisterView;