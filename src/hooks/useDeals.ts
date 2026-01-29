import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Deal {
  id: string;
  business_id: string;
  category_id: string | null;
  title: string;
  description: string;
  discount_type: string;
  discount_value: string;
  image_url: string | null;
  terms_conditions: string | null;
  start_date: string;
  end_date: string;
  status: string;
  view_count: number;
  created_at: string;
  updated_at: string;
  business_name: string | null;
  category_name: string | null;
  category_slug: string | null;
  is_perpetual?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  is_active: boolean;
  display_order: number;
}

export const useDeals = (options?: {
  search?: string;
  categoryId?: string;
  sortBy?: string;
  status?: string;
}) => {
  return useQuery({
    queryKey: ["deals", options],
    queryFn: async () => {
      let query = supabase
        .from("deals_with_details")
        .select("*");

      // Filter by status (default to active)
      if (options?.status) {
        query = query.eq("status", options.status);
      } else {
        query = query.eq("status", "active");
      }

      // Filter by category
      if (options?.categoryId) {
        query = query.eq("category_id", options.categoryId);
      }

      // Search by title or description
      if (options?.search) {
        query = query.or(`title.ilike.%${options.search}%,description.ilike.%${options.search}%`);
      }

      // Apply sorting
      switch (options?.sortBy) {
        case "newest":
          query = query.order("created_at", { ascending: false });
          break;
        case "ending-soon":
          query = query.order("end_date", { ascending: true });
          break;
        case "discount":
          query = query.order("discount_value", { ascending: false });
          break;
        default: // trending
          query = query.order("view_count", { ascending: false });
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as Deal[];
    },
  });
};

export const useTrendingDeals = (limit: number = 4) => {
  return useQuery({
    queryKey: ["trending-deals", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deals_with_details")
        .select("*")
        .eq("status", "active")
        .order("view_count", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as Deal[];
    },
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .order("display_order");

      if (error) throw error;
      return data as Category[];
    },
  });
};

export const useBusinessDeals = (businessId: string | undefined) => {
  return useQuery({
    queryKey: ["business-deals", businessId],
    queryFn: async () => {
      if (!businessId) return [];
      
      const { data, error } = await supabase
        .from("deals_with_details")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Deal[];
    },
    enabled: !!businessId,
  });
};
