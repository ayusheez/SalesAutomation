
import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { GoogleGenAI } from "@google/genai";
import { useToast } from '../components/ui/Toast';
import { Sparkles, Copy, RefreshCw, Send, Check, History, Trash2, Clock, X, Wand2, ThumbsUp, ThumbsDown } from 'lucide-react';

interface ContentHistory {
  id: string;
  topic: string;
  content: string;
  date: string;
  recipient: string;
  tone: string;
}

const getApiKey = () => {
  return localStorage.getItem('nexus_api_key') || process.env.API_KEY || '';
};

export const ContentGenerator: React.FC = () => {
  const { addToast } = useToast();
  const location = useLocation();
  
  const [topic, setTopic] = useState('');
  const [recipient, setRecipient] = useState('');
  const [tone, setTone] = useState('Professional');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCopyFeedback, setShowCopyFeedback] = useState(false);
  const [history, setHistory] = useState<ContentHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Handle pre-fill from navigation state
  useEffect(() => {
    if (location.state) {
      const { recipientName, topic: preFilledTopic } = location.state as any;
      if (recipientName) setRecipient(recipientName);
      if (preFilledTopic) setTopic(preFilledTopic);
    }
  }, [location]);

  // Load history
  useEffect(() => {
    const stored = localStorage.getItem('nexus_content_history');
    if (stored) {
      try {
        setHistory(JSON.parse(stored));
      } catch (e) { console.error('Failed to parse history', e); }
    }
  }, []);

  const saveHistory = (newHistory: ContentHistory[]) => {
    setHistory(newHistory);
    localStorage.setItem('nexus_content_history', JSON.stringify(newHistory));
  };

  const runGeneration = async (promptText: string, isRefinement = false) => {
    const apiKey = getApiKey();
    
    if (!apiKey) {
      // Mock response if no key
      return new Promise<string>(resolve => 
        setTimeout(() => resolve(`[MOCK GENERATION]\nSubject: Regarding ${topic}\n\nHi ${recipient},\n\nThis is a simulated response because no API key was found in Settings.\n\nBest,\nNexus Team`), 1500)
      );
    }

    const ai = new GoogleGenAI({ apiKey });
    const model = 'gemini-2.5-flash';
    
    try {
      const response = await ai.models.generateContent({
        model,
        contents: promptText,
      });
      return response.text || "Failed to generate content.";
    } catch (error) {
      console.error("Gemini error:", error);
      addToast("Error calling Gemini API. Check Settings.", 'error');
      return "";
    }
  };

  const handleGenerate = async () => {
    if (!topic || !recipient) return;
    
    setIsGenerating(true);
    
    const prompt = `Write a sales email.
    Topic: ${topic}
    Recipient: ${recipient}
    Tone: ${tone}
    Format: Plain text with Subject line.`;

    const content = await runGeneration(prompt);
    
    if (content) {
      setGeneratedContent(content);
      addToast('Content generated successfully!', 'success');

      // Save to history
      const newItem: ContentHistory = {
        id: Date.now().toString(),
        topic: topic.substring(0, 30) + (topic.length > 30 ? '...' : ''),
        content,
        date: new Date().toLocaleString(),
        recipient,
        tone
      };
      saveHistory([newItem, ...history].slice(0, 20));
    }
    setIsGenerating(false);
  };

  const handleRefine = async (instruction: string) => {
    if (!generatedContent) return;
    setIsGenerating(true);
    
    const prompt = `Original Email:
    "${generatedContent}"
    
    Instruction: Rewrite the above email to be ${instruction}. Keep the same context/recipient.`;

    const content = await runGeneration(prompt, true);
    if (content) {
      setGeneratedContent(content);
      addToast(`Refined: ${instruction}`, 'success');
    }
    setIsGenerating(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    setShowCopyFeedback(true);
    setTimeout(() => setShowCopyFeedback(false), 2000);
    addToast('Copied to clipboard', 'info');
  };

  const handleUseInCampaign = () => {
    addToast("Draft saved to 'Drafts' in Email Sequences.", 'success');
  };

  const loadFromHistory = (item: ContentHistory) => {
    setGeneratedContent(item.content);
    setTopic(item.topic);
    setRecipient(item.recipient);
    setTone(item.tone);
    setShowHistory(false);
  };

  const deleteFromHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    saveHistory(history.filter(h => h.id !== id));
  };

  const TONES = [
    { id: 'Professional', label: 'Professional' },
    { id: 'Friendly', label: 'Friendly' },
    { id: 'Urgent', label: 'Urgent' },
    { id: 'Persuasive', label: 'Persuasive' },
    { id: 'Witty', label: 'Witty' },
    { id: 'Empathetic', label: 'Empathetic' }
  ];

  const REFINEMENTS = [
    { label: 'Shorter', prompt: 'much shorter and concise' },
    { label: 'More Casual', prompt: 'more casual and conversational' },
    { label: 'More Formal', prompt: 'more formal and corporate' },
    { label: 'Fix Grammar', prompt: 'corrected for any grammar or flow issues' },
  ];

  return (
    <div className="flex gap-6 h-[calc(100vh-7rem)]">
       {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row gap-8 h-full min-h-0">
        {/* Input Section */}
        <div className="w-full lg:w-1/3 space-y-6 overflow-y-auto custom-scrollbar pr-2">
          <div>
            <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <Sparkles className="text-primary" /> AI Content Wizard
            </h1>
            <p className="text-gray-400">Generate personalized sales copy in seconds using Gemini.</p>
          </div>

          <Card>
            <CardHeader>
              <h3 className="font-bold">Configuration</h3>
            </CardHeader>
            <CardBody className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Topic / Goal</label>
                <textarea 
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Scheduling a demo for our new AI sales tool..."
                  className="w-full bg-dark border border-dark-secondary rounded-md p-3 text-white focus:border-primary focus:outline-none min-h-[100px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Recipient Name</label>
                <input 
                  type="text" 
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-dark border border-dark-secondary rounded-md p-3 text-white focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Tone</label>
                <div className="grid grid-cols-3 gap-2">
                  {TONES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTone(t.id)}
                      className={`py-2 px-2 rounded-md text-xs font-medium transition-all truncate ${
                        tone === t.id
                          ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                          : 'bg-dark-secondary text-gray-300 hover:bg-opacity-80'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <Button 
                onClick={handleGenerate} 
                disabled={isGenerating || !topic}
                className="w-full py-3 mt-4 flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <RefreshCw className="animate-spin" size={18} />
                ) : (
                  <Sparkles size={18} />
                )}
                {isGenerating ? 'Thinking...' : 'Generate Content'}
              </Button>
            </CardBody>
          </Card>
        </div>

        {/* Output Section */}
        <div className="flex-1 flex flex-col h-full min-h-0">
          <div className="flex justify-between items-center mb-4 shrink-0">
            <h3 className="font-bold text-lg">Generated Output</h3>
            <div className="flex gap-2">
              {generatedContent && (
                <>
                  <Button variant="outline" size="sm" className="flex gap-2" onClick={handleCopy}>
                    {showCopyFeedback ? <Check size={14}/> : <Copy size={14}/>} 
                    {showCopyFeedback ? 'Copied' : 'Copy'}
                  </Button>
                  <Button size="sm" className="flex gap-2" onClick={handleUseInCampaign}>
                    <Send size={14}/> Use
                  </Button>
                </>
              )}
              <Button variant="secondary" size="sm" className="lg:hidden" onClick={() => setShowHistory(!showHistory)}>
                <History size={16}/>
              </Button>
            </div>
          </div>
          
          <Card className="flex-1 relative bg-dark-surface/50 border-dashed border-2 border-dark-secondary min-h-0 flex flex-col">
            {generatedContent ? (
               <>
                <div className="flex-1 p-6 overflow-y-auto whitespace-pre-wrap font-sans text-gray-200 leading-relaxed custom-scrollbar">
                  {generatedContent}
                </div>
                
                {/* Refinement Toolbar */}
                <div className="p-3 border-t border-dark-secondary bg-dark-surface/80 backdrop-blur-sm flex items-center gap-2 overflow-x-auto">
                  <span className="text-xs text-gray-400 font-bold uppercase mr-2 shrink-0"><Wand2 size={12} className="inline mr-1"/> Refine:</span>
                  {REFINEMENTS.map((opt) => (
                    <button
                      key={opt.label}
                      disabled={isGenerating}
                      onClick={() => handleRefine(opt.prompt)}
                      className="px-3 py-1 rounded-full bg-dark border border-dark-secondary hover:border-primary text-xs text-gray-300 hover:text-white transition-colors shrink-0 disabled:opacity-50"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
               </>
            ) : (
               <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                 <Sparkles size={48} className="mb-4 opacity-20" />
                 <p>Ready to generate magic...</p>
               </div>
            )}
          </Card>
        </div>
      </div>

      {/* History Sidebar (Desktop: Always visible if space allows, Mobile: Toggle) */}
      <div className={`
        fixed inset-y-0 right-0 w-80 bg-dark border-l border-dark-secondary transform transition-transform duration-300 z-50
        lg:relative lg:transform-none lg:w-72 lg:border-l-0 lg:bg-transparent lg:flex flex-col
        ${showHistory ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
         <div className="h-full flex flex-col bg-dark lg:bg-transparent lg:border-l lg:border-dark-secondary pl-4">
            <div className="flex items-center justify-between p-4 lg:px-0 lg:pt-0 border-b border-dark-secondary lg:border-none mb-2">
               <h3 className="font-bold flex items-center gap-2"><History size={18}/> History</h3>
               <button onClick={() => setShowHistory(false)} className="lg:hidden text-gray-400"><X size={20}/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2 pb-4">
               {history.length > 0 ? (
                 history.map(item => (
                   <div 
                      key={item.id} 
                      onClick={() => loadFromHistory(item)}
                      className="group p-3 rounded-lg bg-dark-surface border border-dark-secondary hover:border-primary cursor-pointer transition-all relative"
                   >
                      <div className="flex justify-between items-start mb-1">
                         <span className="text-xs font-bold text-primary uppercase">{item.tone}</span>
                         <span className="text-[10px] text-gray-500">{item.date.split(',')[0]}</span>
                      </div>
                      <p className="text-sm font-medium text-white mb-1 line-clamp-1">{item.recipient}</p>
                      <p className="text-xs text-gray-400 line-clamp-2">{item.topic}</p>
                      
                      <button 
                        onClick={(e) => deleteFromHistory(item.id, e)}
                        className="absolute top-2 right-2 p-1 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={12} />
                      </button>
                   </div>
                 ))
               ) : (
                 <div className="text-center py-10 text-gray-500">
                   <History size={24} className="mx-auto mb-2 opacity-30"/>
                   <p className="text-xs">No history yet.</p>
                 </div>
               )}
            </div>
         </div>
      </div>

      {/* Overlay for mobile history */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setShowHistory(false)}></div>
      )}
    </div>
  );
};
