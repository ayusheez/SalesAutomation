
import { MOCK_COMPANIES, MOCK_DEALS, MOCK_LEADS, MOCK_SEQUENCES, MOCK_MEETINGS, MOCK_TASKS } from "../constants";
import { Company, Deal, Lead, Sequence, SequenceStep, Meeting, LinkedInCampaign, LinkedInMessage, Task, UserList, EmailMessage, ContentPost } from "../types";

// Helper to load/save
const load = <T>(key: string, defaultVal: T): T => {
  try {
    const stored = localStorage.getItem(`nexus_${key}`);
    return stored ? JSON.parse(stored) : defaultVal;
  } catch (e) {
    console.warn('LocalStorage access failed', e);
    return defaultVal;
  }
};

const save = (key: string, val: any) => {
  try {
    localStorage.setItem(`nexus_${key}`, JSON.stringify(val));
  } catch (e) {
    console.warn('LocalStorage save failed', e);
  }
};

// Add default 'isContactRevealed' to MOCK_LEADS for consistency if not present
const ENRICHED_MOCK_LEADS = MOCK_LEADS.map(lead => ({
  ...lead,
  isContactRevealed: lead.isContactRevealed || false
}));

// Mock Data
const MOCK_LINKEDIN_CAMPAIGNS: LinkedInCampaign[] = [
  {
    id: 'li-1',
    name: 'CTO Outreach - Series A',
    status: 'active',
    targetAudience: 'CTOs in San Francisco',
    stats: { sent: 145, accepted: 62, replied: 18 },
    steps: [
      { id: 's1', type: 'linkedin_visit', order: 1 },
      { id: 's2', type: 'wait', delayDays: 1, order: 2 },
      { id: 's3', type: 'linkedin_connect', order: 3, content: "Hi {{firstName}}, saw you're hiring engineers. Let's connect." },
      { id: 's4', type: 'wait', delayDays: 2, order: 4 },
      { id: 's5', type: 'linkedin_message', order: 5, content: "Thanks for connecting! Quick question about your tech stack..." }
    ]
  },
  {
    id: 'li-2',
    name: 'Hiring Managers - Q3',
    status: 'paused',
    targetAudience: 'VPs of Sales',
    stats: { sent: 300, accepted: 89, replied: 5 },
    steps: [
      { id: 's1', type: 'linkedin_connect', order: 1, content: "I admire your work at {{company}}!" },
      { id: 's2', type: 'wait', delayDays: 3, order: 2 },
      { id: 's3', type: 'linkedin_message', order: 3, content: "Would love to chat." }
    ]
  }
];

const MOCK_LINKEDIN_MESSAGES: LinkedInMessage[] = [
  { id: 'm1', senderName: 'Alice Chen', senderAvatar: 'https://ui-avatars.com/api/?name=Alice+Chen&background=random', content: "Thanks for reaching out! Yes, we are hiring.", time: '10m ago', unread: true, isReply: true },
  { id: 'm2', senderName: 'Bob Wilson', senderAvatar: 'https://ui-avatars.com/api/?name=Bob+Wilson&background=random', content: "Sure, let's connect next week.", time: '2h ago', unread: true, isReply: true },
  { id: 'm3', senderName: 'Carol Danvers', senderAvatar: 'https://ui-avatars.com/api/?name=Carol+Danvers&background=random', content: "I'm not interested right now, thanks.", time: '1d ago', unread: false, isReply: true },
];

const MOCK_USER_LISTS: UserList[] = [
  { id: 'l1', name: 'Q3 Outreach', count: 0 },
  { id: 'l2', name: 'Competitors', count: 0 },
  { id: 'l3', name: 'Conference Leads', count: 0 },
];

const MOCK_EMAILS: EmailMessage[] = [
  { id: 'e1', from: 'John Doe', subject: 'Re: Meeting next week', preview: 'Hi Jane, that time works for me...', content: 'Hi Jane,\n\nThat time works for me. See you then!\n\nBest,\nJohn', time: '10:30 AM', unread: true, isReply: true },
  { id: 'e2', from: 'Sarah Smith', subject: 'Project Proposal', preview: 'Attached is the proposal we discussed.', content: 'Hi Jane,\n\nPlease find the attached proposal.\n\nThanks,\nSarah', time: 'Yesterday', unread: false, isReply: false },
  { id: 'e3', from: 'Support', subject: 'Ticket #1234 Update', preview: 'Your issue has been resolved.', content: 'Your ticket has been closed.', time: 'Oct 22', unread: false, isReply: true },
];

const MOCK_POSTS: ContentPost[] = [
  { id: 'p1', title: 'Product Launch Teaser', platform: 'linkedin', day: 2, time: '10:00 AM' },
  { id: 'p2', title: 'Industry News Thread', platform: 'twitter', day: 4, time: '2:00 PM' },
];

// Initialize data if empty
if (!localStorage.getItem('nexus_leads')) save('leads', ENRICHED_MOCK_LEADS);
if (!localStorage.getItem('nexus_companies')) save('companies', MOCK_COMPANIES);
if (!localStorage.getItem('nexus_deals')) save('deals', MOCK_DEALS);
if (!localStorage.getItem('nexus_sequences')) save('sequences', MOCK_SEQUENCES);
if (!localStorage.getItem('nexus_meetings')) save('meetings', MOCK_MEETINGS);
if (!localStorage.getItem('nexus_linkedin_campaigns')) save('linkedin_campaigns', MOCK_LINKEDIN_CAMPAIGNS);
if (!localStorage.getItem('nexus_tasks')) save('tasks', MOCK_TASKS);
if (!localStorage.getItem('nexus_lists')) save('lists', MOCK_USER_LISTS);
if (!localStorage.getItem('nexus_emails')) save('emails', MOCK_EMAILS);
if (!localStorage.getItem('nexus_posts')) save('posts', MOCK_POSTS);

export const leadService = {
  getAll: async (): Promise<Lead[]> => {
    return new Promise((resolve) => setTimeout(() => resolve(load('leads', ENRICHED_MOCK_LEADS)), 300));
  },
  add: async (lead: Omit<Lead, 'id'>): Promise<Lead> => {
    const leads = load<Lead[]>('leads', ENRICHED_MOCK_LEADS);
    const newLead = { ...lead, id: Math.random().toString(36).substr(2, 9) };
    const updated = [newLead, ...leads];
    save('leads', updated);
    return newLead;
  },
  update: async (lead: Lead): Promise<Lead> => {
    const leads = load<Lead[]>('leads', ENRICHED_MOCK_LEADS);
    const updated = leads.map(l => l.id === lead.id ? lead : l);
    save('leads', updated);
    return lead;
  },
  delete: async (id: string): Promise<void> => {
    const leads = load<Lead[]>('leads', ENRICHED_MOCK_LEADS);
    const updated = leads.filter(l => l.id !== id);
    save('leads', updated);
  }
};

export const companyService = {
  getAll: async (): Promise<Company[]> => {
    return new Promise((resolve) => setTimeout(() => resolve(load('companies', MOCK_COMPANIES)), 300));
  },
  add: async (company: Omit<Company, 'id'>): Promise<Company> => {
    const companies = load<Company[]>('companies', MOCK_COMPANIES);
    const newCompany = { ...company, id: Math.random().toString(36).substr(2, 9) };
    const updated = [newCompany, ...companies];
    save('companies', updated);
    return newCompany;
  },
  update: async (company: Company): Promise<Company> => {
    const companies = load<Company[]>('companies', MOCK_COMPANIES);
    const updated = companies.map(c => c.id === company.id ? company : c);
    save('companies', updated);
    return company;
  },
  delete: async (id: string): Promise<void> => {
    const companies = load<Company[]>('companies', MOCK_COMPANIES);
    const updated = companies.filter(c => c.id !== id);
    save('companies', updated);
  }
};

export const dealService = {
  getAll: async (): Promise<Deal[]> => {
    return new Promise((resolve) => setTimeout(() => resolve(load('deals', MOCK_DEALS)), 300));
  },
  updateStage: async (dealId: string, stage: Deal['stage']): Promise<void> => {
    const deals = load<Deal[]>('deals', MOCK_DEALS);
    const updated = deals.map(d => d.id === dealId ? { ...d, stage } : d);
    save('deals', updated);
  },
  add: async (deal: Omit<Deal, 'id'>): Promise<Deal> => {
    const deals = load<Deal[]>('deals', MOCK_DEALS);
    const newDeal = { ...deal, id: Math.random().toString(36).substr(2, 9) };
    const updated = [newDeal, ...deals];
    save('deals', updated);
    return newDeal;
  },
  update: async (deal: Deal): Promise<Deal> => {
    const deals = load<Deal[]>('deals', MOCK_DEALS);
    const updated = deals.map(d => d.id === deal.id ? deal : d);
    save('deals', updated);
    return deal;
  },
  delete: async (id: string): Promise<void> => {
    const deals = load<Deal[]>('deals', MOCK_DEALS);
    const updated = deals.filter(d => d.id !== id);
    save('deals', updated);
  }
};

export const sequenceService = {
  getAll: async (): Promise<Sequence[]> => {
    return new Promise((resolve) => setTimeout(() => resolve(load('sequences', MOCK_SEQUENCES)), 300));
  },
  toggleActive: async (id: string): Promise<void> => {
    const sequences = load<Sequence[]>('sequences', MOCK_SEQUENCES);
    const updated = sequences.map(s => s.id === id ? { ...s, active: !s.active } : s);
    save('sequences', updated);
  },
  addStep: async (sequenceId: string, step: SequenceStep): Promise<void> => {
    const sequences = load<Sequence[]>('sequences', MOCK_SEQUENCES);
    const updated = sequences.map(s => {
      if (s.id === sequenceId) {
        return { ...s, steps: [...s.steps, step] };
      }
      return s;
    });
    save('sequences', updated);
  },
  add: async (sequence: Omit<Sequence, 'id'>): Promise<Sequence> => {
    const sequences = load<Sequence[]>('sequences', MOCK_SEQUENCES);
    const newSequence = { ...sequence, id: Math.random().toString(36).substr(2, 9) };
    const updated = [newSequence, ...sequences];
    save('sequences', updated);
    return newSequence;
  },
  delete: async (id: string): Promise<void> => {
    const sequences = load<Sequence[]>('sequences', MOCK_SEQUENCES);
    const updated = sequences.filter(s => s.id !== id);
    save('sequences', updated);
  }
};

export const meetingService = {
  getAll: async (): Promise<Meeting[]> => {
    return new Promise((resolve) => setTimeout(() => resolve(load('meetings', MOCK_MEETINGS)), 300));
  },
  add: async (meeting: Omit<Meeting, 'id'>): Promise<Meeting> => {
    const meetings = load<Meeting[]>('meetings', MOCK_MEETINGS);
    const newMeeting = { ...meeting, id: Math.random().toString(36).substr(2, 9) };
    const updated = [newMeeting, ...meetings];
    save('meetings', updated);
    return newMeeting;
  },
  update: async (meeting: Meeting): Promise<Meeting> => {
    const meetings = load<Meeting[]>('meetings', MOCK_MEETINGS);
    const updated = meetings.map(m => m.id === meeting.id ? meeting : m);
    save('meetings', updated);
    return meeting;
  },
  delete: async (id: string): Promise<void> => {
    const meetings = load<Meeting[]>('meetings', MOCK_MEETINGS);
    const updated = meetings.filter(m => m.id !== id);
    save('meetings', updated);
  }
};

export const taskService = {
  getAll: async (): Promise<Task[]> => {
    return new Promise((resolve) => setTimeout(() => resolve(load('tasks', MOCK_TASKS)), 300));
  },
  toggleComplete: async (id: string): Promise<void> => {
    const tasks = load<Task[]>('tasks', MOCK_TASKS);
    const updated = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    save('tasks', updated);
  },
  add: async (task: Omit<Task, 'id'>): Promise<Task> => {
    const tasks = load<Task[]>('tasks', MOCK_TASKS);
    const newTask = { ...task, id: Math.random().toString(36).substr(2, 9) };
    const updated = [newTask, ...tasks];
    save('tasks', updated);
    return newTask;
  },
  delete: async (id: string): Promise<void> => {
    const tasks = load<Task[]>('tasks', MOCK_TASKS);
    const updated = tasks.filter(t => t.id !== id);
    save('tasks', updated);
  }
};

export const linkedinService = {
  getAllCampaigns: async (): Promise<LinkedInCampaign[]> => {
     return new Promise((resolve) => setTimeout(() => resolve(load('linkedin_campaigns', MOCK_LINKEDIN_CAMPAIGNS)), 300));
  },
  getMessages: async (): Promise<LinkedInMessage[]> => {
    return new Promise((resolve) => setTimeout(() => resolve(MOCK_LINKEDIN_MESSAGES), 300));
  },
  addCampaign: async (campaign: Omit<LinkedInCampaign, 'id'>): Promise<LinkedInCampaign> => {
    const campaigns = load<LinkedInCampaign[]>('linkedin_campaigns', MOCK_LINKEDIN_CAMPAIGNS);
    const newCampaign = { ...campaign, id: Math.random().toString(36).substr(2, 9) };
    const updated = [newCampaign, ...campaigns];
    save('linkedin_campaigns', updated);
    return newCampaign;
  },
  toggleStatus: async (id: string): Promise<LinkedInCampaign> => {
    const campaigns = load<LinkedInCampaign[]>('linkedin_campaigns', MOCK_LINKEDIN_CAMPAIGNS);
    const campaign = campaigns.find(c => c.id === id);
    if (!campaign) throw new Error("Campaign not found");
    
    const updatedCampaign = { ...campaign, status: campaign.status === 'active' ? 'paused' : 'active' } as LinkedInCampaign;
    const updatedList = campaigns.map(c => c.id === id ? updatedCampaign : c);
    save('linkedin_campaigns', updatedList);
    return updatedCampaign;
  },
  updateSteps: async (campaignId: string, steps: SequenceStep[]): Promise<void> => {
     const campaigns = load<LinkedInCampaign[]>('linkedin_campaigns', MOCK_LINKEDIN_CAMPAIGNS);
     const updatedList = campaigns.map(c => c.id === campaignId ? { ...c, steps } : c);
     save('linkedin_campaigns', updatedList);
  },
  delete: async (id: string): Promise<void> => {
    const campaigns = load<LinkedInCampaign[]>('linkedin_campaigns', MOCK_LINKEDIN_CAMPAIGNS);
    const updated = campaigns.filter(c => c.id !== id);
    save('linkedin_campaigns', updated);
  }
};

export const listService = {
  getAll: async (): Promise<UserList[]> => {
    return new Promise((resolve) => setTimeout(() => resolve(load('lists', MOCK_USER_LISTS)), 300));
  },
  add: async (list: Omit<UserList, 'id'>): Promise<UserList> => {
    const lists = load<UserList[]>('lists', MOCK_USER_LISTS);
    const newList = { ...list, id: Math.random().toString(36).substr(2, 9) };
    const updated = [...lists, newList];
    save('lists', updated);
    return newList;
  },
  delete: async (id: string): Promise<void> => {
    const lists = load<UserList[]>('lists', MOCK_USER_LISTS);
    const updated = lists.filter(l => l.id !== id);
    save('lists', updated);
  }
};

export const inboxService = {
  getAll: async (): Promise<EmailMessage[]> => {
    return new Promise((resolve) => setTimeout(() => resolve(load('emails', MOCK_EMAILS)), 300));
  },
  add: async (email: Omit<EmailMessage, 'id'>): Promise<EmailMessage> => {
    const emails = load<EmailMessage[]>('emails', MOCK_EMAILS);
    const newEmail = { ...email, id: Math.random().toString(36).substr(2, 9) };
    const updated = [newEmail, ...emails];
    save('emails', updated);
    return newEmail;
  },
  delete: async (id: string): Promise<void> => {
    const emails = load<EmailMessage[]>('emails', MOCK_EMAILS);
    const updated = emails.filter(e => e.id !== id);
    save('emails', updated);
  }
};

export const contentService = {
  getAllPosts: async (): Promise<ContentPost[]> => {
    return new Promise((resolve) => setTimeout(() => resolve(load('posts', MOCK_POSTS)), 300));
  },
  addPost: async (post: Omit<ContentPost, 'id'>): Promise<ContentPost> => {
    const posts = load<ContentPost[]>('posts', MOCK_POSTS);
    const newPost = { ...post, id: Math.random().toString(36).substr(2, 9) };
    const updated = [...posts, newPost];
    save('posts', updated);
    return newPost;
  },
  deletePost: async (id: string): Promise<void> => {
    const posts = load<ContentPost[]>('posts', MOCK_POSTS);
    const updated = posts.filter(p => p.id !== id);
    save('posts', updated);
  }
};
