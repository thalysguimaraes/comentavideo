export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

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
      video_thumbnails: {
        Row: {
          id: string
          video_id: string
          timestamp: number
          url: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          video_id: string
          timestamp: number
          url: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          video_id?: string
          timestamp?: number
          url?: string
          created_at?: string
          updated_at?: string
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
      get_nearest_thumbnail: {
        Args: {
          video_id: string
          target_timestamp: number
        }
        Returns: string | null
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Video = Database['public']['Tables']['videos']['Row']
export type Comment = Database['public']['Tables']['comments']['Row']
export type UserProfile = Database['public']['Tables']['user_profiles']['Row']
export type VideoThumbnail = Database['public']['Tables']['video_thumbnails']['Row'] 