/*
  # Create exec_sql function for automatic migrations

  1. New Functions
    - `exec_sql` - Allows executing raw SQL commands via RPC
  2. Security
    - Grant execute permissions to authenticated users
    - Security definer for elevated privileges
*/

-- Create the exec_sql function for automatic migrations
CREATE OR REPLACE FUNCTION public.exec_sql(sql TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  EXECUTE sql;
  RETURN 'OK';
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'ERROR: ' || SQLERRM;
END;
$function$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.exec_sql(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.exec_sql(TEXT) TO service_role;