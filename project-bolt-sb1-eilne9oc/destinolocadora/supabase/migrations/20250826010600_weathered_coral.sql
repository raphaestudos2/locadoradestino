/*
  # Fix Customer Deletion and Update Constraints

  1. Changes Made
     - Update foreign key constraint to allow CASCADE operations
     - Allow customer deletion even with existing rentals
     - Allow customer updates without restriction

  2. Security
     - Maintain RLS policies for data protection
     - Ensure admin users can manage customers freely

  3. Data Integrity
     - When customer is deleted, related rentals are preserved with NULL customer_id
     - This prevents data loss while allowing customer management
*/

-- Drop the existing foreign key constraint that prevents deletion
ALTER TABLE rentals DROP CONSTRAINT IF EXISTS rentals_customer_id_fkey;

-- Add a new foreign key constraint that allows SET NULL on delete
ALTER TABLE rentals 
ADD CONSTRAINT rentals_customer_id_fkey 
FOREIGN KEY (customer_id) 
REFERENCES customers(id) 
ON DELETE SET NULL 
ON UPDATE CASCADE;

-- Update RLS policies to ensure admin users can manage customers freely
DROP POLICY IF EXISTS "Admin users can manage all customers" ON customers;

CREATE POLICY "Admin users can manage all customers"
  ON customers
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.uid() 
      AND au.active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.uid() 
      AND au.active = true
    )
  );

-- Ensure customers table allows updates and deletes
DROP POLICY IF EXISTS "Users can view and edit their own customer data" ON customers;

CREATE POLICY "Users can view and edit their own customer data"
  ON customers
  FOR ALL
  TO authenticated
  USING (
    (auth.uid() = user_id) OR 
    (EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.uid() 
      AND au.active = true
    ))
  )
  WITH CHECK (
    (auth.uid() = user_id) OR 
    (EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.uid() 
      AND au.active = true
    ))
  );