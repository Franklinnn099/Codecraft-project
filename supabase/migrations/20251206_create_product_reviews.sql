-- Product Reviews Table
-- This table stores customer reviews for products

-- Create the product_reviews table
CREATE TABLE IF NOT EXISTS product_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    review_text TEXT NOT NULL,
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT FALSE,
    admin_reply TEXT,
    admin_reply_at TIMESTAMP WITH TIME ZONE,
    admin_reply_by UUID REFERENCES admin_users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_created_at ON product_reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_product_reviews_is_approved ON product_reviews(is_approved);
CREATE INDEX IF NOT EXISTS idx_product_reviews_rating ON product_reviews(rating);

-- Enable RLS
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read approved reviews
CREATE POLICY "Anyone can read approved reviews"
ON product_reviews FOR SELECT
USING (is_approved = true);

-- Policy: Anyone can insert reviews (for customers submitting reviews)
CREATE POLICY "Anyone can insert reviews"
ON product_reviews FOR INSERT
WITH CHECK (true);

-- Policy: Admins can read all reviews
CREATE POLICY "Admins can read all reviews"
ON product_reviews FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM admin_users
        WHERE admin_users.email = auth.jwt() ->> 'email'
        AND admin_users.is_active = true
    )
);

-- Policy: Admins can update reviews (for approving and replying)
CREATE POLICY "Admins can update reviews"
ON product_reviews FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM admin_users
        WHERE admin_users.email = auth.jwt() ->> 'email'
        AND admin_users.is_active = true
    )
);

-- Policy: Admins can delete reviews
CREATE POLICY "Admins can delete reviews"
ON product_reviews FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM admin_users
        WHERE admin_users.email = auth.jwt() ->> 'email'
        AND admin_users.is_active = true
    )
);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_product_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER product_reviews_updated_at
    BEFORE UPDATE ON product_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_product_reviews_updated_at();

-- Add comment to explain the table
COMMENT ON TABLE product_reviews IS 'Stores customer reviews for products with admin reply capability';
