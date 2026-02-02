import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/axios";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface CartItem {
  id: string;
  user_id: string;
  deal_id: string;
  quantity: number;
  added_at: string;
  deal?: {
    id: string;
    title: string;
    description: string;
    discount_value: string;
    image_url: string | null;
    business_name: string | null;
    end_date: string;
    is_perpetual: boolean;
  };
}

export const useCart = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const cartQuery = useQuery({
    queryKey: ["cart", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await api.get("/cart");
      return data as CartItem[];
    },
    enabled: !!user,
  });

  const addToCart = useMutation({
    mutationFn: async (dealId: string) => {
      if (!user) throw new Error("Must be logged in to add to cart");
      const { data } = await api.post("/cart", { deal_id: dealId, quantity: 1 });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", user?.id] });
      toast.success("Added to cart");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add to cart");
    },
  });

  const removeFromCart = useMutation({
    mutationFn: async (cartItemId: string) => {
      await api.delete(`/cart/${cartItemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", user?.id] });
      toast.success("Removed from cart");
    },
  });

  const updateQuantity = useMutation({
    mutationFn: async ({ cartItemId, quantity }: { cartItemId: string; quantity: number }) => {
      await api.put(`/cart/${cartItemId}`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", user?.id] });
    },
  });

  const clearCart = useMutation({
    mutationFn: async () => {
      await api.delete("/cart/clear");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", user?.id] });
      toast.success("Cart cleared");
    },
  });

  const isInCart = (dealId: string) => {
    return cartQuery.data?.some((item) => item.deal_id === String(dealId)) ?? false;
  };

  return {
    cartItems: cartQuery.data ?? [],
    isLoading: cartQuery.isLoading,
    cartCount: cartQuery.data?.length ?? 0,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isInCart,
  };
};
