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
          user_id: string
          status: 'draft' | 'published'
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          description?: string | null
          url: string
          user_id: string
          status?: 'draft' | 'published'
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          description?: string | null
          url?: string
          user_id?: string
          status?: 'draft' | 'published'
        }
      }
      comments: {
        Row: {
          id: string
          created_at: string
          content: string
          video_id: string
          timestamp: number
          author_name: string
        }
        Insert: {
          id?: string
          created_at?: string
          content: string
          video_id: string
          timestamp: number
          author_name: string
        }
        Update: {
          id?: string
          created_at?: string
          content?: string
          video_id?: string
          timestamp?: number
          author_name?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Video = Database['public']['Tables']['videos']['Row'] 