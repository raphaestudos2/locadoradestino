/*
  # Fix Customers RLS Policies

  1. Policy Updates
    - Fix policies that may be blocking customer operations
    - Ensure admin users can perform all operations
    - Allow public insert for new customer registration

  2. Security Improvements
    - Maintain security while allowing necessary operations
    - Clear policy names and descriptions
    - Proper role-based access control

  3. Changes Made
    - Update existing policies for better functionality
    - Add missing permissions for admin operations
    - Ensure customer self-management works
*/

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Public can view customers for rentals" ON customers;
DROP POLICY IF EXISTS "Authenticated users can manage customers" ON customers;

-- Create improved policies
CREATE POLICY "Public can view active customers for rentals"
  ON customers
  FOR SELECT
  TO public
  USING (status = 'active');

CREATE POLICY "Public can insert new customers"
  ON customers
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can view and edit their own customer data"
  ON customers
  FOR ALL
  TO authenticated
  USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.uid() 
      AND au.active = true
    )
  )
  WITH CHECK (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.uid() 
      AND au.active = true
    )
  );

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