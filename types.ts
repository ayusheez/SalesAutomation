
export enum LeadStatus {
  NEW = 'New',
  CONTACTED = 'Contacted',
  INTERESTED = 'Interested',
  CLOSED = 'Closed'
}

export interface Lead {
  id: string;
  name: string;
  title: string;
  company: string;
  location: string;
  email: string;
  phone?: string;
  status: LeadStatus;
  avatarUrl: string;
  notes?: string;
  linkedinUrl?: string;
  tags?: string[];
  lists?: string[]; // IDs of lists this lead belongs to
  emailStatus?: 'verified' | 'guessed' | 'unavailable';
  // Apollo/Dripify Features
  intentScore?: number; // 0-100
  signals?: string[]; // e.g. 'Hiring', 'Funding', 'Job Change'
  campaignStatus?: 'Active' | 'Completed' | 'Paused' | 'None';
  linkedinStatus?: 'connected' | 'pending' | 'not_connected';
  isContactRevealed?: boolean; // New field for persistence
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  employees: string;
  location: string;
  revenue: string;
  logoUrl: string;
  website?: string;
  linkedinUrl?: string;
  description?: string;
  phone?: string;
  techStack?: string[];
  tier?: 'Tier 1' | 'Tier 2' | 'Tier 3';
  tags?: string[];
  lists?: string[];
  // New fields
  intentScore?: number;
  signals?: string[];
}

export interface Deal {
  id: string;
  title: string;
  value: number;
  stage: 'to-contact' | 'in-progress' | 'closed';
  leadId: string;
  leadName: string;
}

export interface SequenceStep {
  id: string;
  type: 'email' | 'linkedin_connect' | 'linkedin_message' | 'wait' | 'call' | 'linkedin_visit' | 'linkedin_like';
  content?: string;
  delayDays?: number;
  order: number;
  variantLabel?: string; // For A/B testing visuals
}

export interface Sequence {
  id: string;
  name: string;
  active: boolean;
  stats: {
    sent: number;
    opened: number;
    replied: number;
  };
  steps: SequenceStep[];
}

export interface LinkedInCampaign {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'draft';
  targetAudience: string;
  stats: {
    sent: number;
    accepted: number;
    replied: number;
  };
  steps: SequenceStep[];
}

export interface LinkedInMessage {
  id: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  time: string;
  unread: boolean;
  isReply: boolean;
}

export interface EmailMessage {
  id: string;
  from: string;
  subject: string;
  preview: string;
  content?: string;
  time: string; // Changed from date to time to match usage
  unread: boolean;
  isReply: boolean;
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: number; // minutes
  type: 'Zoom' | 'Google Meet' | 'Phone' | 'In-Person';
  leadId?: string;
  leadName?: string;
  notes?: string;
}

export interface Task {
  id: string;
  title: string;
  dueDate: string; // ISO Date or relative string
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  type: 'call' | 'email' | 'linkedin' | 'todo';
  relatedId?: string; 
  relatedName?: string;
}

export interface UserList {
  id: string;
  name: string;
  count: number;
}

export interface SavedSearch {
  id: string;
  name: string;
  filters: any;
}

export interface ContentPost {
  id: string;
  title: string;
  platform: 'linkedin' | 'twitter' | 'instagram';
  day: number; // 0-6 (Sun-Sat)
  time: string;
}

export enum UserRole {
  ADMIN = 'Admin',
  USER = 'User'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
  phone?: string;
  location?: string;
  timezone?: string;
  language?: string;
}
