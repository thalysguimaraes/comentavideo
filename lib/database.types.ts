export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Video = Database['public']['Tables']['videos']['Row']
export type Comment = Database['public']['Tables']['comments']['Row']
export type UserProfile = Database['public']['Tables']['user_profiles']['Row']

export interface Database {
  public: {
    Tables: {
      videos: {
        Row: {
          id: string
          created_at: string
          title: string
          description: string | null
          url: string
          thumbnail_url: string | null
          processing_status: 'pending' | 'processing' | 'completed' | 'failed'
          user_id: string
          status: 'draft' | 'published'
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          description?: string | null
          url: string
          thumbnail_url?: string | null
          user_id: string
          status?: 'draft' | 'published'
          processing_status?: 'pending' | 'processing' | 'completed' | 'failed'
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          description?: string | null
          url?: string
          thumbnail_url?: string | null
          user_id?: string
          status?: 'draft' | 'published'
          processing_status?: 'pending' | 'processing' | 'completed' | 'failed'
        }
      }
      comments: {
        Row: {
          id: string
          video_id: string
          content: string
          timestamp: number
          author_name: string
          created_at: string
        }
        Insert: {
          id?: string
          video_id: string
          content: string
          timestamp: number
          author_name: string
          created_at?: string
        }
        Update: {
          id?: string
          video_id?: string
          content?: string
          timestamp?: number
          author_name?: string
          created_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          username: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          username?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          username?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      set_claim: {
        Args: {
          claim: string
          value: string
        }
        Returns: void
      }
      update_user_profile_updated_at: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
} 