export type Json =
  | string
  | number
  | boolean
  | null
  | {[key: string]: Json | undefined}
  | Json[];

export interface Database {
  public: {
    Tables: {
      comment_reports: {
        Row: {
          comment_id: string;
          id: string;
          reporter_id: string;
        };
        Insert: {
          comment_id: string;
          id?: string;
          reporter_id?: string;
        };
        Update: {
          comment_id?: string;
          id?: string;
          reporter_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "comment_reports_comment_id_fkey";
            columns: ["comment_id"];
            referencedRelation: "comments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comment_reports_comment_id_fkey";
            columns: ["comment_id"];
            referencedRelation: "public_comments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comment_reports_comment_id_fkey";
            columns: ["comment_id"];
            referencedRelation: "cached_comments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comment_reports_reporter_id_fkey";
            columns: ["reporter_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      comment_votes: {
        Row: {
          comment_id: string;
          id: string;
          upvote: boolean;
          voter_id: string;
        };
        Insert: {
          comment_id: string;
          id?: string;
          upvote: boolean;
          voter_id?: string;
        };
        Update: {
          comment_id?: string;
          id?: string;
          upvote?: boolean;
          voter_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "comment_votes_comment_id_fkey";
            columns: ["comment_id"];
            referencedRelation: "comments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comment_votes_comment_id_fkey";
            columns: ["comment_id"];
            referencedRelation: "public_comments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comment_votes_comment_id_fkey";
            columns: ["comment_id"];
            referencedRelation: "cached_comments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comment_votes_voter_id_fkey";
            columns: ["voter_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      comments: {
        Row: {
          commenter_id: string | null;
          content: string;
          created_at: string;
          downvotes: number;
          id: string;
          parent_id: string | null;
          post_id: string;
          private_anonymous: boolean;
          private_commenter_id: string;
          upvotes: number;
        };
        Insert: {
          commenter_id?: string | null;
          content: string;
          created_at?: string;
          downvotes?: number;
          id?: string;
          parent_id?: string | null;
          post_id: string;
          private_anonymous?: boolean;
          private_commenter_id?: string;
          upvotes?: number;
        };
        Update: {
          commenter_id?: string | null;
          content?: string;
          created_at?: string;
          downvotes?: number;
          id?: string;
          parent_id?: string | null;
          post_id?: string;
          private_anonymous?: boolean;
          private_commenter_id?: string;
          upvotes?: number;
        };
        Relationships: [
          {
            foreignKeyName: "comments_parent_id_fkey";
            columns: ["parent_id"];
            referencedRelation: "comments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comments_parent_id_fkey";
            columns: ["parent_id"];
            referencedRelation: "public_comments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comments_parent_id_fkey";
            columns: ["parent_id"];
            referencedRelation: "cached_comments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comments_post_id_fkey";
            columns: ["post_id"];
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comments_post_id_fkey";
            columns: ["post_id"];
            referencedRelation: "public_posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comments_post_id_fkey";
            columns: ["post_id"];
            referencedRelation: "cached_posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comments_private_commenter_id_fkey";
            columns: ["private_commenter_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      locations: {
        Row: {
          created_at: string;
          id: string;
          location: unknown;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          location: unknown;
          user_id?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          location?: unknown;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "locations_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      post_reports: {
        Row: {
          id: string;
          post_id: string;
          reporter_id: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          reporter_id?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          reporter_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "post_reports_post_id_fkey";
            columns: ["post_id"];
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "post_reports_post_id_fkey";
            columns: ["post_id"];
            referencedRelation: "public_posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "post_reports_post_id_fkey";
            columns: ["post_id"];
            referencedRelation: "cached_posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "post_reports_reporter_id_fkey";
            columns: ["reporter_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      post_votes: {
        Row: {
          id: string;
          post_id: string;
          upvote: boolean;
          voter_id: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          upvote: boolean;
          voter_id?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          upvote?: boolean;
          voter_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "post_votes_post_id_fkey";
            columns: ["post_id"];
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "post_votes_post_id_fkey";
            columns: ["post_id"];
            referencedRelation: "public_posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "post_votes_post_id_fkey";
            columns: ["post_id"];
            referencedRelation: "cached_posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "post_votes_voter_id_fkey";
            columns: ["voter_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      posts: {
        Row: {
          content: string;
          created_at: string;
          downvotes: number;
          has_media: boolean;
          id: string;
          poster_id: string | null;
          private_anonymous: boolean;
          private_location: unknown;
          private_poster_id: string;
          radius: number;
          upvotes: number;
        };
        Insert: {
          content: string;
          created_at?: string;
          downvotes?: number;
          has_media?: boolean;
          id?: string;
          poster_id?: string | null;
          private_anonymous?: boolean;
          private_location?: unknown;
          private_poster_id?: string;
          radius: number;
          upvotes?: number;
        };
        Update: {
          content?: string;
          created_at?: string;
          downvotes?: number;
          has_media?: boolean;
          id?: string;
          poster_id?: string | null;
          private_anonymous?: boolean;
          private_location?: unknown;
          private_poster_id?: string;
          radius?: number;
          upvotes?: number;
        };
        Relationships: [
          {
            foreignKeyName: "posts_private_poster_id_fkey";
            columns: ["private_poster_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          color: string;
          emoji: string;
          id: string;
        };
        Insert: {
          color?: string;
          emoji?: string;
          id: string;
        };
        Update: {
          color?: string;
          emoji?: string;
          id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      public_comments: {
        Row: {
          commenter_id: string | null;
          content: string | null;
          created_at: string | null;
          downvotes: number | null;
          id: string | null;
          upvotes: number | null;
        };
        Relationships: [];
      };
      public_posts: {
        Row: {
          content: string | null;
          created_at: string | null;
          distance: number | null;
          downvotes: number | null;
          has_media: boolean | null;
          id: string | null;
          poster_id: string | null;
          upvotes: number | null;
        };
        Relationships: [];
      };
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
}
