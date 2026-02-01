
DROP VIEW IF EXISTS public.deals_with_details;

CREATE VIEW public.deals_with_details 
WITH (security_invoker = on) AS
SELECT 
    d.id,
    d.business_id,
    d.category_id,
    d.title,
    d.description,
    d.discount_type,
    d.discount_value,
    d.image_url,
    d.terms_conditions,
    d.start_date,
    d.end_date,
    d.status,
    d.view_count,
    d.created_at,
    d.updated_at,
    b.business_name,
    c.name as category_name,
    c.slug as category_slug
FROM public.deals d
LEFT JOIN public.businesses b ON d.business_id = b.id
LEFT JOIN public.categories c ON d.category_id = c.id;

-- Fix security issue 2: Update function with explicit search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;