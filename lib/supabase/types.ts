import type { CatalogProductModality } from "@/lib/catalog/product-modality";

export type BusinessContactInfo = {
  id?: number;
  primary_call_phone: string;
  primary_whatsapp_phone: string;
  email: string;
  instagram_href: string;
  facebook_href: string;
  youtube_href?: string | null;
  is_active: boolean;
};

export type BusinessBranch = {
  id: number;
  slug: string;
  name: string;
  facade_image_src: string;
  street_and_number: string;
  neighborhood: string;
  city: string;
  state: string;
  postal_code: string;
  landline_phone: string;
  google_maps_href: string;
  display_order: number | null;
  is_active: boolean;
};

export type BusinessWorkMediaRow = {
  id: number;
  video_src?: string;
  image_src?: string;
  title?: string | null;
  alt_text?: string | null;
  display_order: number | null;
  is_active: boolean;
};

export type CatalogCategory = {
  id: number;
  slug: string;
  name?: string | null;
  description?: string | null;
  display_order?: number | null;
  is_active: boolean;
};

export type CatalogProduct = {
  id: number | string;
  slug?: string | null;
  name: string;
  category_id: number | string | null;
  description: string | null;
  price: number | string | null;
  measurements: string | null;
  material: string | null;
  internal_code: string;
  additional_observations: string | null;
  modality: CatalogProductModality;
  display_order: number | null;
  publication_status?: "draft" | "published" | "archived" | string;
  is_active: boolean;
};

export type CatalogProductPhoto = {
  id: number;
  product_id: number | string;
  image_src: string;
  alt_text?: string | null;
  display_order: number | null;
  is_cover?: boolean;
};

export type CatalogProductRecommendedUse = {
  id: number;
  product_id: number | string;
  use_text: string;
  display_order: number | null;
};

export type CatalogProductBranch = {
  product_id: number | string;
  branch_id: number | string;
};

export type Database = {
  public: {
    Tables: {
      business_contact_info: {
        Row: BusinessContactInfo;
        Insert: Partial<BusinessContactInfo>;
        Update: Partial<BusinessContactInfo>;
        Relationships: [];
      };
      business_branches: {
        Row: BusinessBranch;
        Insert: Partial<BusinessBranch>;
        Update: Partial<BusinessBranch>;
        Relationships: [];
      };
      business_work_process_videos: {
        Row: BusinessWorkMediaRow;
        Insert: Partial<BusinessWorkMediaRow>;
        Update: Partial<BusinessWorkMediaRow>;
        Relationships: [];
      };
      business_work_result_videos: {
        Row: BusinessWorkMediaRow;
        Insert: Partial<BusinessWorkMediaRow>;
        Update: Partial<BusinessWorkMediaRow>;
        Relationships: [];
      };
      business_work_result_images: {
        Row: BusinessWorkMediaRow;
        Insert: Partial<BusinessWorkMediaRow>;
        Update: Partial<BusinessWorkMediaRow>;
        Relationships: [];
      };
      catalog_categories: {
        Row: CatalogCategory;
        Insert: Partial<CatalogCategory>;
        Update: Partial<CatalogCategory>;
        Relationships: [];
      };
      catalog_products: {
        Row: CatalogProduct;
        Insert: Partial<CatalogProduct>;
        Update: Partial<CatalogProduct>;
        Relationships: [];
      };
      catalog_product_photos: {
        Row: CatalogProductPhoto;
        Insert: Partial<CatalogProductPhoto>;
        Update: Partial<CatalogProductPhoto>;
        Relationships: [];
      };
      catalog_product_recommended_uses: {
        Row: CatalogProductRecommendedUse;
        Insert: Partial<CatalogProductRecommendedUse>;
        Update: Partial<CatalogProductRecommendedUse>;
        Relationships: [];
      };
      catalog_product_branches: {
        Row: CatalogProductBranch;
        Insert: Partial<CatalogProductBranch>;
        Update: Partial<CatalogProductBranch>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
