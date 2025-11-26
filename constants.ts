

import { Company, Deal, Lead, LeadStatus, Sequence, UserRole, Meeting, Task } from "./types";

export const MOCK_LEADS: Lead[] = [
  { 
    id: '1', 
    name: 'Shivtej Magar', 
    title: 'VP of Sales', 
    company: 'TechFlow', 
    location: 'San Francisco, CA', 
    email: 'shivtej@techflow.io', 
    phone: '+1 (555) 123-4567', 
    status: LeadStatus.NEW, 
    avatarUrl: 'https://picsum.photos/id/1/200/200', 
    notes: 'Met at SaaS conference 2024.', 
    tags: ['VIP', 'Decision Maker'],
    intentScore: 85,
    signals: ['Hiring', 'Series B'],
    campaignStatus: 'Active',
    linkedinStatus: 'connected'
  },
  { 
    id: '2', 
    name: 'John Doe', 
    title: 'Marketing Director', 
    company: 'Growth.ai', 
    location: 'New York, NY', 
    email: 'john@growth.ai', 
    phone: '+1 (555) 987-6543', 
    status: LeadStatus.CONTACTED, 
    avatarUrl: 'https://picsum.photos/id/2/200/200', 
    tags: ['Warm'],
    intentScore: 92,
    signals: ['New Tech Stack', 'High Traffic'],
    campaignStatus: 'Completed',
    linkedinStatus: 'connected'
  },
  { 
    id: '3', 
    name: 'Sarah Smith', 
    title: 'CEO', 
    company: 'StartUp Inc', 
    location: 'Austin, TX', 
    email: 'sarah@startup.com', 
    phone: '+1 (555) 456-7890', 
    status: LeadStatus.INTERESTED, 
    avatarUrl: 'https://picsum.photos/id/3/200/200', 
    tags: ['High Value'],
    intentScore: 45,
    signals: ['Funding'],
    campaignStatus: 'None',
    linkedinStatus: 'not_connected'
  },
  { 
    id: '4', 
    name: 'Michael Brown', 
    title: 'CTO', 
    company: 'DevOps Sol', 
    location: 'Remote', 
    email: 'mike@devops.net', 
    status: LeadStatus.NEW, 
    avatarUrl: 'https://picsum.photos/id/4/200/200',
    intentScore: 78,
    signals: ['Hiring Engineers'],
    campaignStatus: 'Paused',
    linkedinStatus: 'pending'
  },
  { 
    id: '5', 
    name: 'Emily Chen', 
    title: 'Product Manager', 
    company: 'Innovate', 
    location: 'Seattle, WA', 
    email: 'emily@innovate.co', 
    status: LeadStatus.CLOSED, 
    avatarUrl: 'https://picsum.photos/id/5/200/200',
    intentScore: 30,
    campaignStatus: 'None',
    linkedinStatus: 'not_connected'
  },
  { 
    id: '6', 
    name: 'David Wilson', 
    title: 'Head of Design', 
    company: 'Creative Studio', 
    location: 'Los Angeles, CA', 
    email: 'david@creative.com', 
    status: LeadStatus.NEW, 
    avatarUrl: 'https://picsum.photos/id/6/200/200',
    intentScore: 65,
    signals: ['Rebranding'],
    campaignStatus: 'None',
    linkedinStatus: 'not_connected'
  },
  { 
    id: '7', 
    name: 'Lisa Taylor', 
    title: 'COO', 
    company: 'Enterprise Corp', 
    location: 'Chicago, IL', 
    email: 'lisa@enterprise.com', 
    status: LeadStatus.CONTACTED, 
    avatarUrl: 'https://picsum.photos/id/7/200/200',
    intentScore: 88,
    signals: ['Expansion'],
    campaignStatus: 'Active',
    linkedinStatus: 'connected'
  },
  { 
    id: '8', 
    name: 'James Anderson', 
    title: 'VP Engineering', 
    company: 'TechFlow', 
    location: 'San Francisco, CA', 
    email: 'james@techflow.io', 
    status: LeadStatus.NEW, 
    avatarUrl: 'https://picsum.photos/id/8/200/200',
    intentScore: 95,
    signals: ['Hiring', 'Series B'],
    campaignStatus: 'None',
    linkedinStatus: 'not_connected'
  },
  { 
    id: '9', 
    name: 'Amanda Lowery', 
    title: 'Head of People', 
    company: 'Growth.ai', 
    location: 'New York, NY', 
    email: 'amanda@growth.ai', 
    status: LeadStatus.NEW, 
    avatarUrl: 'https://picsum.photos/id/9/200/200',
    intentScore: 70,
    signals: ['Hiring'],
    campaignStatus: 'None',
    linkedinStatus: 'not_connected'
  },
  { 
    id: '10', 
    name: 'Robert Stark', 
    title: 'Director of IT', 
    company: 'Enterprise Corp', 
    location: 'Chicago, IL', 
    email: 'robert@enterprise.com', 
    status: LeadStatus.NEW, 
    avatarUrl: 'https://picsum.photos/id/10/200/200',
    intentScore: 40,
    campaignStatus: 'None',
    linkedinStatus: 'not_connected'
  },
  { 
    id: '11', 
    name: 'Patricia Wu', 
    title: 'VP Marketing', 
    company: 'Innovate', 
    location: 'Seattle, WA', 
    email: 'patricia@innovate.co', 
    status: LeadStatus.NEW, 
    avatarUrl: 'https://picsum.photos/id/11/200/200',
    intentScore: 60,
    signals: ['Conference Speaker'],
    campaignStatus: 'None',
    linkedinStatus: 'pending'
  },
  { 
    id: '12', 
    name: 'Kevin O\'Connell', 
    title: 'Sales Manager', 
    company: 'TechFlow', 
    location: 'Austin, TX', 
    email: 'kevin@techflow.io', 
    status: LeadStatus.NEW, 
    avatarUrl: 'https://picsum.photos/id/12/200/200',
    intentScore: 55,
    campaignStatus: 'None',
    linkedinStatus: 'not_connected'
  },
];

export const MOCK_COMPANIES: Company[] = [
  { 
    id: '1', 
    name: 'TechFlow', 
    industry: 'Software', 
    employees: '50-200', 
    location: 'San Francisco, CA', 
    revenue: '$10M', 
    logoUrl: 'https://ui-avatars.com/api/?name=TechFlow&background=0D8ABC&color=fff&rounded=true&bold=true',
    website: 'www.techflow.io',
    description: 'Leading provider of workflow automation software for enterprise teams. Recently raised Series B funding.',
    phone: '+1 (415) 555-0100',
    techStack: ['React', 'Node.js', 'AWS', 'PostgreSQL'],
    tier: 'Tier 1',
    intentScore: 90,
    signals: ['Funding', 'Hiring']
  },
  { 
    id: '2', 
    name: 'Growth.ai', 
    industry: 'Marketing', 
    employees: '10-50', 
    location: 'New York, NY', 
    revenue: '$5M', 
    logoUrl: 'https://ui-avatars.com/api/?name=Growth+AI&background=F59E0B&color=fff&rounded=true&bold=true',
    website: 'www.growth.ai',
    description: 'AI-powered marketing analytics platform for e-commerce brands.',
    phone: '+1 (212) 555-0199',
    techStack: ['Python', 'TensorFlow', 'GCP'],
    tier: 'Tier 2',
    intentScore: 75,
    signals: ['New Product Launch']
  },
  { 
    id: '3', 
    name: 'Enterprise Corp', 
    industry: 'Finance', 
    employees: '1000+', 
    location: 'Chicago, IL', 
    revenue: '$500M', 
    logoUrl: 'https://ui-avatars.com/api/?name=Enterprise&background=10B981&color=fff&rounded=true&bold=true',
    website: 'www.enterprisecorp.com',
    description: 'Global financial services firm specializing in corporate investment.',
    phone: '+1 (312) 555-0555',
    techStack: ['Java', 'Oracle', 'Angular'],
    tier: 'Tier 1',
    intentScore: 50
  },
  { 
    id: '4', 
    name: 'DevOps Sol', 
    industry: 'IT Services', 
    employees: '200-500', 
    location: 'Remote', 
    revenue: '$25M', 
    logoUrl: 'https://ui-avatars.com/api/?name=DevOps&background=6366F1&color=fff&rounded=true&bold=true',
    website: 'www.devops-sol.net',
    description: 'Cloud infrastructure management and DevOps consulting.',
    phone: '+1 (800) 555-0000',
    techStack: ['Kubernetes', 'Docker', 'Azure', 'Go'],
    tier: 'Tier 2',
    intentScore: 65
  },
  { 
    id: '5', 
    name: 'Innovate', 
    industry: 'Software', 
    employees: '50-200', 
    location: 'Seattle, WA', 
    revenue: '$15M', 
    logoUrl: 'https://ui-avatars.com/api/?name=Innovate&background=8B5CF6&color=fff&rounded=true&bold=true',
    website: 'www.innovate.co',
    description: 'Product management software for remote teams.',
    phone: '+1 (206) 555-0123',
    techStack: ['Ruby', 'Rails', 'Vue.js'],
    tier: 'Tier 2',
    intentScore: 60
  },
  { 
    id: '6', 
    name: 'StartUp Inc', 
    industry: 'Consumer Goods', 
    employees: '1-10', 
    location: 'Austin, TX', 
    revenue: '$1M', 
    logoUrl: 'https://ui-avatars.com/api/?name=StartUp&background=EC4899&color=fff&rounded=true&bold=true',
    website: 'www.startup.com',
    description: 'Direct-to-consumer sustainable goods.',
    phone: '+1 (512) 555-0987',
    techStack: ['Shopify', 'Klaviyo'],
    tier: 'Tier 3',
    intentScore: 45
  },
  { 
    id: '7', 
    name: 'Creative Studio', 
    industry: 'Design', 
    employees: '11-50', 
    location: 'Los Angeles, CA', 
    revenue: '$3M', 
    logoUrl: 'https://ui-avatars.com/api/?name=Creative&background=EF4444&color=fff&rounded=true&bold=true',
    website: 'www.creative.com',
    description: 'Award-winning design agency.',
    phone: '+1 (323) 555-0000',
    techStack: ['Adobe', 'Figma', 'Webflow'],
    tier: 'Tier 3',
    intentScore: 55
  }
];

export const MOCK_DEALS: Deal[] = [
  { id: '1', title: 'Enterprise License', value: 25000, stage: 'in-progress', leadId: '1', leadName: 'Shivtej Magar' },
  { id: '2', title: 'Q3 Marketing Retainer', value: 15000, stage: 'to-contact', leadId: '2', leadName: 'John Doe' },
  { id: '3', title: 'Consulting Project', value: 5000, stage: 'closed', leadId: '3', leadName: 'Sarah Smith' },
  { id: '4', title: 'Pilot Program', value: 2000, stage: 'to-contact', leadId: '4', leadName: 'Michael Brown' },
];

export const MOCK_SEQUENCES: Sequence[] = [
  {
    id: '1',
    name: 'Cold Outreach - CTOs',
    active: true,
    stats: { sent: 120, opened: 45, replied: 12 },
    steps: [
      { id: 's1', type: 'linkedin_connect', order: 1 },
      { id: 's2', type: 'wait', delayDays: 1, order: 2 },
      { id: 's3', type: 'linkedin_message', content: 'Thanks for connecting!', order: 3, variantLabel: 'A' },
      { id: 's4', type: 'wait', delayDays: 2, order: 4 },
      { id: 's5', type: 'email', content: 'Checking in regarding...', order: 5 },
    ]
  },
  {
    id: '2',
    name: 'Webinar Follow-up',
    active: false,
    stats: { sent: 300, opened: 150, replied: 5 },
    steps: [
      { id: 's1', type: 'email', content: 'Here is the recording...', order: 1 },
      { id: 's2', type: 'wait', delayDays: 3, order: 2 },
      { id: 's3', type: 'email', content: 'Any questions?', order: 3 },
    ]
  }
];

export const MOCK_MEETINGS: Meeting[] = [
  { id: '1', title: 'Demo with TechFlow', date: '2023-10-25', time: '10:00', duration: 30, type: 'Zoom', leadId: '1', leadName: 'Shivtej Magar' },
  { id: '2', title: 'Follow-up Call', date: '2023-10-26', time: '14:30', duration: 15, type: 'Phone', leadId: '2', leadName: 'John Doe' },
  { id: '3', title: 'Contract Review', date: '2023-10-27', time: '16:00', duration: 60, type: 'Google Meet', leadId: '3', leadName: 'Sarah Smith' },
];

export const MOCK_TASKS: Task[] = [
  { id: '1', title: 'Call Shivtej Magar about Q3 goals', dueDate: 'Today', priority: 'high', completed: false, type: 'call', relatedId: '1', relatedName: 'Shivtej Magar' },
  { id: '2', title: 'Prepare contract for TechFlow', dueDate: 'Tomorrow', priority: 'high', completed: false, type: 'todo', relatedId: '1', relatedName: 'TechFlow' },
  { id: '3', title: 'Follow up with Sarah Smith', dueDate: 'Today', priority: 'medium', completed: false, type: 'email', relatedId: '3', relatedName: 'Sarah Smith' },
  { id: '4', title: 'Review Q4 Marketing Deck', dueDate: 'Friday', priority: 'low', completed: true, type: 'todo' },
];

export const CURRENT_USER = {
  name: 'Jane Doe',
  role: UserRole.ADMIN,
  avatarUrl: 'https://picsum.photos/id/64/200/200',
  email: 'jane.doe@nexus.com',
  phone: '+1 (555) 010-9999'
};
