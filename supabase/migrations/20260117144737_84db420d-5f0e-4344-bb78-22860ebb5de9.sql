-- Create users/profiles table
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  balance NUMERIC(12,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Create bets table
CREATE TABLE public.bets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bet_amount NUMERIC(12,2) NOT NULL,
  multiplier NUMERIC(10,2),
  payout NUMERIC(12,2),
  status TEXT NOT NULL DEFAULT 'pending',
  client_seed TEXT,
  server_seed TEXT,
  nonce INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  balance_after NUMERIC(12,2) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create support_tickets table
CREATE TABLE public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  admin_response TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- User roles policies
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- Bets policies
CREATE POLICY "Users can view own bets" ON public.bets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bets" ON public.bets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bets" ON public.bets FOR UPDATE USING (auth.uid() = user_id);

-- Transactions policies
CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);

-- Support tickets policies
CREATE POLICY "Users can view own tickets" ON public.support_tickets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create tickets" ON public.support_tickets FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- has_role function
CREATE OR REPLACE FUNCTION public.has_role(check_user_id UUID, check_role TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = check_user_id AND role = check_role
  );
END;
$$;

-- Admin policies (using has_role function)
CREATE POLICY "Admins can view all users" ON public.users FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update all users" ON public.users FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can view all bets" ON public.bets FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can view all transactions" ON public.transactions FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can view all tickets" ON public.support_tickets FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update tickets" ON public.support_tickets FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- place_bet function
CREATE OR REPLACE FUNCTION public.place_bet(p_bet_amount NUMERIC, p_client_seed TEXT DEFAULT NULL)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_balance NUMERIC;
  v_bet_id UUID;
  v_server_seed TEXT;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  SELECT balance INTO v_balance FROM public.users WHERE id = v_user_id FOR UPDATE;
  
  IF v_balance IS NULL OR v_balance < p_bet_amount THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient balance');
  END IF;

  UPDATE public.users SET balance = balance - p_bet_amount, updated_at = now() WHERE id = v_user_id;
  
  v_server_seed := encode(gen_random_bytes(32), 'hex');
  
  INSERT INTO public.bets (user_id, bet_amount, client_seed, server_seed, status)
  VALUES (v_user_id, p_bet_amount, p_client_seed, v_server_seed, 'pending')
  RETURNING id INTO v_bet_id;

  INSERT INTO public.transactions (user_id, type, amount, balance_after, description)
  VALUES (v_user_id, 'bet', -p_bet_amount, v_balance - p_bet_amount, 'Bet placed');

  RETURN json_build_object('success', true, 'bet_id', v_bet_id, 'new_balance', v_balance - p_bet_amount);
END;
$$;

-- resolve_bet function
CREATE OR REPLACE FUNCTION public.resolve_bet(p_bet_id UUID, p_multiplier NUMERIC, p_won BOOLEAN)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_bet RECORD;
  v_payout NUMERIC;
  v_new_balance NUMERIC;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  SELECT * INTO v_bet FROM public.bets WHERE id = p_bet_id AND user_id = v_user_id AND status = 'pending';
  
  IF v_bet IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Bet not found or already resolved');
  END IF;

  IF p_won THEN
    v_payout := v_bet.bet_amount * p_multiplier;
    UPDATE public.users SET balance = balance + v_payout, updated_at = now() WHERE id = v_user_id RETURNING balance INTO v_new_balance;
    
    INSERT INTO public.transactions (user_id, type, amount, balance_after, description)
    VALUES (v_user_id, 'win', v_payout, v_new_balance, 'Won bet at ' || p_multiplier || 'x');
  ELSE
    v_payout := 0;
    SELECT balance INTO v_new_balance FROM public.users WHERE id = v_user_id;
  END IF;

  UPDATE public.bets SET multiplier = p_multiplier, payout = v_payout, status = CASE WHEN p_won THEN 'won' ELSE 'lost' END, resolved_at = now() WHERE id = p_bet_id;

  RETURN json_build_object('success', true, 'payout', v_payout, 'new_balance', v_new_balance);
END;
$$;

-- admin_adjust_balance function
CREATE OR REPLACE FUNCTION public.admin_adjust_balance(p_user_id UUID, p_amount NUMERIC, p_reason TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id UUID;
  v_new_balance NUMERIC;
BEGIN
  v_admin_id := auth.uid();
  IF NOT public.has_role(v_admin_id, 'admin') THEN
    RETURN json_build_object('success', false, 'error', 'Not authorized');
  END IF;

  UPDATE public.users SET balance = balance + p_amount, updated_at = now() WHERE id = p_user_id RETURNING balance INTO v_new_balance;
  
  INSERT INTO public.transactions (user_id, type, amount, balance_after, description)
  VALUES (p_user_id, 'admin_adjustment', p_amount, v_new_balance, p_reason);

  RETURN json_build_object('success', true, 'new_balance', v_new_balance);
END;
$$;

-- admin_suspend_user function
CREATE OR REPLACE FUNCTION public.admin_suspend_user(p_user_id UUID, p_suspend BOOLEAN)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id UUID;
BEGIN
  v_admin_id := auth.uid();
  IF NOT public.has_role(v_admin_id, 'admin') THEN
    RETURN json_build_object('success', false, 'error', 'Not authorized');
  END IF;

  UPDATE public.users SET status = CASE WHEN p_suspend THEN 'suspended' ELSE 'active' END, updated_at = now() WHERE id = p_user_id;

  RETURN json_build_object('success', true);
END;
$$;

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON public.support_tickets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create user profile on signup trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, username, balance)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)), 100);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();