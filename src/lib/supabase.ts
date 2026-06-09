import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string | null;
          email: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name?: string | null;
          email: string;
          created_at?: string;
        };
        Update: {
          name?: string | null;
          email?: string;
        };
      };
      youtube_videos: {
        Row: {
          id: string;
          url: string;
          title: string | null;
          transcript: string | null;
          summary: string | null;
          key_points: string[] | null;
          loan_strategies: string[] | null;
          warnings: string[] | null;
          created_at: string;
        };
        Insert: {
          url: string;
          title?: string | null;
          transcript?: string | null;
          summary?: string | null;
          key_points?: string[] | null;
          loan_strategies?: string[] | null;
          warnings?: string[] | null;
        };
        Update: {
          title?: string | null;
          transcript?: string | null;
          summary?: string | null;
        };
      };
      loan_profiles: {
        Row: {
          id: string;
          user_id: string | null;
          income: number;
          credit_score: number;
          existing_loan: number;
          profile_data: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          user_id?: string | null;
          income: number;
          credit_score: number;
          existing_loan: number;
          profile_data: Record<string, unknown>;
        };
        Update: {
          profile_data?: Record<string, unknown>;
        };
      };
      loan_reports: {
        Row: {
          id: string;
          user_id: string | null;
          result: Record<string, unknown>;
          roadmap: Record<string, unknown>[];
          created_at: string;
        };
        Insert: {
          user_id?: string | null;
          result: Record<string, unknown>;
          roadmap: Record<string, unknown>[];
        };
        Update: {
          result?: Record<string, unknown>;
        };
      };
    };
  };
};
