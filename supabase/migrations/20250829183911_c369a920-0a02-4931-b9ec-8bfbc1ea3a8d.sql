-- Fix security issues

-- Add RLS policy for user_roles table  
CREATE POLICY "Users can view own role" 
ON public.user_roles 
FOR SELECT 
USING (user_id = auth.uid());

-- Fix function search paths
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.admin_suspend_user(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if current user is admin
  IF NOT public.has_role(_user_id := auth.uid(), _role := 'admin') THEN
    RAISE EXCEPTION 'Insufficient privileges';
  END IF;

  UPDATE public.users 
  SET status = 'suspended', updated_at = now()
  WHERE id = _user_id;

  RETURN FOUND;
END;
$function$;