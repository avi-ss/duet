export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type ItemType = 'wishlist' | 'note' | 'link'
export type MemberRole = 'owner' | 'member'

export type Database = {
  public: {
    Tables: {
      couples: {
        Row: {
          created_at: string
          id: string
          invite_code: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          invite_code?: string
          name: string
        }
        Update: {
          name?: string
        }
        Relationships: []
      }
      couple_members: {
        Row: {
          couple_id: string
          joined_at: string
          role: MemberRole
          user_id: string
        }
        Insert: {
          couple_id: string
          joined_at?: string
          role?: MemberRole
          user_id: string
        }
        Update: {
          role?: MemberRole
        }
        Relationships: [
          {
            foreignKeyName: 'couple_members_couple_id_fkey'
            columns: ['couple_id']
            isOneToOne: false
            referencedRelation: 'couples'
            referencedColumns: ['id']
          },
        ]
      }
      items: {
        Row: {
          couple_id: string
          created_at: string
          created_by: string
          description: string | null
          id: string
          image_url: string | null
          is_pinned: boolean
          metadata: Json
          title: string
          type: ItemType
          updated_at: string
          url: string | null
        }
        Insert: {
          couple_id: string
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_pinned?: boolean
          metadata?: Json
          title: string
          type: ItemType
          updated_at?: string
          url?: string | null
        }
        Update: {
          description?: string | null
          image_url?: string | null
          is_pinned?: boolean
          metadata?: Json
          title?: string
          type?: ItemType
          updated_at?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'items_couple_id_fkey'
            columns: ['couple_id']
            isOneToOne: false
            referencedRelation: 'couples'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: Record<string, never>
    Functions: {
      create_couple: {
        Args: { couple_name: string }
        Returns: string
      }
      join_couple: {
        Args: { code: string }
        Returns: string
      }
    }
    Enums: {
      item_type: ItemType
      member_role: MemberRole
    }
    CompositeTypes: Record<string, never>
  }
}

export type Couple = Database['public']['Tables']['couples']['Row']
export type CoupleMember =
  Database['public']['Tables']['couple_members']['Row']
export type Item = Database['public']['Tables']['items']['Row']
export type ItemInsert = Database['public']['Tables']['items']['Insert']
export type ItemUpdate = Database['public']['Tables']['items']['Update']
