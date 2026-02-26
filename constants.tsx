import React from 'react';
import { 
  FileText, Check, FileSpreadsheet, Mail, Zap, Search, AlertCircle, Book, Edit3, ListFilter,
  FileSearch, Compass, CheckSquare, LayoutDashboard, Database, Sigma, Merge, Target, Library,
  ClipboardCheck, CalendarClock, PenTool, Scale, TrendingUp, MessageSquare, ShieldCheck,
  FileSignature, AlertTriangle, Briefcase, FileLock, Megaphone, Calendar, Swords, Pen,
  LineChart, FileCode, Map, Users, FlaskConical, Brain, Phone, FilePlus, Sun, BarChart2,
  Eye, Send, Stethoscope, GraduationCap
} from 'lucide-react';
import { Agent } from './types';

export interface Skill {
  label: string;
  prompt: string;
  icon: React.ReactNode;
}

export interface AgentTemplate {
    name: string;
    description: string;
}

export const DollarSignIcon = ({ size }: { size: number }) => <span style={{ fontSize: size, fontWeight: 'bold' }}>₹</span>;

export type CategoryType = 'Doctors' | 'Lawyers' | 'Teachers' | 'Experts';

export const INDIAN_LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'ur', name: 'Urdu', native: 'اُردُو' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ' },
  { code: 'as', name: 'Assamese', native: 'অসমীয়া' }
];

export const CATEGORIES: { id: CategoryType; label: string; icon: React.ReactNode; color: string }[] = [
  { id: 'Doctors', label: 'Doctors', icon: <Stethoscope size={28} />, color: 'bg-rose-100 text-rose-600' },
  { id: 'Lawyers', label: 'Lawyers', icon: <Scale size={28} />, color: 'bg-slate-100 text-slate-600' },
  { id: 'Teachers', label: 'Teachers', icon: <GraduationCap size={28} />, color: 'bg-amber-100 text-amber-600' },
  { id: 'Experts', label: 'Experts', icon: <Briefcase size={28} />, color: 'bg-blue-100 text-blue-600' },
];

export const AVATAR_COLORS = [
  'bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500', 
  'bg-rose-500', 'bg-cyan-500', 'bg-indigo-500', 'bg-fuchsia-500', 'bg-teal-500'
];

export const getAvatarColor = (text: string) => {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

export const getInitials = (text: string) => {
  if (!text) return '?';
  // Remove non-alphanumeric chars for cleaner initials if needed, keeping simple here
  return text
    .split(' ')
    .filter(p => p.length > 0)
    .map(word => word[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
};

export const DOCTORS_DATA: AgentTemplate[] = [
    { name: 'Cardiologist (Heart)', description: 'Expert in heart health, cardiovascular systems, and blood pressure management.' },
    { name: 'Neurologist (Brain)', description: 'Specialist in treating disorders of the brain, spinal cord, and nervous system.' },
    { name: 'Gastroenterologist (Digestive)', description: 'Focused on digestive health, gastrointestinal diseases, and liver conditions.' },
    { name: 'Nephrologist (Kidneys)', description: 'Specialized care for kidney health, renal failure, and hypertension.' },
    { name: 'Orthopedic (Bones)', description: 'Expert in the musculoskeletal system, including bones, joints, ligaments, and tendons.' },
    { name: 'Endocrinologist (Hormones)', description: 'Treating hormonal imbalances, diabetes, thyroid issues, and metabolic disorders.' },
    { name: 'Pulmonologist (Lungs)', description: 'Specialist in respiratory health, asthma, COPD, and lung conditions.' },
    { name: 'Gynecologist (Female Repro)', description: 'Focused on female reproductive health, pregnancy, and childbirth.' },
    { name: 'Oncologist (Cancer)', description: 'Specialized in the diagnosis, treatment, and prevention of cancer.' },
    { name: 'Ophthalmologist (Eyes)', description: 'Expert care for eye health, vision disorders, and eye surgery.' },
    { name: 'ENT (Ear, Nose, Throat)', description: 'Treating conditions affecting the ear, nose, throat, and head/neck region.' },
    { name: 'Dermatologist (Skin)', description: 'Specialist in skin, hair, and nail conditions, including cosmetic procedures.' },
    { name: 'Psychiatrist (Mental Health)', description: 'Expert in diagnosing and treating mental health disorders and emotional issues.' }
];

export const LAWYERS_DATA: AgentTemplate[] = [
    { name: 'Civil Litigation', description: 'Representation in non-criminal disputes, lawsuits, and conflict resolution.' },
    { name: 'Corporate Counsel', description: 'Strategic legal advice for business operations, mergers, and corporate governance.' },
    { name: 'Criminal Defense', description: 'Legal defense and representation for individuals facing criminal charges.' },
    { name: 'Family Law', description: 'Assistance with divorce, child custody, adoption, and family disputes.' },
    { name: 'Intellectual Property', description: 'Protection of patents, trademarks, copyrights, and trade secrets.' },
    { name: 'Real Estate', description: 'Legal guidance for property transactions, zoning, and tenant disputes.' },
    { name: 'Tax Law', description: 'Expert advice on tax planning, compliance, and resolving tax disputes.' },
    { name: 'Immigration', description: 'Assistance with visas, citizenship, residency, and asylum proceedings.' },
    { name: 'Employment Law', description: 'Guidance on workplace rights, contracts, discrimination, and labor regulations.' }
];

export const TEACHERS_DATA: AgentTemplate[] = [
    { name: 'Mathematics Teacher', description: 'Tutoring in algebra, calculus, geometry, statistics, and logical reasoning.' },
    { name: 'Physics Teacher', description: 'Guidance in mechanics, thermodynamics, electromagnetism, and quantum physics.' },
    { name: 'Chemistry Teacher', description: 'Support with organic, inorganic, and physical chemistry concepts.' },
    { name: 'Biology Teacher', description: 'Tutoring in genetics, ecology, cellular biology, and human anatomy.' },
    { name: 'English Lit Teacher', description: 'Analysis of literary works, essay writing, and grammar improvement.' },
    { name: 'History Teacher', description: 'Insights into world history, ancient civilizations, and modern events.' },
    { name: 'Comp Sci Teacher', description: 'Programming, algorithms, data structures, and software development help.' },
    { name: 'Economics Teacher', description: 'Understanding micro and macro-economic principles and market dynamics.' }
];

export const EXPERT_AGENTS_DATA: Agent[] = [
  { 
    id: 'expert_cs', 
    name: 'Customer Support Specialist', 
    avatar: 'https://robohash.org/customer_support_specialist.png?set=set5&size=200x200', 
    description: 'Dedicated to resolving client inquiries efficiently and maintaining high levels of customer satisfaction.', 
    isVerified: true 
  },
  { 
    id: 'expert_data', 
    name: 'Data Specialist', 
    avatar: 'https://robohash.org/data_specialist.png?set=set5&size=200x200', 
    description: 'Experts in analyzing complex datasets to extract actionable insights and visualize trends.', 
    isVerified: true 
  },
  { 
    id: 'expert_search', 
    name: 'Enterprise Search Specialist', 
    avatar: 'https://robohash.org/enterprise_search_specialist.png?set=set5&size=200x200', 
    description: 'Focused on optimizing information retrieval systems to ensure access to critical knowledge.', 
    isVerified: true 
  },
  { 
    id: 'expert_finance', 
    name: 'Finance Professional', 
    avatar: 'https://robohash.org/finance_professional.png?set=set5&size=200x200', 
    description: 'Providing strategic financial planning, auditing support, and detailed analysis.', 
    isVerified: true 
  },
  { 
    id: 'expert_legal', 
    name: 'Legal Professional', 
    avatar: 'https://robohash.org/legal_professional.png?set=set5&size=200x200', 
    description: 'Offering guidance on regulatory compliance, contract review, and risk management.', 
    isVerified: true 
  },
  { 
    id: 'expert_marketing', 
    name: 'Marketing Specialist', 
    avatar: 'https://robohash.org/marketing_specialist.png?set=set5&size=200x200', 
    description: 'Crafting compelling brand narratives and strategic campaigns across various channels.', 
    isVerified: true 
  },
  { 
    id: 'expert_pm', 
    name: 'Product Management Professional', 
    avatar: 'https://robohash.org/product_management_professional.png?set=set5&size=200x200', 
    description: 'Overseeing product lifecycles from conception to launch, ensuring alignment with market needs.', 
    isVerified: true 
  },
  { 
    id: 'expert_prod', 
    name: 'Productivity Consultant', 
    avatar: 'https://robohash.org/productivity_consultant.png?set=set5&size=200x200', 
    description: 'Streamlining personal and organizational workflows to optimize time management.', 
    isVerified: true 
  },
  { 
    id: 'expert_sales', 
    name: 'Sales Specialist', 
    avatar: 'https://robohash.org/sales_specialist.png?set=set5&size=200x200', 
    description: 'Driving revenue growth through strategic account management and lead generation.', 
    isVerified: true 
  },
  { 
    id: 'expert_insolvency', 
    name: 'Insolvency Professional', 
    avatar: 'https://robohash.org/insolvency_professional.png?set=set5&size=200x200', 
    description: 'Specializing in corporate restructuring, bankruptcy proceedings, and insolvency resolution.', 
    isVerified: true 
  },
  { 
    id: 'expert_valuer', 
    name: 'Registered Valuer', 
    avatar: 'https://robohash.org/registered_valuer.png?set=set5&size=200x200', 
    description: 'Providing accurate, compliant, and market-based valuation services.', 
    isVerified: true 
  },
];

export const DEFAULT_SKILLS: Skill[] = [
  { icon: <FileText size={16} />, label: "Summarize conversation", prompt: "Please summarize our conversation so far and highlight key points." },
  { icon: <Check size={16} />, label: "Extract action items", prompt: "Create a checklist of action items based on our discussion." },
  { icon: <FileSpreadsheet size={16} />, label: "Generate Report", prompt: "Generate a formal report based on the information we've discussed." },
  { icon: <Mail size={16} />, label: "Draft follow-up email", prompt: "Draft a follow-up email summarizing the conclusions of this project." },
  { icon: <Zap size={16} />, label: "Brainstorm next steps", prompt: "Based on the current status, brainstorm 3 creative next steps." }
];

export const EXPERT_SKILLS_MAP: Record<string, Skill[]> = {
  'expert_cs': [
    { label: "Customer Research", prompt: "Analyze the customer's history and behavior patterns.", icon: <Search size={16} /> },
    { label: "Escalation", prompt: "Draft an escalation response for this high-priority issue.", icon: <AlertCircle size={16} /> },
    { label: "Knowledge Management", prompt: "Review and update the knowledge base with this new info.", icon: <Book size={16} /> },
    { label: "Response Drafting", prompt: "Draft an empathetic and accurate response to the customer.", icon: <Edit3 size={16} /> },
    { label: "Ticket Triage", prompt: "Categorize and prioritize this support request.", icon: <ListFilter size={16} /> }
  ],
  'expert_data': [
    { label: "Data Context Extractor", prompt: "Identify relevant context from the provided unstructured data.", icon: <FileSearch size={16} /> },
    { label: "Data Exploration", prompt: "Explore the dataset to uncover trends and anomalies.", icon: <Compass size={16} /> },
    { label: "Data Validation", prompt: "Ensure data quality, consistency, and accuracy.", icon: <CheckSquare size={16} /> },
    { label: "Data Visualization", prompt: "Create impactful charts and graphs for this data.", icon: <BarChart2 size={16} /> },
    { label: "Dashboard Builder", prompt: "Design a dynamic, interactive dashboard layout.", icon: <LayoutDashboard size={16} /> },
    { label: "SQL Queries", prompt: "Generate optimized SQL code for data retrieval.", icon: <Database size={16} /> },
    { label: "Statistical Analysis", prompt: "Perform complex statistical tests and modeling.", icon: <Sigma size={16} /> }
  ],
  'expert_search': [
    { label: "Knowledge Synthesis", prompt: "Combine information from these sources into a summary.", icon: <Merge size={16} /> },
    { label: "Search Strategy", prompt: "Optimize search queries to find hard-to-get info.", icon: <Target size={16} /> },
    { label: "Source Management", prompt: "Vet and manage the credibility of these sources.", icon: <Library size={16} /> }
  ],
  'expert_finance': [
    { label: "Audit Support", prompt: "Assist with documentation for the audit.", icon: <ClipboardCheck size={16} /> },
    { label: "Close Management", prompt: "Streamline the month-end closing process.", icon: <CalendarClock size={16} /> },
    { label: "Financial Statements", prompt: "Prepare balance sheets and income statements.", icon: <FileText size={16} /> },
    { label: "Journal Entry Prep", prompt: "Draft and validate financial journal entries.", icon: <PenTool size={16} /> },
    { label: "Reconciliation", prompt: "Reconcile the bank statements with the ledger.", icon: <Scale size={16} /> },
    { label: "Variance Analysis", prompt: "Analyze discrepancies between actuals and budgets.", icon: <TrendingUp size={16} /> }
  ],
  'expert_legal': [
    { label: "Canned Responses", prompt: "Create a standard legal response for this query.", icon: <MessageSquare size={16} /> },
    { label: "Compliance", prompt: "Monitor and ensure regulatory compliance.", icon: <ShieldCheck size={16} /> },
    { label: "Contract Review", prompt: "Review this contract for risks and clauses.", icon: <FileSignature size={16} /> },
    { label: "Risk Assessment", prompt: "Evaluate potential legal risks in this decision.", icon: <AlertTriangle size={16} /> },
    { label: "Meeting Briefing", prompt: "Prepare a legal brief for the meeting.", icon: <Briefcase size={16} /> },
    { label: "NDA Triage", prompt: "Review and process this Non-Disclosure Agreement.", icon: <FileLock size={16} /> }
  ],
  'expert_marketing': [
    { label: "Brand Voice", prompt: "Ensure this content aligns with our brand tone.", icon: <Megaphone size={16} /> },
    { label: "Campaign Planning", prompt: "Plan and organize the upcoming marketing campaign.", icon: <Calendar size={16} /> },
    { label: "Competitive Analysis", prompt: "Analyze competitor strategies and positioning.", icon: <Swords size={16} /> },
    { label: "Content Creation", prompt: "Generate engaging marketing copy and assets.", icon: <Pen size={16} /> },
    { label: "Performance Analytics", prompt: "Track and analyze campaign performance metrics.", icon: <LineChart size={16} /> }
  ],
  'expert_pm': [
    { label: "Competitive Analysis", prompt: "Analyze competitor features and market position.", icon: <Swords size={16} /> },
    { label: "Feature Spec", prompt: "Write detailed functional specifications for this feature.", icon: <FileCode size={16} /> },
    { label: "Metrics Tracking", prompt: "Define and track product KPIs.", icon: <Target size={16} /> },
    { label: "Roadmap Management", prompt: "Update the product development roadmap.", icon: <Map size={16} /> },
    { label: "Stakeholder Comms", prompt: "Draft an update for internal stakeholders.", icon: <Users size={16} /> },
    { label: "User Research", prompt: "Synthesize user feedback and interview insights.", icon: <FlaskConical size={16} /> }
  ],
  'expert_prod': [
    { label: "Memory Management", prompt: "Organize notes and maintain my knowledge base.", icon: <Brain size={16} /> },
    { label: "Task Management", prompt: "Prioritize and organize these daily tasks.", icon: <CheckSquare size={16} /> }
  ],
  'expert_sales': [
    { label: "Account Research", prompt: "Gather intelligence on this potential lead.", icon: <Search size={16} /> },
    { label: "Call Prep", prompt: "Prepare agenda and research for the sales call.", icon: <Phone size={16} /> },
    { label: "Competitive Intel", prompt: "Track competitor moves in the market.", icon: <Eye size={16} /> },
    { label: "Create Asset", prompt: "Generate a sales deck or one-pager.", icon: <FilePlus size={16} /> },
    { label: "Daily Briefing", prompt: "Summarize key sales updates for the day.", icon: <Sun size={16} /> },
    { label: "Draft Outreach", prompt: "Write a personalized outreach message.", icon: <Send size={16} /> }
  ],
  'expert_insolvency': [
     { label: "Debt Restructuring", prompt: "Propose a debt restructuring plan.", icon: <Scale size={16} /> },
     { label: "Liquidation Analysis", prompt: "Analyze the liquidation value of assets.", icon: <BarChart2 size={16} /> }
  ],
  'expert_valuer': [
     { label: "Asset Valuation", prompt: "Provide a valuation for this asset.", icon: <DollarSignIcon size={16} /> },
     { label: "Market Assessment", prompt: "Assess current market conditions for valuation.", icon: <TrendingUp size={16} /> }
  ]
};