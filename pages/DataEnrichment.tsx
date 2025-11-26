
import React, { useState } from 'react';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';
import { Switch } from '../components/ui/Switch';
import { 
  Upload, FileSpreadsheet, CheckCircle, Database, 
  Download, RefreshCw, Settings, AlertCircle, FileText,
  CreditCard, Users, Smartphone, Mail, Globe, Filter, ArrowRight,
  Zap, ShieldCheck, Building2, X, Loader2, BarChart3, PieChart,
  HelpCircle, Check
} from 'lucide-react';

// Mock Data for History
const RECENT_JOBS = [
  { id: '1', name: 'Q3_Prospect_List_Marketing.csv', date: '2 hours ago', records: 500, status: 'Completed', matchRate: 84, cost: 420 },
  { id: '2', name: 'Conference_Attendees_2023.xlsx', date: '1 day ago', records: 1250, status: 'Completed', matchRate: 92, cost: 1150 },
  { id: '3', name: 'Inbound_Leads_Sept.csv', date: '3 days ago', records: 150, status: 'Failed', matchRate: 0, cost: 0 },
  { id: '4', name: 'Tech_Startups_SF.csv', date: '1 week ago', records: 2400, status: 'Completed', matchRate: 78, cost: 1800 },
];

export const DataEnrichment: React.FC = () => {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'csv' | 'crm'>('overview');
  
  // CSV Wizard State
  const [step, setStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Review State
  const [potentialMatches, setPotentialMatches] = useState<any[]>([]);
  const [reviewedCount, setReviewedCount] = useState(0);

  // Configuration State
  const [config, setConfig] = useState({
    email_verified: true,
    email_guess: false,
    mobile_phone: true,
    direct_phone: true,
    company_info: true,
    tech_stack: false
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setStep(2); // Move to config
    }
  };

  const startEnrichment = () => {
    setStep(3);
    setIsProcessing(true);
    setProgress(0);
    setReviewedCount(0);

    // Simulate Progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          
          // Generate mock potential matches for review
          setPotentialMatches([
             { id: 1, input: { name: 'J. Smith', company: 'TechFlow' }, match: { name: 'John Smith', title: 'CTO', company: 'TechFlow', email: 'john@techflow.io', confidence: 82 }, status: 'pending' },
             { id: 2, input: { name: 'Sarah Connor', domain: 'skynet.com' }, match: { name: 'Sarah Connor', title: 'Head of Security', company: 'Cyberdyne Systems', email: 's.connor@cyberdyne.net', confidence: 65 }, status: 'pending' },
             { id: 3, input: { name: 'Mike Ross', company: 'Pearson Hardman' }, match: { name: 'Michael Ross', title: 'Junior Associate', company: 'Pearson Specter Litt', email: 'm.ross@psl.com', confidence: 78 }, status: 'pending' },
             { id: 4, input: { name: 'D. Schrute', company: 'Dunder Mifflin' }, match: { name: 'Dwight Schrute', title: 'Assistant to the Regional Manager', company: 'Dunder Mifflin', email: 'dwight@dundermifflin.com', confidence: 88 }, status: 'pending' }
          ]);
          
          setStep(4); // Move to Review Step
          addToast('Processing complete. Please review potential matches.', 'info');
          return 100;
        }
        return prev + 5; // Increment by 5%
      });
    }, 100);
  };

  const handleMatchAction = (id: number, action: 'accept' | 'reject') => {
    setPotentialMatches(prev => prev.map(m => m.id === id ? { ...m, status: action } : m));
    setReviewedCount(prev => prev + 1);
  };

  const finalizeEnrichment = () => {
    setStep(5);
    addToast('Enrichment finalized successfully!', 'success');
  };

  const resetWizard = () => {
    setStep(1);
    setSelectedFile(null);
    setProgress(0);
    setIsProcessing(false);
    setPotentialMatches([]);
    setReviewedCount(0);
  };

  const renderStatsCard = (label: string, value: string, subtext: string, icon: React.ElementType, color: string, percent: number) => (
    <Card className="relative overflow-hidden group hover:border-white/20 transition-colors">
      <div className={`absolute top-0 left-0 w-1 h-full`} style={{ backgroundColor: color }}></div>
      <CardBody className="p-5">
        <div className="flex justify-between items-start mb-4">
           <div className={`p-2.5 rounded-lg bg-opacity-20`} style={{ backgroundColor: `${color}20` }}>
              <React.Fragment>{React.createElement(icon, { size: 20, style: { color } })}</React.Fragment>
           </div>
           <span className="text-xs font-bold bg-white/5 px-2 py-1 rounded text-gray-300">Last 30 Days</span>
        </div>
        <div>
           <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
           <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-3">{label}</p>
           
           <div className="w-full bg-dark-surface rounded-full h-1.5 mb-2">
              <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${percent}%`, backgroundColor: color }}></div>
           </div>
           <p className="text-[10px] text-gray-500">{subtext}</p>
        </div>
      </CardBody>
    </Card>
  );

  return (
    <div className="space-y-6 h-[calc(100vh-7rem)] flex flex-col min-h-0">
      {/* Header & Stats */}
      <div className="shrink-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <Database className="text-primary" /> Data Enrichment
            </h1>
            <p className="text-gray-400 mt-1">Enrich your records with verified emails, phone numbers, and company insights.</p>
          </div>
          <div className="flex bg-dark-secondary/50 p-1 rounded-lg border border-dark-secondary">
             {['overview', 'csv', 'crm'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${
                    activeTab === tab 
                      ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab === 'csv' ? 'Enrich CSV' : tab === 'crm' ? 'Integrations' : 'Dashboard'}
                </button>
             ))}
          </div>
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
            {renderStatsCard('Credits Used', '8,540', '85% of 10k monthly limit', CreditCard, '#8c52ff', 85)}
            {renderStatsCard('Emails Found', '24.5k', '92% validity rate', Mail, '#10b981', 92)}
            {renderStatsCard('Mobile Numbers', '12.2k', '65% match rate', Smartphone, '#3b82f6', 65)}
            {renderStatsCard('Data Quality', 'A+', 'Overall list health', ShieldCheck, '#f59e0b', 95)}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pb-6">
        
        {/* === OVERVIEW TAB === */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <Card className="border-dark-secondary shadow-xl">
               <CardHeader className="flex justify-between items-center border-b border-dark-secondary bg-dark-surface/50">
                  <div className="flex items-center gap-2">
                    <FileText className="text-gray-400" size={18} />
                    <h3 className="font-bold text-lg">Enrichment History</h3>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-8"><Filter size={14} className="mr-2"/> Filter</Button>
                    <Button size="sm" onClick={() => setActiveTab('csv')} className="h-8"><Zap size={14} className="mr-2"/> New Job</Button>
                  </div>
               </CardHeader>
               <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                     <thead className="bg-dark-surface/80 text-gray-400 text-xs uppercase font-bold">
                        <tr>
                          <th className="px-6 py-4">File Name</th>
                          <th className="px-6 py-4">Date</th>
                          <th className="px-6 py-4">Records</th>
                          <th className="px-6 py-4">Match Rate</th>
                          <th className="px-6 py-4">Cost</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-dark-secondary">
                        {RECENT_JOBS.map((job) => (
                           <tr key={job.id} className="hover:bg-dark-surface/30 group transition-colors">
                              <td className="px-6 py-4">
                                 <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded bg-dark-surface border border-dark-secondary flex items-center justify-center text-green-500">
                                      <FileSpreadsheet size={16} />
                                    </div>
                                    <span className="font-medium text-white text-sm">{job.name}</span>
                                 </div>
                              </td>
                              <td className="px-6 py-4 text-gray-400 text-sm">{job.date}</td>
                              <td className="px-6 py-4 text-white text-sm font-mono">{job.records.toLocaleString()}</td>
                              <td className="px-6 py-4">
                                 <div className="flex items-center gap-2">
                                    <div className="w-20 h-1.5 bg-dark-secondary rounded-full overflow-hidden">
                                       <div className={`h-full rounded-full ${job.matchRate > 80 ? 'bg-green-500' : job.matchRate > 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${job.matchRate}%` }}></div>
                                    </div>
                                    <span className="text-xs font-bold text-gray-300">{job.matchRate}%</span>
                                 </div>
                              </td>
                              <td className="px-6 py-4 text-gray-300 text-sm">
                                <span className="flex items-center gap-1"><CreditCard size={12} className="text-primary"/> {job.cost}</span>
                              </td>
                              <td className="px-6 py-4">
                                 {job.status === 'Completed' ? (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-green-500/10 text-green-400 text-xs font-bold border border-green-500/20">
                                       <CheckCircle size={12} /> Completed
                                    </span>
                                 ) : (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-400 text-xs font-bold border border-red-500/20">
                                       <AlertCircle size={12} /> Failed
                                    </span>
                                 )}
                              </td>
                              <td className="px-6 py-4 text-right">
                                 <Button variant="link" className="text-gray-500 hover:text-primary p-0 h-auto group-hover:opacity-100 opacity-0 transition-opacity"><Download size={16}/></Button>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </Card>
          </div>
        )}

        {/* === CSV ENRICHMENT TAB === */}
        {activeTab === 'csv' && (
           <div className="max-w-5xl mx-auto animate-in slide-in-from-right-4 duration-300">
              {/* Stepper */}
              <div className="mb-8">
                 <div className="flex items-center justify-between relative">
                    <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-dark-secondary -z-10"></div>
                    {[
                       { num: 1, label: 'Upload' },
                       { num: 2, label: 'Configure' },
                       { num: 3, label: 'Process' },
                       { num: 4, label: 'Review' },
                       { num: 5, label: 'Results' }
                    ].map((s) => (
                       <div key={s.num} className={`flex flex-col items-center bg-dark px-2 md:px-4 ${step >= s.num ? 'text-white' : 'text-gray-500'}`}>
                          <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 mb-2 transition-colors ${
                             step >= s.num 
                              ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30' 
                              : 'bg-dark-surface border-dark-secondary'
                          }`}>
                             {step > s.num ? <CheckCircle size={18}/> : s.num}
                          </div>
                          <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider hidden sm:block">{s.label}</span>
                       </div>
                    ))}
                 </div>
              </div>

              <Card className="min-h-[450px] flex flex-col border-dark-secondary shadow-2xl">
                 {/* STEP 1: UPLOAD */}
                 {step === 1 && (
                    <div className="flex-1 flex flex-col items-center justify-center p-16 m-2 border-2 border-dashed border-dark-secondary rounded-lg bg-dark-surface/20 hover:bg-dark-surface/40 hover:border-primary/50 transition-all">
                       <div className="w-24 h-24 bg-dark-surface rounded-full flex items-center justify-center mb-6 shadow-xl border border-dark-secondary group">
                          <Upload size={40} className="text-primary group-hover:scale-110 transition-transform" />
                       </div>
                       <h3 className="text-2xl font-bold text-white mb-2">Upload your prospect list</h3>
                       <p className="text-gray-400 text-center max-w-md mb-8 leading-relaxed">
                          Drag and drop your CSV or Excel file here. We'll automatically map your columns and detect enrichable fields.
                       </p>
                       <div className="relative">
                          <Button size="lg" className="pointer-events-none shadow-lg shadow-primary/20">Browse Files</Button>
                          <input 
                             type="file" 
                             accept=".csv,.xlsx" 
                             onChange={handleFileChange}
                             className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                       </div>
                       <div className="mt-8 flex gap-6 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><CheckCircle size={12}/> CSV, XLS, XLSX</span>
                          <span className="flex items-center gap-1"><CheckCircle size={12}/> Max 50MB</span>
                          <span className="flex items-center gap-1"><CheckCircle size={12}/> Secure Processing</span>
                       </div>
                    </div>
                 )}

                 {/* STEP 2: CONFIGURE */}
                 {step === 2 && selectedFile && (
                    <div className="p-8 flex flex-col h-full">
                       <div className="flex items-center justify-between mb-8 pb-6 border-b border-dark-secondary">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded bg-green-500/20 flex items-center justify-center text-green-500">
                                <FileSpreadsheet size={24} />
                             </div>
                             <div>
                                <h3 className="font-bold text-white text-lg">{selectedFile.name}</h3>
                                <p className="text-xs text-gray-400">{(selectedFile.size / 1024).toFixed(2)} KB • 1,240 Detectable Rows</p>
                             </div>
                          </div>
                          <Button variant="outline" size="sm" onClick={resetWizard}><X size={14} className="mr-2"/>Change File</Button>
                       </div>

                       <div className="flex-1">
                          <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                             <Settings size={16} className="text-primary"/> Enrichment Configuration
                          </h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             {[
                                { id: 'email_verified', label: 'Verified Emails', icon: Mail, color: 'text-blue-400', bg: 'bg-blue-500/20', cost: '1 credit', desc: 'Find confirmed work emails.' },
                                { id: 'mobile_phone', label: 'Mobile Numbers', icon: Smartphone, color: 'text-green-400', bg: 'bg-green-500/20', cost: '2 credits', desc: 'Direct dial mobile numbers.' },
                                { id: 'company_info', label: 'Company Insights', icon: Building2, color: 'text-purple-400', bg: 'bg-purple-500/20', cost: 'Free', desc: 'Revenue, Size, Industry, Location.' },
                                { id: 'tech_stack', label: 'Technographics', icon: Zap, color: 'text-orange-400', bg: 'bg-orange-500/20', cost: '0.5 credits', desc: 'Software & tools used.' }
                             ].map((item) => (
                                <div key={item.id} className={`p-4 rounded-xl border transition-all ${config[item.id as keyof typeof config] ? 'bg-dark-surface border-primary/50 shadow-md' : 'bg-dark-surface/30 border-dark-secondary'}`}>
                                   <div className="flex justify-between items-start">
                                      <div className="flex gap-3">
                                         <div className={`p-2 rounded-lg ${item.bg} ${item.color}`}>
                                            <item.icon size={20}/>
                                         </div>
                                         <div>
                                            <p className="font-bold text-sm text-white">{item.label}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                                         </div>
                                      </div>
                                      <Switch checked={config[item.id as keyof typeof config]} onChange={(c) => setConfig({...config, [item.id]: c})} />
                                   </div>
                                   <div className="mt-3 pt-3 border-t border-white/5 flex justify-between items-center">
                                      <span className="text-[10px] text-gray-400 uppercase font-bold">Cost per match</span>
                                      <span className="text-xs font-bold text-white bg-white/10 px-2 py-0.5 rounded">{item.cost}</span>
                                   </div>
                                </div>
                             ))}
                          </div>
                       </div>

                       <div className="flex justify-between items-center pt-6 border-t border-dark-secondary mt-8">
                          <div className="text-sm">
                             <span className="text-gray-400">Est. Total Cost: </span>
                             <span className="text-white font-bold">~850 Credits</span>
                          </div>
                          <div className="flex gap-3">
                             <Button variant="outline" onClick={resetWizard}>Cancel</Button>
                             <Button onClick={startEnrichment} className="gap-2 pl-6 pr-6">Start Enrichment <ArrowRight size={16}/></Button>
                          </div>
                       </div>
                    </div>
                 )}

                 {/* STEP 3: PROCESSING */}
                 {step === 3 && (
                    <div className="flex-1 flex flex-col items-center justify-center p-12">
                       <div className="relative w-48 h-48 mx-auto mb-8">
                           {/* Background Circle */}
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                             <circle cx="50" cy="50" r="45" fill="none" stroke="#1e0b4b" strokeWidth="6" />
                             <circle 
                                cx="50" cy="50" r="45" fill="none" stroke="#8c52ff" strokeWidth="6" 
                                strokeDasharray="283" 
                                strokeDashoffset={283 - (283 * progress) / 100}
                                strokeLinecap="round"
                                className="transition-all duration-200 ease-out"
                             />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                             <span className="text-4xl font-bold text-white">{progress}%</span>
                             <span className="text-xs text-gray-400 uppercase tracking-widest mt-1">Processed</span>
                          </div>
                       </div>
                       
                       <div className="text-center max-w-md">
                          <h3 className="text-xl font-bold text-white mb-2">Enriching Data...</h3>
                          <p className="text-gray-400 mb-6">Matching records against our database of 250M+ contacts. This may take a moment.</p>
                          
                          <div className="bg-dark-surface border border-dark-secondary rounded-lg p-4 space-y-3 text-left">
                             <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-300 flex items-center gap-2">
                                   {progress > 20 ? <CheckCircle size={14} className="text-green-500"/> : <Loader2 size={14} className="animate-spin text-primary"/>}
                                   Validating emails
                                </span>
                                <span className="text-gray-500 text-xs">100%</span>
                             </div>
                             <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-300 flex items-center gap-2">
                                   {progress > 50 ? <CheckCircle size={14} className="text-green-500"/> : <Loader2 size={14} className="animate-spin text-primary"/>}
                                   Locating mobile numbers
                                </span>
                                <span className="text-gray-500 text-xs">{progress > 50 ? '100%' : '45%'}</span>
                             </div>
                             <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-300 flex items-center gap-2">
                                   {progress > 80 ? <CheckCircle size={14} className="text-green-500"/> : <Loader2 size={14} className="animate-spin text-primary"/>}
                                   Appending firmographics
                                </span>
                                <span className="text-gray-500 text-xs">{progress > 80 ? '100%' : '12%'}</span>
                             </div>
                          </div>
                       </div>
                    </div>
                 )}

                 {/* STEP 4: REVIEW */}
                 {step === 4 && (
                    <div className="flex-1 flex flex-col p-8">
                       <div className="flex justify-between items-center mb-6">
                          <div>
                             <h3 className="text-xl font-bold text-white">Review Potential Matches</h3>
                             <p className="text-sm text-gray-400">We found partial matches that need your confirmation.</p>
                          </div>
                          <div className="text-sm text-gray-400">
                             Reviewed <strong className="text-white">{reviewedCount}</strong> of <strong className="text-white">{potentialMatches.length}</strong>
                          </div>
                       </div>

                       <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 mb-6">
                          {potentialMatches.map((item) => (
                             <div key={item.id} className={`p-4 rounded-xl border transition-colors ${item.status === 'accept' ? 'bg-green-500/5 border-green-500/30' : item.status === 'reject' ? 'bg-red-500/5 border-red-500/30' : 'bg-dark-surface border-dark-secondary'}`}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                                   {/* Input Data */}
                                   <div className="space-y-1">
                                      <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Your Input</p>
                                      <p className="font-bold text-white">{item.input.name}</p>
                                      <p className="text-xs text-gray-400">{item.input.company || item.input.domain}</p>
                                   </div>

                                   {/* Matched Data */}
                                   <div className="relative">
                                      <div className="absolute -left-3 top-0 bottom-0 w-px bg-dark-secondary hidden md:block"></div>
                                      <p className="text-[10px] text-primary uppercase font-bold mb-1 flex justify-between">
                                         Suggested Match
                                         <span className={`${item.match.confidence > 80 ? 'text-green-400' : 'text-yellow-400'}`}>{item.match.confidence}% Confidence</span>
                                      </p>
                                      <div className="flex justify-between items-start">
                                         <div>
                                            <p className="font-bold text-white">{item.match.name}</p>
                                            <p className="text-xs text-gray-300">{item.match.title} at {item.match.company}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{item.match.email}</p>
                                         </div>
                                         
                                         {item.status === 'pending' ? (
                                            <div className="flex gap-2">
                                               <button onClick={() => handleMatchAction(item.id, 'reject')} className="p-2 rounded hover:bg-red-500/20 text-gray-500 hover:text-red-500 transition-colors" title="Reject"><X size={18}/></button>
                                               <button onClick={() => handleMatchAction(item.id, 'accept')} className="p-2 rounded hover:bg-green-500/20 text-gray-500 hover:text-green-500 transition-colors" title="Accept"><Check size={18}/></button>
                                            </div>
                                         ) : (
                                            <div className={`px-3 py-1 rounded text-xs font-bold uppercase ${item.status === 'accept' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                                               {item.status === 'accept' ? 'Accepted' : 'Rejected'}
                                            </div>
                                         )}
                                      </div>
                                   </div>
                                </div>
                             </div>
                          ))}
                       </div>

                       <div className="flex justify-end pt-4 border-t border-dark-secondary">
                          <Button onClick={finalizeEnrichment} disabled={reviewedCount < potentialMatches.length} className="gap-2">
                             Finalize Results <ArrowRight size={16}/>
                          </Button>
                       </div>
                    </div>
                 )}

                 {/* STEP 5: RESULTS */}
                 {step === 5 && (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center animate-in zoom-in-95 duration-500">
                       <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-green-500/30">
                          <CheckCircle size={48} className="text-white" />
                       </div>
                       <h3 className="text-3xl font-bold text-white mb-2">Enrichment Complete!</h3>
                       <p className="text-gray-400 mb-10 text-lg">Your list has been supercharged with new data.</p>
                       
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl mb-10">
                          <div className="p-6 bg-dark-surface border border-dark-secondary rounded-xl">
                             <p className="text-xs font-bold text-gray-400 uppercase mb-2">Match Rate</p>
                             <p className="text-4xl font-bold text-green-400">94%</p>
                             <p className="text-xs text-green-500/80 mt-2">+12% vs avg</p>
                          </div>
                          <div className="p-6 bg-dark-surface border border-dark-secondary rounded-xl">
                             <p className="text-xs font-bold text-gray-400 uppercase mb-2">Emails Found</p>
                             <p className="text-4xl font-bold text-blue-400">412</p>
                             <p className="text-xs text-gray-500 mt-2">Verified Valid</p>
                          </div>
                          <div className="p-6 bg-dark-surface border border-dark-secondary rounded-xl">
                             <p className="text-xs font-bold text-gray-400 uppercase mb-2">Credits Used</p>
                             <p className="text-4xl font-bold text-purple-400">620</p>
                             <p className="text-xs text-gray-500 mt-2">Updated Balance: 7,920</p>
                          </div>
                       </div>

                       <div className="flex gap-4">
                          <Button variant="outline" onClick={resetWizard} className="h-12 px-6">Enrich Another File</Button>
                          <Button className="h-12 px-8 gap-2 shadow-lg shadow-primary/25"><Download size={18}/> Download Enriched CSV</Button>
                       </div>
                    </div>
                 )}
              </Card>
           </div>
        )}

        {/* === CRM TAB === */}
        {activeTab === 'crm' && (
           <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
              <div className="text-center py-8">
                 <h2 className="text-3xl font-bold text-white mb-3">Connect your CRM</h2>
                 <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                    Automatically enrich inbound leads and keep your database clean without lifting a finger.
                 </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Salesforce Card */}
                 <Card className="p-8 flex flex-col items-center text-center border-2 border-transparent hover:border-[#00a1e0] transition-all hover:shadow-[0_0_30px_rgba(0,161,224,0.2)] group">
                    <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                       <Database size={40} className="text-[#00a1e0]"/> 
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">Salesforce</h3>
                    <p className="text-gray-400 mb-8 leading-relaxed">
                       Bi-directional sync. Enrich leads as they enter Salesforce and keep contacts up to date automatically.
                    </p>
                    <Button variant="outline" className="w-full border-[#00a1e0] text-[#00a1e0] hover:bg-[#00a1e0] hover:text-white">Connect Salesforce</Button>
                    <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                       <CheckCircle size={12} className="text-green-500"/> Auto-Enrich Enabled
                    </div>
                 </Card>

                 {/* HubSpot Card */}
                 <Card className="p-8 flex flex-col items-center text-center border-2 border-transparent hover:border-[#ff7a59] transition-all hover:shadow-[0_0_30px_rgba(255,122,89,0.2)] group">
                    <div className="w-20 h-20 bg-[#ff7a59] rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                       <Globe size={40} className="text-white"/>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">HubSpot</h3>
                    <p className="text-gray-400 mb-8 leading-relaxed">
                       Seamless integration for companies and contacts. Trigger workflows based on enriched data points.
                    </p>
                    <Button variant="outline" className="w-full border-[#ff7a59] text-[#ff7a59] hover:bg-[#ff7a59] hover:text-white">Connect HubSpot</Button>
                    <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                       <div className="w-2 h-2 rounded-full bg-gray-500"></div> Not Connected
                    </div>
                 </Card>
              </div>
              
              <Card className="p-6 bg-gradient-to-r from-dark-surface to-dark-surface/50 border-dashed border-2 border-dark-secondary mt-8">
                 <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="p-4 bg-dark rounded-xl border border-dark-secondary shadow-inner">
                       <Filter size={32} className="text-gray-400"/>
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                       <h4 className="font-bold text-white text-lg mb-1">Smart Enrichment Rules</h4>
                       <p className="text-sm text-gray-400">Configure detailed rules to only enrich leads that match your ICP (e.g. "Title contains VP" AND "Location is US").</p>
                    </div>
                    <Button disabled className="opacity-50">Coming Soon</Button>
                 </div>
              </Card>
           </div>
        )}

      </div>
    </div>
  );
};
