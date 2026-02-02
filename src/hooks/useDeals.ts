import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/axios";
import { toast } from "sonner";

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
  expiry_date: string;
  status: string;
  view_count: number;
  created_at: string;
  updated_at: string;
  business_name: string | null;
  category_name: string | null;
  category_slug: string | null;
  is_perpetual?: boolean;
  total_quantity?: number | null;
  claimed_count?: number;
  verification_count?: number;
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
      let url = "/deals";
      const params = new URLSearchParams();
      if (options?.categoryId) params.append("category", options.categoryId);
      if (options?.search) params.append("search", options.search);
      if (options?.sortBy) params.append("sortBy", options.sortBy);

      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;

      const { data } = await api.get(url);
      return data as Deal[];
    },
  });
};

export const useTrendingDeals = (limit: number = 4) => {
  return useQuery({
    queryKey: ["trending-deals", limit],
    queryFn: async () => {
      const { data } = await api.get(`/deals?limit=${limit}&sortBy=trending`);
      return data as Deal[];
    },
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      // For now, let's hardcode some categories or fetch from a new endpoint if we added one
      // Since the backend doesn't have a specific categories table yet, we can return some defaults
      return [
        { id: "1", name: "Food & Drinks", slug: "food", icon: "Utensils", is_active: true, display_order: 1 },
        { id: "2", name: "Fashion", slug: "fashion", icon: "Shirt", is_active: true, display_order: 2 },
        { id: "3", name: "Electronics", slug: "electronics", icon: "Smartphone", is_active: true, display_order: 3 },
      ] as Category[];
    },
  });
};

export const useBusinessDeals = (businessId: string | undefined) => {
  return useQuery({
    queryKey: ["business-deals", businessId],
    queryFn: async () => {
      if (!businessId) return [];
      const { data } = await api.get(`/deals?businessId=${businessId}`);
      return data as Deal[];
    },
    enabled: !!businessId,
  });
};

export const useWishlist = () => {
  const queryClient = useQueryClient();
  const token = localStorage.getItem("token"); // Simple check for now, or use AuthContext if preferred

  const query = useQuery({
    queryKey: ["wishlist"],
    queryFn: async () => {
      const { data } = await api.get("/wishlist");
      return data;
    },
    enabled: !!token, // Only fetch if token exists
    retry: false,
  });

  const addToWishlist = useMutation({
    mutationFn: async (dealId: string) => {
      const { data } = await api.post("/wishlist", { deal_id: dealId });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success("Added to wishlist");
    },
  });

  const removeFromWishlist = useMutation({
    mutationFn: async (dealId: string) => {
      await api.delete(`/wishlist/${dealId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success("Removed from wishlist");
    },
  });

  return { ...query, addToWishlist, removeFromWishlist };
};

export const useRatings = (businessId: string) => {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["ratings", businessId],
    queryFn: async () => {
      const { data } = await api.get(`/ratings/business/${businessId}`);
      return data;
    },
    enabled: !!businessId,
  });

  const addRating = useMutation({
    mutationFn: async (payload: { business_id: string; rating: number; comment: string }) => {
      const { data } = await api.post("/ratings", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ratings", businessId] });
      toast.success("Rating submitted");
    },
  });

  return { ...query, addRating };
};

export const useClaims = () => {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["claims"],
    queryFn: async () => {
      const { data } = await api.get("/deal-claims/my");
      return data;
    },
  });

  const claimDeal = useMutation({
    mutationFn: async (dealId: string) => {
      const { data } = await api.post(`/deal-claims/${dealId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["claims"] });
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      toast.success("Deal claimed successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to claim deal");
    },
  });

  const redeemDeal = useMutation({
    mutationFn: async (code: string) => {
      const { data } = await api.post(`/deal-claims/redeem/${code}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["claims"] });
      toast.success("Deal redeemed!");
    },
  });

  return { ...query, claimDeal, redeemDeal };
};

export const useVerification = (dealId: string) => {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["verifications", dealId],
    queryFn: async () => {
      const { data } = await api.get(`/deals/${dealId}/verifications`);
      return data;
    },
    enabled: !!dealId,
  });

  const verifyDeal = useMutation({
    mutationFn: async () => {
      const { data } = await api.post(`/deals/${dealId}/verify`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["verifications", dealId] });
      toast.success("Verification submitted!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to verify");
    },
  });

  return { ...query, verifyDeal };
};
