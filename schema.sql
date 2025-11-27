-- ============================================
-- Supabase Database Schema Export
-- ============================================
-- This file contains the complete schema structure
-- Run this in your Supabase SQL Editor to recreate the database
-- ============================================

-- Enable UUID extension (required for uuid_generate_v4())
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE DEFINITIONS
-- ============================================

CREATE TABLE public.companies (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  website text,
  linkedin_url text,
  description text,
  revenue text,
  location text,
  employees text,
  industry text,
  name text NOT NULL,
  phone text,
  tags text[],
  lists text[],
  logo_url text,
  signals text[],
  updated_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  intent_score integer,
  tech_stack text[],
  tier text
);

CREATE TABLE public.content_posts (
  platform text NOT NULL,
  title text NOT NULL,
  updated_at timestamp with time zone DEFAULT now(),
  time text,
  created_at timestamp with time zone DEFAULT now(),
  day integer,
  id uuid NOT NULL DEFAULT uuid_generate_v4()
);

CREATE TABLE public.deals (
  lead_id text,
  value numeric,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  lead_name text,
  stage text NOT NULL,
  title text NOT NULL
);

CREATE TABLE public.email_messages (
  content text,
  time text NOT NULL,
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  unread boolean DEFAULT false,
  is_reply boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  preview text,
  subject text NOT NULL,
  from_address text NOT NULL
);

CREATE TABLE public.leads (
  is_contact_revealed boolean DEFAULT false,
  email_status text,
  intent_score integer,
  signals text[],
  campaign_status text,
  linkedin_status text,
  updated_at timestamp with time zone DEFAULT now(),
  status text DEFAULT 'New'::text,
  phone text,
  email text,
  location text,
  company text,
  title text,
  name text NOT NULL,
  lists text[],
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  avatar_url text,
  notes text,
  linkedin_url text,
  tags text[],
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.linkedin_campaign_steps (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  content text,
  "order" integer NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  type text NOT NULL,
  variant_label text,
  delay_days integer,
  campaign_id uuid
);

CREATE TABLE public.linkedin_campaigns (
  updated_at timestamp with time zone DEFAULT now(),
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  stats jsonb DEFAULT '{"sent": 0, "replied": 0, "accepted": 0}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  name text NOT NULL,
  status text NOT NULL DEFAULT 'active'::text,
  target_audience text
);

CREATE TABLE public.linkedin_messages (
  sender_name text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  is_reply boolean DEFAULT false,
  unread boolean DEFAULT false,
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  time text NOT NULL,
  content text NOT NULL,
  sender_avatar text
);

CREATE TABLE public.meetings (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  duration integer,
  updated_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  notes text,
  lead_name text,
  lead_id text,
  type text,
  time text NOT NULL,
  date text NOT NULL,
  title text NOT NULL
);

CREATE TABLE public.sequence_steps (
  variant_label text,
  created_at timestamp with time zone DEFAULT now(),
  "order" integer NOT NULL,
  delay_days integer,
  sequence_id uuid,
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  type text NOT NULL,
  content text
);

CREATE TABLE public.sequences (
  updated_at timestamp with time zone DEFAULT now(),
  active boolean DEFAULT true,
  stats jsonb DEFAULT '{"sent": 0, "opened": 0, "replied": 0}'::jsonb,
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  created_at timestamp with time zone DEFAULT now(),
  name text NOT NULL
);

CREATE TABLE public.tasks (
  related_id text,
  type text,
  updated_at timestamp with time zone DEFAULT now(),
  related_name text,
  created_at timestamp with time zone DEFAULT now(),
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  due_date text,
  priority text,
  completed boolean DEFAULT false
);

CREATE TABLE public.user_lists (
  updated_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  name text NOT NULL,
  count integer DEFAULT 0,
  id uuid NOT NULL DEFAULT uuid_generate_v4()
);

CREATE TABLE public.users (
  auth_id uuid,
  role text DEFAULT 'User'::text,
  avatar_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  phone text,
  location text,
  language text DEFAULT 'en'::text,
  timezone text,
  name text NOT NULL,
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  email text NOT NULL
);

-- ============================================
-- PRIMARY KEYS
-- ============================================

ALTER TABLE public.companies ADD CONSTRAINT companies_pkey PRIMARY KEY (id);
ALTER TABLE public.content_posts ADD CONSTRAINT content_posts_pkey PRIMARY KEY (id);
ALTER TABLE public.deals ADD CONSTRAINT deals_pkey PRIMARY KEY (id);
ALTER TABLE public.email_messages ADD CONSTRAINT email_messages_pkey PRIMARY KEY (id);
ALTER TABLE public.leads ADD CONSTRAINT leads_pkey PRIMARY KEY (id);
ALTER TABLE public.linkedin_campaign_steps ADD CONSTRAINT linkedin_campaign_steps_pkey PRIMARY KEY (id);
ALTER TABLE public.linkedin_campaigns ADD CONSTRAINT linkedin_campaigns_pkey PRIMARY KEY (id);
ALTER TABLE public.linkedin_messages ADD CONSTRAINT linkedin_messages_pkey PRIMARY KEY (id);
ALTER TABLE public.meetings ADD CONSTRAINT meetings_pkey PRIMARY KEY (id);
ALTER TABLE public.sequence_steps ADD CONSTRAINT sequence_steps_pkey PRIMARY KEY (id);
ALTER TABLE public.sequences ADD CONSTRAINT sequences_pkey PRIMARY KEY (id);
ALTER TABLE public.tasks ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);
ALTER TABLE public.user_lists ADD CONSTRAINT user_lists_pkey PRIMARY KEY (id);
ALTER TABLE public.users ADD CONSTRAINT users_pkey PRIMARY KEY (id);

-- ============================================
-- FOREIGN KEYS
-- ============================================

ALTER TABLE public.sequence_steps ADD CONSTRAINT sequence_steps_sequence_id_fkey 
  FOREIGN KEY (sequence_id) REFERENCES public.sequences(id) ON DELETE CASCADE;

ALTER TABLE public.linkedin_campaign_steps ADD CONSTRAINT linkedin_campaign_steps_campaign_id_fkey 
  FOREIGN KEY (campaign_id) REFERENCES public.linkedin_campaigns(id) ON DELETE CASCADE;

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on tables
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.linkedin_campaign_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.linkedin_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.linkedin_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sequence_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow all for authenticated users" ON public.companies
  FOR ALL
  TO public
  USING ((auth.role() = 'authenticated'::text));

CREATE POLICY "Allow all for authenticated users" ON public.content_posts
  FOR ALL
  TO public
  USING ((auth.role() = 'authenticated'::text));

CREATE POLICY "Allow all for authenticated users" ON public.deals
  FOR ALL
  TO public
  USING ((auth.role() = 'authenticated'::text));

CREATE POLICY "Allow all for authenticated users" ON public.email_messages
  FOR ALL
  TO public
  USING ((auth.role() = 'authenticated'::text));

CREATE POLICY "Allow all for authenticated users" ON public.leads
  FOR ALL
  TO public
  USING ((auth.role() = 'authenticated'::text));

CREATE POLICY "Allow all for authenticated users" ON public.linkedin_campaign_steps
  FOR ALL
  TO public
  USING ((auth.role() = 'authenticated'::text));

CREATE POLICY "Allow all for authenticated users" ON public.linkedin_campaigns
  FOR ALL
  TO public
  USING ((auth.role() = 'authenticated'::text));

CREATE POLICY "Allow all for authenticated users" ON public.linkedin_messages
  FOR ALL
  TO public
  USING ((auth.role() = 'authenticated'::text));

CREATE POLICY "Allow all for authenticated users" ON public.meetings
  FOR ALL
  TO public
  USING ((auth.role() = 'authenticated'::text));

CREATE POLICY "Allow all for authenticated users" ON public.sequence_steps
  FOR ALL
  TO public
  USING ((auth.role() = 'authenticated'::text));

CREATE POLICY "Allow all for authenticated users" ON public.sequences
  FOR ALL
  TO public
  USING ((auth.role() = 'authenticated'::text));

CREATE POLICY "Allow all for authenticated users" ON public.tasks
  FOR ALL
  TO public
  USING ((auth.role() = 'authenticated'::text));

CREATE POLICY "Allow all for authenticated users" ON public.user_lists
  FOR ALL
  TO public
  USING ((auth.role() = 'authenticated'::text));

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE
  TO authenticated
  USING ((auth.uid() = auth_id))
  WITH CHECK ((auth.uid() = auth_id));

CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT
  TO authenticated
  USING ((auth.uid() = auth_id));

-- ============================================
-- SETUP COMPLETE
-- ============================================
-- Your database schema has been created successfully!
-- Note: Supabase Auth is automatically configured in new projects.