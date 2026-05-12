// Hand-typed mirror of the schema declared in supabase/migrations/0001_init.sql.
// Shape matches what `supabase gen types typescript` produces so that the
// SupabaseClient generic constraints in @supabase/supabase-js v2.45+ are
// satisfied (otherwise Schema falls through to `never` and every .from() call
// returns `never`-typed data).
//
// Regenerate from the live project once the migration is applied:
//   supabase gen types typescript --project-id <project-id> > src/lib/supabase/types.ts
// (Install the CLI via Homebrew first — never via npx, since interrupted npx
// installs can pipe the install prompt into this file.)

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '12';
  };
  public: {
    Tables: {
      modules: {
        Row: {
          id: string;
          slug: string;
          position: number;
          is_bonus: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          position: number;
          is_bonus?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          position?: number;
          is_bonus?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      lessons: {
        Row: {
          id: string;
          module_id: string;
          slug: string;
          position: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          module_id: string;
          slug: string;
          position: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          module_id?: string;
          slug?: string;
          position?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'lessons_module_id_fkey';
            columns: ['module_id'];
            isOneToOne: false;
            referencedRelation: 'modules';
            referencedColumns: ['id'];
          },
        ];
      };
      lesson_progress: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: string;
          started_at: string;
          completed_at: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          lesson_id: string;
          started_at?: string;
          completed_at?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          lesson_id?: string;
          started_at?: string;
          completed_at?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'lesson_progress_lesson_id_fkey';
            columns: ['lesson_id'];
            isOneToOne: false;
            referencedRelation: 'lessons';
            referencedColumns: ['id'];
          },
        ];
      };
      marketing_assessment_submissions: {
        Row: {
          id: string;
          user_id: string;
          business_goal: string;
          prompt_v1: string;
          ai_output: string;
          prompt_v2: string;
          what_changed: string;
          why_changed: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          business_goal: string;
          prompt_v1: string;
          ai_output: string;
          prompt_v2: string;
          what_changed: string;
          why_changed: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          business_goal?: string;
          prompt_v1?: string;
          ai_output?: string;
          prompt_v2?: string;
          what_changed?: string;
          why_changed?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
