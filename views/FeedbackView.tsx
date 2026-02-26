import React, { useState } from 'react';
import { Star, Send, ThumbsUp, ThumbsDown, Bot, FileText } from 'lucide-react';

interface FeedbackViewProps {
  onLogout: () => void;
}

const FeedbackView: React.FC<FeedbackViewProps> = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    newBots: '',
    reportsFeedback: '',
    reportSatisfaction: null as 'yes' | 'no' | 'partial' | null,
    ratingSpeed: 0,
    ratingAccuracy: 0,
    ratingUI: 0
  });

  const handleRating = (field: 'ratingSpeed' | 'ratingAccuracy' | 'ratingUI', value: number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate submission
    setTimeout(() => {
        setIsSubmitted(true);
    }, 800);
  };

  if (isSubmitted) {
      return (
          <div className="flex flex-col items-center justify-center h-full bg-white p-8 animate-in zoom-in duration-300">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                  <ThumbsUp size={40} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
              <p className="text-center text-gray-500 mb-8">
                  Your feedback helps us make Resolution Bazaar better for everyone. We've received your inputs.
              </p>
              <button 
                onClick={() => setIsSubmitted(false)}
                className="bg-gray-100 text-gray-900 font-bold py-3 px-8 rounded-xl hover:bg-gray-200 transition-colors"
              >
                  Close
              </button>
          </div>
      );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-md px-6 pt-6 pb-4 border-b border-gray-100">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Feedback</h1>
      </header>

      {/* Form */}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            {/* Section 1: New Bots */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                    <Bot size={20} className="text-primary" />
                    <h3 className="font-bold text-gray-900 text-sm">Bot Wishlist</h3>
                </div>
                <label className="block text-sm text-gray-600 mb-3">
                    What new expert agents or bots would you like to see on the platform?
                </label>
                <textarea 
                    className="w-full bg-gray-50 border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder-gray-400 resize-none h-24"
                    placeholder="e.g., A dedicated HR specialist for policy questions..."
                    value={formData.newBots}
                    onChange={(e) => setFormData({...formData, newBots: e.target.value})}
                />
            </div>

            {/* Section 2: Reports Quality */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                    <FileText size={20} className="text-primary" />
                    <h3 className="font-bold text-gray-900 text-sm">Report Quality</h3>
                </div>
                
                <label className="block text-sm text-gray-600 mb-3">
                    Were the generated reports up to the mark?
                </label>
                <div className="grid grid-cols-3 gap-3 mb-4">
                    {['yes', 'partial', 'no'].map((option) => (
                        <button
                            key={option}
                            type="button"
                            onClick={() => setFormData({...formData, reportSatisfaction: option as any})}
                            className={`py-2 px-3 rounded-lg text-sm font-bold border transition-all capitalize ${
                                formData.reportSatisfaction === option 
                                ? 'bg-primary text-white border-primary shadow-md transform scale-105' 
                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                            {option}
                        </button>
                    ))}
                </div>

                <label className="block text-sm text-gray-600 mb-2">
                    Any specific improvements needed?
                </label>
                <textarea 
                    className="w-full bg-gray-50 border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder-gray-400 resize-none h-20"
                    placeholder="e.g., Reports need more detailed financial breakdowns..."
                    value={formData.reportsFeedback}
                    onChange={(e) => setFormData({...formData, reportsFeedback: e.target.value})}
                />
            </div>

            {/* Section 3: Scoring */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                    <Star size={20} className="text-primary" />
                    <h3 className="font-bold text-gray-900 text-sm">Rate Experience</h3>
                </div>

                <div className="space-y-5">
                    <RatingRow 
                        label="Response Speed" 
                        value={formData.ratingSpeed} 
                        onChange={(v) => handleRating('ratingSpeed', v)} 
                    />
                    <RatingRow 
                        label="Report Accuracy" 
                        value={formData.ratingAccuracy} 
                        onChange={(v) => handleRating('ratingAccuracy', v)} 
                    />
                    <RatingRow 
                        label="User Interface" 
                        value={formData.ratingUI} 
                        onChange={(v) => handleRating('ratingUI', v)} 
                    />
                </div>
            </div>

            <button 
                type="submit"
                className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl shadow-lg shadow-gray-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4"
            >
                Submit Feedback
                <Send size={18} />
            </button>
            <div className="h-4"></div>
        </form>
      </main>
    </div>
  );
};

const RatingRow: React.FC<{ label: string; value: number; onChange: (val: number) => void }> = ({ label, value, onChange }) => (
    <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => onChange(star)}
                    className="p-1 transition-transform hover:scale-110 focus:outline-none"
                >
                    <Star 
                        size={22} 
                        className={`transition-colors ${star <= value ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-100 text-gray-300'}`} 
                    />
                </button>
            ))}
        </div>
    </div>
);

export default FeedbackView;