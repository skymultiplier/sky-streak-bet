-- Update the default balance for new users from 100 to 0
-- Also update the handle_new_user trigger function

-- Drop and recreate the trigger function with 0 balance
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, username, balance)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    0.00
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Update the default value for the balance column
ALTER TABLE public.users ALTER COLUMN balance SET DEFAULT 0.00;