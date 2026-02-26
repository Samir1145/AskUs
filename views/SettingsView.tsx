import React, { useState } from 'react';
import { 
  User, CreditCard, Bell, HelpCircle, ChevronRight, 
  LogOut, Shield, Sliders, Briefcase, Wallet, ArrowLeft, Plus,
  Download, Trash2, MessageSquare, ThumbsUp, Star, Send, Bot, FileText
} from 'lucide-react';

interface SettingsViewProps {
  onLogout: () => void;
  onBack: () => void;
}

type SubPage = 
  | 'PERSONAL_INFO' 
  | 'PAYMENT_METHODS' 
  | 'BILLING_HISTORY' 
  | 'BUSINESS_PROFILE' 
  | 'AGENT_PREFERENCES' 
  | 'NOTIFICATIONS' 
  | 'PRIVACY_SECURITY' 
  | 'HELP_SUPPORT' 
  | 'FEEDBACK'
  | null;

const SettingsView: React.FC<SettingsViewProps> = ({ onLogout, onBack }) => {
  const [activePage, setActivePage] = useState<SubPage>(null);

  // Feedback State
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackData, setFeedbackData] = useState({
    newBots: '',
    reportsFeedback: '',
    reportSatisfaction: null as 'yes' | 'no' | 'partial' | null,
    ratingSpeed: 0,
    ratingAccuracy: 0,
    ratingUI: 0
  });

  const renderHeader = (title: string) => (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 py-6 sticky top-0 z-10 flex items-center gap-3">
      <button 
        onClick={() => setActivePage(null)}
        className="p-1 -ml-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
      >
        <ArrowLeft size={24} />
      </button>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{title}</h1>
    </header>
  );

  const renderPersonalInfo = () => (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950">
      {renderHeader("Personal Information")}
      <div className="p-6 space-y-6">
        <div className="flex flex-col items-center mb-6">
           <div className="relative">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB-hWMD7_tY-hR-BNbyoZ00e0W2Hq6RP0mvZGwlihlhrq9WsDZ3R3P9Sz2olgYZc9ULr-YRUuOGbiqgju2_dgK5Xet8tJKsTITGhifE6dAWFb9TANSc1945T9RDq6lGLtBgT5XuGLEogulwCtIxnd281afH7TgINMw4C4_Y-BTK4ym-dnOCwSgEaVaPhOcDIX0VseTaC1KOU6dF3ToVszHJ71YhNHP7LkavuyaA0Sax_um1RkejDDcAby8X-YDPPsCciSF49Mq8sBoI" 
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-sm"
              />
              <button className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full shadow-md hover:opacity-90 transition-opacity">
                <Plus size={16} />
              </button>
           </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          <InputGroup label="Full Name" defaultValue="John Doe" />
          <InputGroup label="Email" defaultValue="john.doe@example.com" type="email" />
          <InputGroup label="Phone" defaultValue="+1 (555) 012-3456" type="tel" isLast />
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden p-4">
             <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Account Type</h3>
             <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Current Plan</span>
                <span className="text-sm font-bold text-primary bg-primary/10 px-2 py-1 rounded">Pro Member</span>
             </div>
        </div>

        <button className="w-full bg-primary text-white font-bold py-3 rounded-xl shadow-lg shadow-primary/20 active:scale-[0.98] transition-all hover:opacity-90">
          Save Changes
        </button>
      </div>
    </div>
  );

  const renderPaymentMethods = () => (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950">
      {renderHeader("Payment Methods")}
      <div className="p-6 space-y-6">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                    <CreditCard size={32} />
                    <span className="bg-white/20 px-2 py-1 rounded text-xs font-bold backdrop-blur-sm">Default</span>
                </div>
                <p className="font-mono text-xl tracking-widest mb-4">•••• •••• •••• 4242</p>
                <div className="flex justify-between items-end">
                    <div>
                        <p className="text-xs text-white/60 mb-1">Card Holder</p>
                        <p className="font-bold text-sm">JOHN DOE</p>
                    </div>
                    <div>
                        <p className="text-xs text-white/60 mb-1">Expires</p>
                        <p className="font-bold text-sm">12/25</p>
                    </div>
                </div>
            </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="p-4 flex items-center gap-4 border-b border-gray-50 dark:border-gray-800">
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <CreditCard size={20} />
                </div>
                <div className="flex-1">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">Visa ending in 4242</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Expiry 12/2025</p>
                </div>
                <button className="text-gray-400 hover:text-primary transition-colors"><Trash2 size={18} /></button>
            </div>
            <div className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800 text-gray-400 flex items-center justify-center">
                    <CreditCard size={20} />
                </div>
                <div className="flex-1">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">Mastercard ending in 8833</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Expiry 09/2024</p>
                </div>
                <button className="text-gray-400 hover:text-primary transition-colors"><Trash2 size={18} /></button>
            </div>
        </div>

        <button className="w-full border-2 border-dashed border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 font-bold py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-400 transition-all flex items-center justify-center gap-2">
          <Plus size={20} />
          Add Payment Method
        </button>
      </div>
    </div>
  );

  const renderBusinessProfile = () => (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950">
      {renderHeader("Business Profile")}
      <div className="p-6 space-y-6">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            These details will appear on your generated invoices.
        </p>
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          <InputGroup label="Company Name" defaultValue="Acme Corp" />
          <InputGroup label="Tax ID / VAT" defaultValue="US-99382910" />
          <div className="p-4 border-b border-gray-100 dark:border-gray-800">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Billing Address</label>
            <textarea 
                rows={3}
                className="w-full text-sm font-medium text-gray-900 dark:text-white bg-transparent border-none p-0 focus:ring-0 resize-none placeholder-gray-300"
                defaultValue="123 Innovation Dr, Tech City, CA 94000"
            />
          </div>
          <InputGroup label="Website" defaultValue="https://acme.com" isLast />
        </div>
        <button className="w-full bg-primary text-white font-bold py-3 rounded-xl shadow-lg shadow-primary/20 active:scale-[0.98] transition-all hover:opacity-90">
          Update Profile
        </button>
      </div>
    </div>
  );

  const renderAgentPreferences = () => (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950">
      {renderHeader("Agent Preferences")}
      <div className="p-6 space-y-6">
        <SectionTitle title="Autonomy" />
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <ToggleGroup label="Auto-approve tasks under ₹400" defaultChecked />
            <ToggleGroup label="Allow agents to start new chats" defaultChecked={false} />
            <ToggleGroup label="Allow voice messages" defaultChecked isLast />
        </div>

        <SectionTitle title="Personality" />
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden p-4">
             <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Default Tone</label>
             <div className="grid grid-cols-3 gap-2">
                 {['Formal', 'Friendly', 'Concise'].map((t => (
                     <button key={t} className={`py-2 rounded-lg text-sm font-bold border transition-all ${t === 'Friendly' ? 'bg-primary/10 border-primary text-primary' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'}`}>
                         {t}
                     </button>
                 )))}
             </div>
        </div>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950">
      {renderHeader("Notifications")}
      <div className="p-6 space-y-6">
        <SectionTitle title="Push Notifications" />
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <ToggleGroup label="Task Completions" defaultChecked />
            <ToggleGroup label="New Messages" defaultChecked />
            <ToggleGroup label="Daily Summaries" defaultChecked={false} isLast />
        </div>

        <SectionTitle title="Email" />
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <ToggleGroup label="Invoices & Billing" defaultChecked />
            <ToggleGroup label="Weekly Reports" defaultChecked />
            <ToggleGroup label="Product Updates" defaultChecked={false} isLast />
        </div>
      </div>
    </div>
  );

  const renderPrivacySecurity = () => (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950">
      {renderHeader("Privacy & Security")}
      <div className="p-6 space-y-6">
        <SectionTitle title="Security" />
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
             <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                    <Shield size={20} className="text-gray-400" />
                    <span className="text-sm font-bold text-gray-900 dark:text-white">Change Password</span>
                </div>
                <ChevronRight size={18} className="text-gray-300" />
             </button>
             <ToggleGroup label="Two-Factor Authentication (2FA)" defaultChecked isLast />
        </div>

        <SectionTitle title="Data & Privacy" />
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <ToggleGroup label="Share usage data" defaultChecked />
            <ToggleGroup label="Allow search indexing" defaultChecked={false} isLast />
        </div>
        
        <div className="mt-4">
             <button className="text-red-500 text-sm font-bold hover:underline">Delete Account</button>
        </div>
      </div>
    </div>
  );

  const renderHelpSupport = () => (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950">
      {renderHeader("Help & Support")}
      <div className="p-6 space-y-6">
         <div className="bg-primary rounded-xl p-6 text-white shadow-lg">
             <h3 className="text-lg font-bold mb-2">Need help with a task?</h3>
             <p className="text-white/80 text-sm mb-4">Our support agents are real humans ready to assist you with any platform issues.</p>
             <button className="bg-white text-primary font-bold py-2 px-4 rounded-lg shadow-sm hover:bg-gray-50 transition-colors w-full">
                 Contact Support
             </button>
         </div>

         <SectionTitle title="FAQs" />
         <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            {[
                "How do bills work?",
                "Can I cancel a task?",
                "What are verified agents?",
                "How to export data?"
            ].map((q, i) => (
                <button key={i} className={`w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left ${i !== 3 ? 'border-b border-gray-100 dark:border-gray-800' : ''}`}>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{q}</span>
                    <ChevronRight size={16} className="text-gray-300" />
                </button>
            ))}
         </div>
      </div>
    </div>
  );
  
  const renderBillingHistory = () => (
      <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950">
        {renderHeader("Billing Information")}
        <div className="p-6 space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden p-6 text-center">
                 <div className="w-16 h-16 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                     <Wallet size={32} />
                 </div>
                 <h3 className="text-lg font-bold text-gray-900 dark:text-white">Current Balance</h3>
                 <p className="text-3xl font-extrabold text-gray-900 dark:text-white my-2">₹0.00</p>
                 <p className="text-sm text-gray-500 dark:text-gray-400">No outstanding payments</p>
            </div>
            
            <SectionTitle title="Settings" />
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                 <InputGroup label="Billing Email" defaultValue="finance@acme.com" type="email" />
                 <div className="p-4 flex items-center justify-between border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                     <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Currency</span>
                     <div className="flex items-center gap-2">
                         <span className="text-sm text-gray-500 dark:text-gray-400">INR (₹)</span>
                         <ChevronRight size={16} className="text-gray-300" />
                     </div>
                 </div>
            </div>

            <button className="w-full flex items-center justify-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
                <Download size={18} />
                Download All Invoices
            </button>
        </div>
      </div>
  );

  const renderFeedback = () => {
    if (feedbackSubmitted) {
        return (
            <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950">
                {renderHeader("Feedback")}
                <div className="flex flex-col items-center justify-center flex-1 p-8 text-center animate-in zoom-in duration-300">
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-6">
                        <ThumbsUp size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Thank You!</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-8">
                        Your feedback helps us make AskUs better. We've received your inputs.
                    </p>
                    <button 
                        onClick={() => { setFeedbackSubmitted(false); setActivePage(null); }}
                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-bold py-3 px-8 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }

    const handleRating = (field: 'ratingSpeed' | 'ratingAccuracy' | 'ratingUI', value: number) => {
        setFeedbackData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmitFeedback = (e: React.FormEvent) => {
        e.preventDefault();
        setTimeout(() => setFeedbackSubmitted(true), 800);
    };

    const RatingRow: React.FC<{ label: string; value: number; onChange: (val: number) => void }> = ({ label, value, onChange }) => (
        <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
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
                            className={`transition-colors ${star <= value ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-100 dark:fill-gray-800 text-gray-300 dark:text-gray-600'}`} 
                        />
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950">
            {renderHeader("Feedback")}
            <main className="flex-1 overflow-y-auto">
                <form onSubmit={handleSubmitFeedback} className="p-6 space-y-6">
                    {/* New Bots */}
                    <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-2 mb-3">
                            <Bot size={20} className="text-primary" />
                            <h3 className="font-bold text-gray-900 dark:text-white text-sm">Bot Wishlist</h3>
                        </div>
                        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-3">
                            What new expert agents or bots would you like to see?
                        </label>
                        <textarea 
                            className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder-gray-400 dark:text-white resize-none h-24"
                            placeholder="e.g., A dedicated HR specialist..."
                            value={feedbackData.newBots}
                            onChange={(e) => setFeedbackData({...feedbackData, newBots: e.target.value})}
                        />
                    </div>

                    {/* Report Quality */}
                    <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-2 mb-4">
                            <FileText size={20} className="text-primary" />
                            <h3 className="font-bold text-gray-900 dark:text-white text-sm">Report Quality</h3>
                        </div>
                        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-3">
                            Were reports up to the mark?
                        </label>
                        <div className="grid grid-cols-3 gap-3 mb-4">
                            {['yes', 'partial', 'no'].map((option) => (
                                <button
                                    key={option}
                                    type="button"
                                    onClick={() => setFeedbackData({...feedbackData, reportSatisfaction: option as any})}
                                    className={`py-2 px-3 rounded-lg text-sm font-bold border transition-all capitalize ${
                                        feedbackData.reportSatisfaction === option 
                                        ? 'bg-primary text-white border-primary shadow-md transform scale-105' 
                                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                        <textarea 
                            className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder-gray-400 dark:text-white resize-none h-20"
                            placeholder="Specific improvements needed..."
                            value={feedbackData.reportsFeedback}
                            onChange={(e) => setFeedbackData({...feedbackData, reportsFeedback: e.target.value})}
                        />
                    </div>

                    {/* Scoring */}
                    <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-2 mb-4">
                            <Star size={20} className="text-primary" />
                            <h3 className="font-bold text-gray-900 dark:text-white text-sm">Rate Experience</h3>
                        </div>
                        <div className="space-y-5">
                            <RatingRow 
                                label="Response Speed" 
                                value={feedbackData.ratingSpeed} 
                                onChange={(v) => handleRating('ratingSpeed', v)} 
                            />
                            <RatingRow 
                                label="Report Accuracy" 
                                value={feedbackData.ratingAccuracy} 
                                onChange={(v) => handleRating('ratingAccuracy', v)} 
                            />
                            <RatingRow 
                                label="User Interface" 
                                value={feedbackData.ratingUI} 
                                onChange={(v) => handleRating('ratingUI', v)} 
                            />
                        </div>
                    </div>

                    <button 
                        type="submit"
                        className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold py-4 rounded-xl shadow-lg shadow-gray-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4"
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

  // Main Render Logic
  if (activePage === 'PERSONAL_INFO') return renderPersonalInfo();
  if (activePage === 'PAYMENT_METHODS') return renderPaymentMethods();
  if (activePage === 'BUSINESS_PROFILE') return renderBusinessProfile();
  if (activePage === 'AGENT_PREFERENCES') return renderAgentPreferences();
  if (activePage === 'NOTIFICATIONS') return renderNotifications();
  if (activePage === 'PRIVACY_SECURITY') return renderPrivacySecurity();
  if (activePage === 'HELP_SUPPORT') return renderHelpSupport();
  if (activePage === 'BILLING_HISTORY') return renderBillingHistory();
  if (activePage === 'FEEDBACK') return renderFeedback();

  // Default Main View
  return (
    <div className="flex flex-col h-full bg-[#f3f4f6] dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 pt-6 pb-4 sticky top-0 z-10 flex items-center gap-3">
        <button 
          onClick={onBack}
          className="p-1 -ml-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Settings</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-4">
        {/* Profile Card Removed as moved to Chat Listing Header */}

        {/* Menu Items */}
        <div className="space-y-px bg-gray-100 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-800">
            {/* Account Group */}
             <div className="bg-gray-50 dark:bg-gray-950 px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800 sticky top-0">
                Account & Finance
             </div>
            <MenuItem icon={<User size={20} />} label="Personal Information" onClick={() => setActivePage('PERSONAL_INFO')} />
            <MenuItem icon={<CreditCard size={20} />} label="Payment Methods" onClick={() => setActivePage('PAYMENT_METHODS')} />
            <MenuItem icon={<Wallet size={20} />} label="Billing Information" onClick={() => setActivePage('BILLING_HISTORY')} />
            <MenuItem icon={<Briefcase size={20} />} label="Business Profile" onClick={() => setActivePage('BUSINESS_PROFILE')} />

            {/* App Preferences */}
             <div className="bg-gray-50 dark:bg-gray-950 px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider border-y border-gray-100 dark:border-gray-800 sticky top-0">
                Workflow
             </div>
            <MenuItem icon={<Sliders size={20} />} label="Agent Preferences" onClick={() => setActivePage('AGENT_PREFERENCES')} />
            <MenuItem icon={<Bell size={20} />} label="Notifications" onClick={() => setActivePage('NOTIFICATIONS')} />
            
            {/* Security */}
             <div className="bg-gray-50 dark:bg-gray-950 px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider border-y border-gray-100 dark:border-gray-800 sticky top-0">
                Security & Support
             </div>
            <MenuItem icon={<Shield size={20} />} label="Privacy & Security" onClick={() => setActivePage('PRIVACY_SECURITY')} />
            <MenuItem icon={<HelpCircle size={20} />} label="Help & Support" onClick={() => setActivePage('HELP_SUPPORT')} />
            <MenuItem icon={<MessageSquare size={20} />} label="Send Feedback" onClick={() => setActivePage('FEEDBACK')} />
        </div>

        <div className="mt-4 text-center px-6 pb-6">
          <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">AskUs v1.0.0</p>
        </div>
      </main>
    </div>
  );
};

// --- Helper Components ---

const MenuItem = ({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) => (
    <button onClick={onClick} className="w-full flex items-center justify-between bg-white dark:bg-gray-900 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors active:bg-gray-100 dark:active:bg-gray-700">
        <div className="flex items-center gap-4">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
            {icon}
        </div>
        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{label}</span>
        </div>
        <ChevronRight className="text-gray-300 dark:text-gray-600" size={18} />
    </button>
);

const InputGroup = ({ label, defaultValue, type = "text", isLast = false }: { label: string, defaultValue: string, type?: string, isLast?: boolean }) => (
    <div className={`p-4 ${!isLast ? 'border-b border-gray-100 dark:border-gray-800' : ''}`}>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
        <input 
            type={type} 
            defaultValue={defaultValue} 
            className="w-full text-sm font-medium text-gray-900 dark:text-white bg-transparent border-none p-0 focus:ring-0 placeholder-gray-300"
        />
    </div>
);

const ToggleGroup = ({ label, defaultChecked, isLast = false }: { label: string, defaultChecked?: boolean, isLast?: boolean }) => {
    const [checked, setChecked] = useState(defaultChecked);
    return (
        <div className={`p-4 flex items-center justify-between ${!isLast ? 'border-b border-gray-100 dark:border-gray-800' : ''}`}>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-200">{label}</span>
            <button 
                onClick={() => setChecked(!checked)}
                className={`w-11 h-6 rounded-full transition-colors relative ${checked ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}
            >
                <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${checked ? 'translate-x-5' : ''}`} />
            </button>
        </div>
    );
};

const SectionTitle = ({ title }: { title: string }) => (
    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 pl-1">{title}</h3>
);

export default SettingsView;