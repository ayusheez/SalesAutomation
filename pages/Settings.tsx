
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { Switch } from '../components/ui/Switch';
import { useToast } from '../components/ui/Toast';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';
import { GoogleGenAI } from "@google/genai";
import { 
  Key, User, Bell, Shield, CreditCard, Zap, Check, Slack, Database, 
  Globe, Download, Camera, AlertTriangle, Lock, Mail, Smartphone, 
  Monitor, ExternalLink, Activity
} from 'lucide-react';

export const Settings: React.FC = () => {
  const { addToast } = useToast();
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Profile State
  const [profile, setProfile] = useState({ 
    name: '', 
    email: '', 
    role: '', 
    avatarUrl: '', 
    phone: '', 
    location: '', 
    timezone: 'UTC-8 (Pacific Time)', 
    language: 'English (US)' 
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  // Init profile from user context
  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        phone: user.phone || '',
        location: user.location || '',
        timezone: user.timezone || 'UTC-8 (Pacific Time)',
        language: user.language || 'English (US)'
      });
    }
  }, [user]);

  // API Key State
  const [apiKey, setApiKey] = useState('');
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [keyStatus, setKeyStatus] = useState<'valid' | 'invalid' | 'unchecked'>('unchecked');
  
  // Notification State
  const [notifications, setNotifications] = useState({
    email_newLead: true,
    email_mentions: true,
    email_marketing: false,
    push_newLead: true,
    push_messages: true,
    push_reminders: true,
  });

  // Integrations State
  const [integrations, setIntegrations] = useState([
    { id: 'salesforce', name: 'Salesforce', icon: Database, connected: true, category: 'CRM', desc: 'Bi-directional sync for leads, contacts, and opportunities.' },
    { id: 'slack', name: 'Slack', icon: Slack, connected: true, category: 'Communication', desc: 'Receive instant alerts for closed deals and new assignments.' },
    { id: 'hubspot', name: 'HubSpot', icon: Globe, connected: false, category: 'CRM', desc: 'Import contacts and company data directly from HubSpot.' },
    { id: 'gmail', name: 'Gmail', icon: Mail, connected: true, category: 'Email', desc: 'Send emails and sync calendar events automatically.' },
    { id: 'zoom', name: 'Zoom', icon: Monitor, connected: false, category: 'Productivity', desc: 'Auto-generate meeting links for scheduled calls.' },
  ]);

  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false);

  useEffect(() => {
    const storedKey = localStorage.getItem('nexus_api_key');
    if (storedKey) {
      setApiKey(storedKey);
      setKeyStatus('unchecked'); // Reset status on load until verified
    }
  }, []);

  const handleSaveKey = () => {
    localStorage.setItem('nexus_api_key', apiKey);
    setKeyStatus('unchecked');
    addToast('API Key saved locally', 'success');
  };

  const handleTestKey = async () => {
    if (!apiKey) return addToast('Please enter an API Key first', 'error');
    setIsTestingKey(true);
    try {
      const ai = new GoogleGenAI({ apiKey });
      // Simple ping to check validity
      await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: 'Test' });
      setKeyStatus('valid');
      addToast('API Key Verified Successfully!', 'success');
    } catch (e) {
      console.error(e);
      setKeyStatus('invalid');
      addToast('Invalid API Key or Quota Exceeded', 'error');
    }
    setIsTestingKey(false);
  };

  const handleSaveProfile = () => {
    updateUser({
      name: profile.name,
      role: profile.role as any,
      phone: profile.phone,
      location: profile.location,
      timezone: profile.timezone,
      language: profile.language,
      avatarUrl: profile.avatarUrl
    });
    setIsEditingProfile(false);
    addToast('Profile updated successfully', 'success');
  };

  const handleAvatarClick = () => {
    if (isEditingProfile && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const fakeUrl = URL.createObjectURL(e.target.files[0]);
      setProfile({ ...profile, avatarUrl: fakeUrl });
      addToast('Avatar updated! Don\'t forget to save changes.', 'info');
    }
  };

  const toggleIntegration = (id: string) => {
    setIntegrations(prev => prev.map(app => {
      if (app.id === id) {
        const newStatus = !app.connected;
        addToast(newStatus ? `Connected to ${app.name}` : `Disconnected ${app.name}`, newStatus ? 'success' : 'info');
        return { ...app, connected: newStatus };
      }
      return app;
    }));
  };

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    addToast('Preference updated', 'info');
  };

  const handleDeleteAccount = () => {
    setIsDeleteAccountModalOpen(false);
    addToast('Request submitted. Support will contact you.', 'info');
  };

  const TABS = [
    { id: 'profile', label: 'Profile', icon: User, desc: 'Manage your personal info' },
    { id: 'security', label: 'Security', icon: Shield, desc: 'Password & 2FA' },
    { id: 'integrations', label: 'Integrations', icon: Zap, desc: 'Connected apps' },
    { id: 'notifications', label: 'Notifications', icon: Bell, desc: 'Email & Push preferences' },
    { id: 'billing', label: 'Billing', icon: CreditCard, desc: 'Plan & Invoices' },
    { id: 'api', label: 'API Config', icon: Key, desc: 'LLM Connection' },
  ];

  const renderTabButton = (tab: typeof TABS[0]) => {
    const isActive = activeTab === tab.id;
    return (
      <button
        key={tab.id}
        onClick={() => setActiveTab(tab.id)}
        className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 group text-left ${
          isActive 
            ? 'bg-primary text-white shadow-lg shadow-primary/20' 
            : 'hover:bg-dark-surface text-gray-400 hover:text-white'
        }`}
      >
        <div className={`p-2 rounded-md mr-3 ${isActive ? 'bg-white/20' : 'bg-dark-secondary group-hover:bg-dark-secondary/80'}`}>
          <tab.icon size={18} />
        </div>
        <div>
          <div className="font-bold text-sm">{tab.label}</div>
          <div className={`text-[10px] ${isActive ? 'text-blue-100' : 'text-gray-500'}`}>{tab.desc}</div>
        </div>
      </button>
    );
  };

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-7rem)] flex flex-col">
      <div className="mb-6 shrink-0">
        <h1 className="text-3xl font-bold text-white">Account Settings</h1>
        <p className="text-gray-400 mt-1">Manage your workspace preferences and integrations.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 flex-1 min-h-0">
        {/* Sidebar */}
        <div className="w-full lg:w-64 shrink-0 flex flex-col gap-2 overflow-y-auto pr-2">
          {TABS.map(renderTabButton)}
          
          <div className="mt-auto pt-6">
             <div className="p-4 rounded-lg bg-dark-surface border border-dark-secondary">
                <p className="text-xs font-bold text-gray-400 uppercase mb-2">Workspace</p>
                <div className="flex items-center gap-2 mb-3">
                   <div className="w-8 h-8 rounded bg-primary flex items-center justify-center font-bold text-white">N</div>
                   <span className="font-bold text-white text-sm">Nexus Corp</span>
                </div>
                <Button variant="outline" size="sm" className="w-full text-xs justify-center">Switch Workspace</Button>
             </div>
          </div>
        </div>

        {/* Main Content Panel */}
        <div className="flex-1 min-w-0 overflow-y-auto custom-scrollbar pb-10 pr-2">
          
          {/* === PROFILE TAB === */}
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <Card>
                <div className="relative h-32 bg-gradient-to-r from-primary to-purple-600 rounded-t-lg">
                   <div className="absolute -bottom-12 left-6">
                      <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                        <img src={profile.avatarUrl} alt="Profile" className="w-24 h-24 rounded-full border-4 border-dark bg-dark object-cover" />
                        {isEditingProfile && (
                          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white">
                             <Camera size={20} />
                          </div>
                        )}
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*"/>
                      </div>
                   </div>
                   <div className="absolute top-4 right-4">
                      <Button 
                        variant={isEditingProfile ? 'primary' : 'secondary'} 
                        size="sm" 
                        onClick={() => isEditingProfile ? handleSaveProfile() : setIsEditingProfile(true)}
                        className="shadow-lg"
                      >
                        {isEditingProfile ? 'Save Changes' : 'Edit Profile'}
                      </Button>
                   </div>
                </div>
                <div className="mt-14 px-6 pb-6">
                   <h2 className="text-2xl font-bold text-white">{profile.name}</h2>
                   <p className="text-gray-400">{profile.role} • {profile.location}</p>
                </div>
              </Card>

              <Card>
                <CardHeader><h3 className="font-bold">Personal Information</h3></CardHeader>
                <CardBody>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input label="Full Name" value={profile.name} readOnly={!isEditingProfile} onChange={e => setProfile({...profile, name: e.target.value})} />
                      <Input label="Email Address" value={profile.email} readOnly={!isEditingProfile} onChange={e => setProfile({...profile, email: e.target.value})} />
                      <Input label="Job Title" value={profile.role} readOnly={!isEditingProfile} onChange={e => setProfile({...profile, role: e.target.value as any})} />
                      <Input label="Phone Number" value={profile.phone} readOnly={!isEditingProfile} onChange={e => setProfile({...profile, phone: e.target.value})} />
                      <Input label="Location" value={profile.location} readOnly={!isEditingProfile} onChange={e => setProfile({...profile, location: e.target.value})} />
                      <Select label="Timezone" disabled={!isEditingProfile} value={profile.timezone} onChange={e => setProfile({...profile, timezone: e.target.value})}>
                         <option>UTC-8 (Pacific Time)</option>
                         <option>UTC-5 (Eastern Time)</option>
                         <option>UTC+0 (GMT)</option>
                         <option>UTC+1 (CET)</option>
                      </Select>
                      <Select label="Language" disabled={!isEditingProfile} value={profile.language} onChange={e => setProfile({...profile, language: e.target.value})}>
                         <option>English (US)</option>
                         <option>Spanish</option>
                         <option>French</option>
                         <option>German</option>
                      </Select>
                   </div>
                </CardBody>
              </Card>
            </div>
          )}

          {/* === SECURITY TAB === */}
          {activeTab === 'security' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
               <Card>
                  <CardHeader>
                     <h3 className="font-bold flex items-center gap-2"><Lock size={18}/> Password</h3>
                  </CardHeader>
                  <CardBody className="space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <Input type="password" label="Current Password" placeholder="••••••••" />
                        <Input type="password" label="New Password" placeholder="••••••••" />
                        <Input type="password" label="Confirm Password" placeholder="••••••••" />
                     </div>
                     <div className="flex justify-end">
                        <Button disabled={true}>Update Password</Button>
                     </div>
                  </CardBody>
               </Card>

               <Card>
                  <CardHeader>
                     <h3 className="font-bold flex items-center gap-2"><Smartphone size={18}/> 2-Factor Authentication</h3>
                  </CardHeader>
                  <CardBody className="flex items-center justify-between">
                     <div>
                        <p className="font-medium text-white">Authenticator App</p>
                        <p className="text-sm text-gray-400">Secure your account using Google Authenticator or Authy.</p>
                     </div>
                     <Button variant="outline">Setup</Button>
                  </CardBody>
               </Card>

               <Card className="border-red-900/50 bg-red-900/5">
                  <CardHeader className="border-red-900/30">
                     <h3 className="font-bold text-red-500 flex items-center gap-2"><AlertTriangle size={18}/> Danger Zone</h3>
                  </CardHeader>
                  <CardBody>
                     <div className="flex items-center justify-between">
                        <div>
                           <p className="font-medium text-white">Delete Account</p>
                           <p className="text-sm text-gray-400">Permanently remove your account and all data.</p>
                        </div>
                        <Button variant="danger" onClick={() => setIsDeleteAccountModalOpen(true)}>Delete Account</Button>
                     </div>
                  </CardBody>
               </Card>
            </div>
          )}

          {/* === INTEGRATIONS TAB === */}
          {activeTab === 'integrations' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
               <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {integrations.map((app) => (
                    <Card key={app.id} className={`transition-all ${app.connected ? 'border-primary/50 bg-primary/5' : ''}`}>
                       <div className="p-5">
                          <div className="flex justify-between items-start mb-3">
                             <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-white shadow-sm shrink-0`}>
                                   <app.icon size={24} className="text-black"/>
                                </div>
                                <div>
                                   <h3 className="font-bold text-lg text-white">{app.name}</h3>
                                   <span className="text-xs px-2 py-0.5 rounded bg-dark-surface border border-dark-secondary text-gray-400">{app.category}</span>
                                </div>
                             </div>
                             <Switch checked={app.connected} onChange={() => toggleIntegration(app.id)} />
                          </div>
                          <p className="text-sm text-gray-400 mb-4 min-h-[40px]">{app.desc}</p>
                          {app.connected && (
                             <div className="flex items-center gap-2 pt-4 border-t border-white/5">
                                <div className="flex items-center text-xs text-green-400">
                                   <Activity size={12} className="mr-1"/> Sync Active
                                </div>
                                <div className="flex-1"></div>
                                <Button variant="link" size="sm" className="text-xs h-auto p-0 text-gray-400 hover:text-white">Configure</Button>
                             </div>
                          )}
                       </div>
                    </Card>
                  ))}
               </div>
               
               <div className="flex justify-center pt-4">
                  <Button variant="outline" className="gap-2"><ExternalLink size={16}/> Browse App Marketplace</Button>
               </div>
            </div>
          )}

          {/* === NOTIFICATIONS TAB === */}
          {activeTab === 'notifications' && (
             <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <Card>
                   <CardHeader>
                      <h3 className="font-bold flex items-center gap-2"><Mail size={18}/> Email Notifications</h3>
                   </CardHeader>
                   <CardBody className="space-y-4">
                      <div className="flex items-center justify-between">
                         <div>
                            <p className="font-medium text-white">New Leads</p>
                            <p className="text-sm text-gray-400">When a new lead is assigned to you</p>
                         </div>
                         <Switch checked={notifications.email_newLead} onChange={() => toggleNotification('email_newLead')} />
                      </div>
                      <div className="flex items-center justify-between">
                         <div>
                            <p className="font-medium text-white">Mentions</p>
                            <p className="text-sm text-gray-400">When someone mentions you in a note</p>
                         </div>
                         <Switch checked={notifications.email_mentions} onChange={() => toggleNotification('email_mentions')} />
                      </div>
                      <div className="flex items-center justify-between">
                         <div>
                            <p className="font-medium text-white">Product Updates</p>
                            <p className="text-sm text-gray-400">News and feature releases from Nexus</p>
                         </div>
                         <Switch checked={notifications.email_marketing} onChange={() => toggleNotification('email_marketing')} />
                      </div>
                   </CardBody>
                </Card>

                <Card>
                   <CardHeader>
                      <h3 className="font-bold flex items-center gap-2"><Bell size={18}/> Push Notifications</h3>
                   </CardHeader>
                   <CardBody className="space-y-4">
                      <div className="flex items-center justify-between">
                         <div>
                            <p className="font-medium text-white">New Leads</p>
                            <p className="text-sm text-gray-400">Push alert on lead assignment</p>
                         </div>
                         <Switch checked={notifications.push_newLead} onChange={() => toggleNotification('push_newLead')} />
                      </div>
                      <div className="flex items-center justify-between">
                         <div>
                            <p className="font-medium text-white">Direct Messages</p>
                            <p className="text-sm text-gray-400">LinkedIn and Email replies</p>
                         </div>
                         <Switch checked={notifications.push_messages} onChange={() => toggleNotification('push_messages')} />
                      </div>
                      <div className="flex items-center justify-between">
                         <div>
                            <p className="font-medium text-white">Task Reminders</p>
                            <p className="text-sm text-gray-400">Daily summary and due date alerts</p>
                         </div>
                         <Switch checked={notifications.push_reminders} onChange={() => toggleNotification('push_reminders')} />
                      </div>
                   </CardBody>
                </Card>
             </div>
          )}

          {/* === BILLING TAB === */}
          {activeTab === 'billing' && (
             <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <Card className="bg-gradient-to-r from-primary/20 to-purple-600/20 border-primary/30">
                   <CardBody className="flex flex-col sm:flex-row justify-between items-center gap-4">
                      <div>
                         <p className="text-primary font-bold uppercase text-xs mb-1">Current Plan</p>
                         <h3 className="text-2xl font-bold text-white">Professional Plan</h3>
                         <p className="text-sm text-gray-400">$49/user/month • Billed Annually</p>
                      </div>
                      <Button>Upgrade Plan</Button>
                   </CardBody>
                </Card>

                <Card>
                   <CardHeader>
                      <h3 className="font-bold flex items-center gap-2"><CreditCard size={18}/> Payment Method</h3>
                   </CardHeader>
                   <CardBody className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-8 bg-white rounded flex items-center justify-center">
                            <span className="font-bold text-dark text-xs">VISA</span>
                         </div>
                         <div>
                            <p className="font-medium text-white">•••• 4242</p>
                            <p className="text-xs text-gray-400">Expires 12/2025</p>
                         </div>
                      </div>
                      <Button variant="outline" size="sm">Edit</Button>
                   </CardBody>
                </Card>

                <Card>
                   <CardHeader>
                      <h3 className="font-bold">Invoice History</h3>
                   </CardHeader>
                   <div className="divide-y divide-dark-secondary">
                      {[
                         { date: 'Oct 1, 2023', amount: '$588.00', status: 'Paid', id: 'INV-001' },
                         { date: 'Sep 1, 2023', amount: '$0.00', status: 'Trial', id: 'INV-000' },
                      ].map((inv, i) => (
                         <div key={i} className="p-4 flex items-center justify-between">
                            <div>
                               <p className="font-medium text-white">{inv.date}</p>
                               <p className="text-xs text-gray-400">{inv.id}</p>
                            </div>
                            <div className="flex items-center gap-4">
                               <span className="text-sm font-bold text-white">{inv.amount}</span>
                               <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded border border-green-500/30">{inv.status}</span>
                               <Button variant="link" size="sm" className="p-0 h-auto text-gray-400 hover:text-white"><Download size={16}/></Button>
                            </div>
                         </div>
                      ))}
                   </div>
                </Card>
             </div>
          )}

          {/* === API CONFIG TAB === */}
          {activeTab === 'api' && (
             <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <Card>
                   <CardHeader>
                      <h3 className="font-bold flex items-center gap-2"><Key size={18}/> Gemini API Configuration</h3>
                   </CardHeader>
                   <CardBody className="space-y-6">
                      <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-lg">
                         <p className="text-sm text-gray-300 mb-2">
                            <strong className="text-white">Why do I need this?</strong><br/>
                            To enable AI content generation, icebreakers, and email drafting, you must provide a valid Google Gemini API Key.
                         </p>
                         <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                            Get your API key here <ExternalLink size={12}/>
                         </a>
                      </div>

                      <div>
                         <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">API Key</label>
                         <div className="relative">
                            <input 
                               type="password" 
                               value={apiKey} 
                               onChange={(e) => { setApiKey(e.target.value); setKeyStatus('unchecked'); }}
                               placeholder="AIzaSy..."
                               className="w-full bg-dark-surface border border-dark-secondary rounded-md px-3 py-2.5 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                            />
                            <div className="absolute right-3 top-2.5">
                               {keyStatus === 'valid' && <Check size={18} className="text-green-500" />}
                               {keyStatus === 'invalid' && <AlertTriangle size={18} className="text-red-500" />}
                            </div>
                         </div>
                         <p className="text-xs text-gray-500 mt-2">Your key is stored locally in your browser's LocalStorage. It is never sent to our servers.</p>
                      </div>

                      <div className="flex items-center gap-4 pt-2">
                         <Button onClick={handleTestKey} variant="secondary" disabled={!apiKey || isTestingKey}>
                            {isTestingKey ? 'Testing...' : 'Test Connection'}
                         </Button>
                         <Button onClick={handleSaveKey} disabled={!apiKey}>
                            Save API Key
                         </Button>
                      </div>
                   </CardBody>
                </Card>
             </div>
          )}

        </div>
      </div>

      {/* Delete Account Modal */}
      <Modal
        isOpen={isDeleteAccountModalOpen}
        onClose={() => setIsDeleteAccountModalOpen(false)}
        title="Delete Account"
        footer={
           <>
              <Button variant="outline" onClick={() => setIsDeleteAccountModalOpen(false)}>Cancel</Button>
              <Button variant="danger" onClick={handleDeleteAccount}>Request Deletion</Button>
           </>
        }
      >
         <div className="flex flex-col items-center text-center p-4">
            <AlertTriangle size={32} className="text-error mb-4" />
            <p className="text-gray-300 mb-2">We're sorry to see you go.</p>
            <p className="text-sm text-gray-500">Please confirm that you want to delete your account. This action requires administrative approval and may take up to 24 hours.</p>
         </div>
      </Modal>
    </div>
  );
};
