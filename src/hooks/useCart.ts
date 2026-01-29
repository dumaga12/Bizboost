import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  const cartQuery = useQuery({
    queryKey: ["cart", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data: cartItems, error } = await supabase
        .from("cart_items")
        .select("*")
        .eq("user_id", user.id)
        .order("added_at", { ascending: false });

      if (error) throw error;

      // Fetch deal details for each cart item
      if (cartItems && cartItems.length > 0) {
        const dealIds = cartItems.map((item) => item.deal_id);
        const { data: deals, error: dealsError } = await supabase
          .from("deals_with_details")
          .select("id, title, description, discount_value, image_url, business_name, end_date, is_perpetual")
          .in("id", dealIds);

        if (dealsError) throw dealsError;

        const dealsMap = new Map(deals?.map((d) => [d.id, d]));
        return cartItems.map((item) => ({
          ...item,
          deal: dealsMap.get(item.deal_id),
        })) as CartItem[];
      }

      return cartItems as CartItem[];
    },
    enabled: !!user,
  });

  const addToCart = useMutation({
    mutationFn: async (dealId: string) => {
      if (!user) throw new Error("Must be logged in to add to cart");

      const { error } = await supabase.from("cart_items").upsert(
        {
          user_id: user.id,
          deal_id: dealId,
          quantity: 1,
        },
        { onConflict: "user_id,deal_id" }
      );

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", user?.id] });
      toast({ title: "Added to cart", description: "Deal added to your cart" });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const removeFromCart = useMutation({
    mutationFn: async (cartItemId: string) => {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("id", cartItemId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", user?.id] });
      toast({ title: "Removed", description: "Deal removed from cart" });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateQuantity = useMutation({
    mutationFn: async ({ cartItemId, quantity }: { cartItemId: string; quantity: number }) => {
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity })
        .eq("id", cartItemId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", user?.id] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const clearCart = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Must be logged in");

      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", user?.id] });
      toast({ title: "Cart cleared", description: "All items removed from cart" });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const isInCart = (dealId: string) => {
    return cartQuery.data?.some((item) => item.deal_id === dealId) ?? false;
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
