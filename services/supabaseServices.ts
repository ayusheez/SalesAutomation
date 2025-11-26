// services/supabaseServices.ts
import { supabase } from "../lib/supabase";
import {
  Company,
  Deal,
  Lead,
  Sequence,
  SequenceStep,
  Meeting,
  LinkedInCampaign,
  LinkedInMessage,
  Task,
  UserList,
  EmailMessage,
  ContentPost,
} from "../types";

// Lead Service
export const leadService = {
  getAll: async (): Promise<Lead[]> => {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  add: async (lead: Omit<Lead, "id">): Promise<Lead> => {
    const { data, error } = await supabase
      .from("leads")
      .insert([lead])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  update: async (lead: Lead): Promise<Lead> => {
    const { data, error } = await supabase
      .from("leads")
      .update(lead)
      .eq("id", lead.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase.from("leads").delete().eq("id", id);

    if (error) throw error;
  },
};

// Company Service
export const companyService = {
  getAll: async (): Promise<Company[]> => {
    const { data, error } = await supabase
      .from("companies")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  add: async (company: Omit<Company, "id">): Promise<Company> => {
    const { data, error } = await supabase
      .from("companies")
      .insert([company])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  update: async (company: Company): Promise<Company> => {
    const { data, error } = await supabase
      .from("companies")
      .update(company)
      .eq("id", company.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase.from("companies").delete().eq("id", id);

    if (error) throw error;
  },
};

// Deal Service
export const dealService = {
  getAll: async (): Promise<Deal[]> => {
    const { data, error } = await supabase
      .from("deals")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  updateStage: async (dealId: string, stage: Deal["stage"]): Promise<void> => {
    const { error } = await supabase
      .from("deals")
      .update({ stage })
      .eq("id", dealId);

    if (error) throw error;
  },

  add: async (deal: Omit<Deal, "id">): Promise<Deal> => {
    const { data, error } = await supabase
      .from("deals")
      .insert([deal])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  update: async (deal: Deal): Promise<Deal> => {
    const { data, error } = await supabase
      .from("deals")
      .update(deal)
      .eq("id", deal.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase.from("deals").delete().eq("id", id);

    if (error) throw error;
  },
};

// Sequence Service
export const sequenceService = {
  getAll: async (): Promise<Sequence[]> => {
    const { data, error } = await supabase
      .from("sequences")
      .select(
        `
        *,
        steps:sequence_steps(*)
      `
      )
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  toggleActive: async (id: string): Promise<void> => {
    const { data: sequence } = await supabase
      .from("sequences")
      .select("active")
      .eq("id", id)
      .single();

    const { error } = await supabase
      .from("sequences")
      .update({ active: !sequence?.active })
      .eq("id", id);

    if (error) throw error;
  },

  addStep: async (sequenceId: string, step: SequenceStep): Promise<void> => {
    const { error } = await supabase
      .from("sequence_steps")
      .insert([{ ...step, sequence_id: sequenceId }]);

    if (error) throw error;
  },

  add: async (sequence: Omit<Sequence, "id">): Promise<Sequence> => {
    const { steps, ...sequenceData } = sequence;

    const { data, error } = await supabase
      .from("sequences")
      .insert([sequenceData])
      .select()
      .single();

    if (error) throw error;

    if (steps && steps.length > 0) {
      const stepsWithSeqId = steps.map((step) => ({
        ...step,
        sequence_id: data.id,
      }));

      await supabase.from("sequence_steps").insert(stepsWithSeqId);
    }

    return { ...data, steps: steps || [] };
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase.from("sequences").delete().eq("id", id);

    if (error) throw error;
  },
};

// Meeting Service
export const meetingService = {
  getAll: async (): Promise<Meeting[]> => {
    const { data, error } = await supabase
      .from("meetings")
      .select("*")
      .order("date", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  add: async (meeting: Omit<Meeting, "id">): Promise<Meeting> => {
    const { data, error } = await supabase
      .from("meetings")
      .insert([meeting])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  update: async (meeting: Meeting): Promise<Meeting> => {
    const { data, error } = await supabase
      .from("meetings")
      .update(meeting)
      .eq("id", meeting.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase.from("meetings").delete().eq("id", id);

    if (error) throw error;
  },
};

// Task Service
export const taskService = {
  getAll: async (): Promise<Task[]> => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("due_date", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  toggleComplete: async (id: string): Promise<void> => {
    const { data: task } = await supabase
      .from("tasks")
      .select("completed")
      .eq("id", id)
      .single();

    const { error } = await supabase
      .from("tasks")
      .update({ completed: !task?.completed })
      .eq("id", id);

    if (error) throw error;
  },

  add: async (task: Omit<Task, "id">): Promise<Task> => {
    const { data, error } = await supabase
      .from("tasks")
      .insert([task])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase.from("tasks").delete().eq("id", id);

    if (error) throw error;
  },
};

// LinkedIn Service
export const linkedinService = {
  getAllCampaigns: async (): Promise<LinkedInCampaign[]> => {
    const { data, error } = await supabase
      .from("linkedin_campaigns")
      .select(
        `
        *,
        steps:linkedin_campaign_steps(*)
      `
      )
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  getMessages: async (): Promise<LinkedInMessage[]> => {
    const { data, error } = await supabase
      .from("linkedin_messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  addCampaign: async (
    campaign: Omit<LinkedInCampaign, "id">
  ): Promise<LinkedInCampaign> => {
    const { steps, ...campaignData } = campaign;

    const { data, error } = await supabase
      .from("linkedin_campaigns")
      .insert([campaignData])
      .select()
      .single();

    if (error) throw error;

    if (steps && steps.length > 0) {
      const stepsWithCampaignId = steps.map((step) => ({
        ...step,
        campaign_id: data.id,
      }));

      await supabase
        .from("linkedin_campaign_steps")
        .insert(stepsWithCampaignId);
    }

    return { ...data, steps: steps || [] };
  },

  toggleStatus: async (id: string): Promise<LinkedInCampaign> => {
    const { data: campaign } = await supabase
      .from("linkedin_campaigns")
      .select("status")
      .eq("id", id)
      .single();

    const newStatus = campaign?.status === "active" ? "paused" : "active";

    const { data, error } = await supabase
      .from("linkedin_campaigns")
      .update({ status: newStatus })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  updateSteps: async (
    campaignId: string,
    steps: SequenceStep[]
  ): Promise<void> => {
    // Delete existing steps
    await supabase
      .from("linkedin_campaign_steps")
      .delete()
      .eq("campaign_id", campaignId);

    // Insert new steps
    const stepsWithCampaignId = steps.map((step) => ({
      ...step,
      campaign_id: campaignId,
    }));

    const { error } = await supabase
      .from("linkedin_campaign_steps")
      .insert(stepsWithCampaignId);

    if (error) throw error;
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from("linkedin_campaigns")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },
};

// List Service
export const listService = {
  getAll: async (): Promise<UserList[]> => {
    const { data, error } = await supabase
      .from("user_lists")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  add: async (list: Omit<UserList, "id">): Promise<UserList> => {
    const { data, error } = await supabase
      .from("user_lists")
      .insert([list])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase.from("user_lists").delete().eq("id", id);

    if (error) throw error;
  },
};

// Inbox Service
export const inboxService = {
  getAll: async (): Promise<EmailMessage[]> => {
    const { data, error } = await supabase
      .from("email_messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  add: async (email: Omit<EmailMessage, "id">): Promise<EmailMessage> => {
    const { data, error } = await supabase
      .from("email_messages")
      .insert([email])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from("email_messages")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },
};

// Content Service
export const contentService = {
  getAllPosts: async (): Promise<ContentPost[]> => {
    const { data, error } = await supabase
      .from("content_posts")
      .select("*")
      .order("day", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  addPost: async (post: Omit<ContentPost, "id">): Promise<ContentPost> => {
    const { data, error } = await supabase
      .from("content_posts")
      .insert([post])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  deletePost: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from("content_posts")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },
};
