-- Create categories table
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    icon VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Categories are readable by everyone
CREATE POLICY "Categories are publicly readable"
ON public.categories FOR SELECT
USING (true);

-- Seed categories
INSERT INTO public.categories (name, slug, icon, display_order) VALUES
('Food & Drink', 'food-drink', 'utensils', 1),
('Fashion', 'fashion', 'shirt', 2),
('Electronics', 'electronics', 'laptop', 3),
('Travel', 'travel', 'plane', 4),
('Health', 'health', 'heart', 5),
('Entertainment', 'entertainment', 'ticket', 6);

-- Create businesses table
CREATE TABLE public.businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    business_name VARCHAR(255) NOT NULL,
    description TEXT,
    address VARCHAR(500),
    city VARCHAR(100),
    phone VARCHAR(50),
    website VARCHAR(255),
    logo_url VARCHAR(500),
    verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on businesses
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

-- Businesses are publicly readable
CREATE POLICY "Businesses are publicly readable"
ON public.businesses FOR SELECT
USING (true);

-- Users can create their own business
CREATE POLICY "Users can create their own business"
ON public.businesses FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own business
CREATE POLICY "Users can update their own business"
ON public.businesses FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own business
CREATE POLICY "Users can delete their own business"
ON public.businesses FOR DELETE
USING (auth.uid() = user_id);

-- Create deals table
CREATE TABLE public.deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    discount_type VARCHAR(20) DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed', 'bogo', 'free_shipping', 'other')),
    discount_value VARCHAR(50) NOT NULL,
    image_url VARCHAR(2000),
    terms_conditions TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'expired', 'paused')),
    view_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on deals
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

-- Deals are publicly readable
CREATE POLICY "Deals are publicly readable"
ON public.deals FOR SELECT
USING (true);

-- Business owners can create deals for their business
CREATE POLICY "Business owners can create deals"
ON public.deals FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.businesses 
        WHERE id = business_id AND user_id = auth.uid()
    )
);

-- Business owners can update their deals
CREATE POLICY "Business owners can update their deals"
ON public.deals FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.businesses 
        WHERE id = business_id AND user_id = auth.uid()
    )
);

-- Business owners can delete their deals
CREATE POLICY "Business owners can delete their deals"
ON public.deals FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.businesses 
        WHERE id = business_id AND user_id = auth.uid()
    )
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_businesses_updated_at
BEFORE UPDATE ON public.businesses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_deals_updated_at
BEFORE UPDATE ON public.deals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create a view for public deals with business and category info
CREATE VIEW public.deals_with_details AS
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