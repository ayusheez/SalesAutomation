// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type definitions for database tables
export type Database = {
  public: {
    Tables: {
      leads: {
        Row: {
          id: string;
          name: string;
          email: string | null;
          phone: string | null;
          company: string | null;
          title: string | null;
          status: string | null;
          score: number | null;
          source: string | null;
          tags: string[] | null;
          notes: string | null;
          is_contact_revealed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["leads"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<Database["public"]["Tables"]["leads"]["Insert"]>;
      };
      companies: {
        Row: {
          id: string;
          name: string;
          domain: string | null;
          industry: string | null;
          size: string | null;
          location: string | null;
          description: string | null;
          founded: number | null;
          revenue: string | null;
          tags: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["companies"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<Database["public"]["Tables"]["companies"]["Insert"]>;
      };
      deals: {
        Row: {
          id: string;
          title: string;
          company_id: string | null;
          value: number | null;
          stage: string;
          probability: number | null;
          close_date: string | null;
          owner: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["deals"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<Database["public"]["Tables"]["deals"]["Insert"]>;
      };
      // Add other table types as needed
    };
  };
};
