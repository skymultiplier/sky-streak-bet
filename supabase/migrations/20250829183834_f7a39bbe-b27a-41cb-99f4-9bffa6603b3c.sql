-- Create support tickets table for admin dashboard
CREATE TABLE public.support_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  category TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in-progress', 'resolved')),
  admin_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Users can insert their own tickets
CREATE POLICY "Users can create support tickets" 
ON public.support_tickets 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Users can view their own tickets  
CREATE POLICY "Users can view their own tickets" 
ON public.support_tickets 
FOR SELECT 
USING (user_id = auth.uid());

-- Create admin role and policies
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Admin policies for support tickets
CREATE POLICY "Admins can view all support tickets" 
ON public.support_tickets 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update support tickets" 
ON public.support_tickets 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));

-- Admin policies for users table
CREATE POLICY "Admins can view all users" 
ON public.users 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update user balances" 
ON public.users 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));

-- Admin function to adjust any user's balance
CREATE OR REPLACE FUNCTION public.admin_adjust_balance(_user_id UUID, _amount NUMERIC, _reason TEXT)
RETURNS TABLE(new_balance NUMERIC)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_old_balance NUMERIC;
  v_new_balance NUMERIC;
BEGIN
  -- Check if current user is admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Insufficient privileges';
  END IF;

  IF _amount IS NULL OR _user_id IS NULL THEN
    RAISE EXCEPTION 'User ID and amount are required';
  END IF;

  -- Get current balance and update
  SELECT balance INTO v_old_balance FROM public.users WHERE id = _user_id FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Calculate new balance
  v_new_balance := v_old_balance + _amount;
  
  IF v_new_balance < 0 THEN
    RAISE EXCEPTION 'Balance cannot be negative';
  END IF;

  -- Update user balance
  UPDATE public.users 
  SET balance = v_new_balance, updated_at = now()
  WHERE id = _user_id;

  -- Record transaction
  INSERT INTO public.transactions (user_id, type, amount, balance_after)
  VALUES (_user_id, 'admin_adjustment', _amount, v_new_balance);

  RETURN QUERY SELECT v_new_balance;
END;
$function$;

-- Add user management functions for admin
CREATE OR REPLACE FUNCTION public.admin_suspend_user(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if current user is admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Insufficient privileges';
  END IF;

  -- Add suspended status to users table
  ALTER TABLE public.users ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted'));
  
  UPDATE public.users 
  SET status = 'suspended', updated_at = now()
  WHERE id = _user_id;

  RETURN FOUND;
END;
$function$;

-- Add updated_at trigger for support tickets
CREATE TRIGGER update_support_tickets_updated_at
BEFORE UPDATE ON public.support_tickets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();