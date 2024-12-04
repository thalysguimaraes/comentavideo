export interface Database {
  public: {
    Tables: {
      videos: {
        Row: {
          id: string
          created_at: string
          title: string | null
          description: string | null
          url: string
          status: 'draft' | 'published'
          user_id: string
        }
        Insert: Omit<Video, 'id' | 'created_at'>
        Update: Partial<Omit<Video, 'id' | 'created_at'>>
      }
      // ... outras tabelas
    }
  }
}

export type Video = Database['public']['Tables']['videos']['Row'] 