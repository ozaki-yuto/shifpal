import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: 'admin' | 'staff';
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          role: 'admin' | 'staff';
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          role?: 'admin' | 'staff';
          created_at?: string;
        };
      };
      shift_requirements: {
        Row: {
          id: string;
          day_of_week: string;
          time_slot: string;
          required_staff: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          day_of_week: string;
          time_slot: string;
          required_staff: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          day_of_week?: string;
          time_slot?: string;
          required_staff?: number;
          created_at?: string;
        };
      };
      shift_preferences: {
        Row: {
          id: string;
          staff_id: string;
          day_of_week: string;
          time_slot: string;
          weekday_desired_hours: number;
          weekend_desired_hours: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          staff_id: string;
          day_of_week: string;
          time_slot: string;
          weekday_desired_hours: number;
          weekend_desired_hours: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          staff_id?: string;
          day_of_week?: string;
          time_slot?: string;
          weekday_desired_hours?: number;
          weekend_desired_hours?: number;
          created_at?: string;
        };
      };
      shift_assignments: {
        Row: {
          id: string;
          staff_id: string;
          date: string;
          day_of_week: string;
          time_slot: string;
          status: 'confirmed' | 'absent' | 'exchange-requested';
          created_at: string;
        };
        Insert: {
          id?: string;
          staff_id: string;
          date: string;
          day_of_week: string;
          time_slot: string;
          status?: 'confirmed' | 'absent' | 'exchange-requested';
          created_at?: string;
        };
        Update: {
          id?: string;
          staff_id?: string;
          date?: string;
          day_of_week?: string;
          time_slot?: string;
          status?: 'confirmed' | 'absent' | 'exchange-requested';
          created_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          from_user: string;
          to_user: string;
          title: string;
          content: string;
          type: 'announcement' | 'absence' | 'exchange';
          created_at: string;
        };
        Insert: {
          id?: string;
          from_user: string;
          to_user: string;
          title: string;
          content: string;
          type: 'announcement' | 'absence' | 'exchange';
          created_at?: string;
        };
        Update: {
          id?: string;
          from_user?: string;
          to_user?: string;
          title?: string;
          content?: string;
          type?: 'announcement' | 'absence' | 'exchange';
          created_at?: string;
        };
      };
    };
  };
}