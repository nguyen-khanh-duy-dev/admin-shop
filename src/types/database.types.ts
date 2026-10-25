/**
 * Type sinh từ database Supabase.
 *
 * KHÔNG sửa tay. Sinh lại sau mỗi lần đổi schema:
 *   npm run gen:types
 * (tương đương: supabase gen types typescript --project-id <ref> --schema public)
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          role: Database['public']['Enums']['user_role'];
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: Database['public']['Enums']['user_role'];
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: Database['public']['Enums']['user_role'];
          created_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: { id: number; name: string; slug: string; created_at: string };
        Insert: { id?: never; name: string; slug: string; created_at?: string };
        Update: { id?: never; name?: string; slug?: string; created_at?: string };
        Relationships: [];
      };
      products: {
        Row: {
          id: number;
          category_id: number | null;
          name: string;
          sku: string;
          description: string | null;
          price: number;
          stock: number;
          status: Database['public']['Enums']['product_status'];
          image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: never;
          category_id?: number | null;
          name: string;
          sku: string;
          description?: string | null;
          price: number;
          stock?: number;
          status?: Database['public']['Enums']['product_status'];
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: never;
          category_id?: number | null;
          name?: string;
          sku?: string;
          description?: string | null;
          price?: number;
          stock?: number;
          status?: Database['public']['Enums']['product_status'];
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'products_category_id_fkey';
            columns: ['category_id'];
            isOneToOne: false;
            referencedRelation: 'categories';
            referencedColumns: ['id'];
          },
        ];
      };
      customers: {
        Row: {
          id: number;
          full_name: string;
          email: string | null;
          phone: string | null;
          address: string | null;
          city: string | null;
          created_at: string;
        };
        Insert: {
          id?: never;
          full_name: string;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          city?: string | null;
          created_at?: string;
        };
        Update: {
          id?: never;
          full_name?: string;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          city?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      orders: {
        Row: {
          id: number;
          code: string;
          customer_id: number;
          status: Database['public']['Enums']['order_status'];
          total: number;
          note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: never;
          code: string;
          customer_id: number;
          status?: Database['public']['Enums']['order_status'];
          total?: number;
          note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: never;
          code?: string;
          customer_id?: number;
          status?: Database['public']['Enums']['order_status'];
          total?: number;
          note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'orders_customer_id_fkey';
            columns: ['customer_id'];
            isOneToOne: false;
            referencedRelation: 'customers';
            referencedColumns: ['id'];
          },
        ];
      };
      order_items: {
        Row: {
          id: number;
          order_id: number;
          product_id: number | null;
          product_name: string;
          quantity: number;
          unit_price: number;
        };
        Insert: {
          id?: never;
          order_id: number;
          product_id?: number | null;
          product_name: string;
          quantity: number;
          unit_price: number;
        };
        Update: {
          id?: never;
          order_id?: number;
          product_id?: number | null;
          product_name?: string;
          quantity?: number;
          unit_price?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'order_items_order_id_fkey';
            columns: ['order_id'];
            isOneToOne: false;
            referencedRelation: 'orders';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'order_items_product_id_fkey';
            columns: ['product_id'];
            isOneToOne: false;
            referencedRelation: 'products';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: Record<never, never>;
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Enums: {
      user_role: 'admin' | 'staff';
      product_status: 'active' | 'draft' | 'archived';
      order_status: 'pending' | 'shipping' | 'completed' | 'cancelled';
    };
    CompositeTypes: Record<never, never>;
  };
};

type PublicSchema = Database['public'];

export type Tables<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Row'];
export type TablesInsert<T extends keyof PublicSchema['Tables']> =
  PublicSchema['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof PublicSchema['Tables']> =
  PublicSchema['Tables'][T]['Update'];
export type Enums<T extends keyof PublicSchema['Enums']> = PublicSchema['Enums'][T];
