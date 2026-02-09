
-- ============================================
-- 1. FIX ALL RLS POLICIES (RESTRICTIVE → PERMISSIVE)
-- ============================================

-- === USERS TABLE ===
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.users;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;

CREATE POLICY "Admins can view all profiles" ON public.users FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can update all profiles" ON public.users FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- === BETS TABLE ===
DROP POLICY IF EXISTS "Admins can view all bets" ON public.bets;
DROP POLICY IF EXISTS "Users can view their own bets" ON public.bets;
DROP POLICY IF EXISTS "Users can insert their own bets" ON public.bets;

CREATE POLICY "Admins can view all bets" ON public.bets FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can view their own bets" ON public.bets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own bets" ON public.bets FOR INSERT WITH CHECK (auth.uid() = user_id);

-- === TRANSACTIONS TABLE ===
DROP POLICY IF EXISTS "Admins can view all transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can insert their own transactions" ON public.transactions;

CREATE POLICY "Admins can view all transactions" ON public.transactions FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can view their own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- === SUPPORT_TICKETS TABLE ===
DROP POLICY IF EXISTS "Admins can view all tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Users can view their own tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Admins can update all tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Users can update their own tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Users can create their own tickets" ON public.support_tickets;

CREATE POLICY "Admins can view all tickets" ON public.support_tickets FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can view their own tickets" ON public.support_tickets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can update all tickets" ON public.support_tickets FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can update their own tickets" ON public.support_tickets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own tickets" ON public.support_tickets FOR INSERT WITH CHECK (auth.uid() = user_id);

-- === USER_ROLES TABLE ===
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- 2. ADD REFERRAL COLUMNS TO USERS TABLE
-- ============================================
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS referred_by TEXT;

-- Generate referral codes for existing users
UPDATE public.users SET referral_code = UPPER(SUBSTRING(MD5(id::text || created_at::text) FROM 1 FOR 8)) WHERE referral_code IS NULL;

-- Make referral_code NOT NULL with a default
ALTER TABLE public.users ALTER COLUMN referral_code SET DEFAULT UPPER(SUBSTRING(MD5(gen_random_uuid()::text) FROM 1 FOR 8));

-- ============================================
-- 3. CREATE REFERRALS TRACKING TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL,
  referred_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  deposit_made BOOLEAN NOT NULL DEFAULT false,
  reward_paid BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(referred_id)
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own referrals" ON public.referrals FOR SELECT USING (auth.uid() = referrer_id);
CREATE POLICY "Admins can view all referrals" ON public.referrals FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update all referrals" ON public.referrals FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "System can insert referrals" ON public.referrals FOR INSERT WITH CHECK (auth.uid() = referred_id);

-- Trigger for updated_at
CREATE TRIGGER update_referrals_updated_at
  BEFORE UPDATE ON public.referrals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 4. UPDATE handle_new_user TO GENERATE REFERRAL CODE
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_referral_code TEXT;
  v_referred_by TEXT;
  v_referrer_id UUID;
BEGIN
  -- Generate unique referral code
  v_referral_code := UPPER(SUBSTRING(MD5(NEW.id::text || NOW()::text) FROM 1 FOR 8));
  
  -- Check if user was referred
  v_referred_by := NEW.raw_user_meta_data->>'referral_code';
  
  INSERT INTO public.users (id, username, balance, referral_code, referred_by)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    0.00,
    v_referral_code,
    v_referred_by
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  -- If referred, create referral tracking record
  IF v_referred_by IS NOT NULL AND v_referred_by != '' THEN
    SELECT id INTO v_referrer_id FROM public.users WHERE referral_code = v_referred_by;
    IF v_referrer_id IS NOT NULL THEN
      INSERT INTO public.referrals (referrer_id, referred_id, status)
      VALUES (v_referrer_id, NEW.id, 'pending');
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- ============================================
-- 5. FUNCTION TO PROCESS REFERRAL REWARD
-- ============================================
CREATE OR REPLACE FUNCTION public.check_referral_reward(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_referrer_id UUID;
  v_qualified_count INT;
BEGIN
  -- Mark this user's referral as deposit_made
  UPDATE public.referrals 
  SET deposit_made = true, status = 'qualified', updated_at = now()
  WHERE referred_id = p_user_id AND deposit_made = false;
  
  -- Find the referrer
  SELECT referrer_id INTO v_referrer_id 
  FROM public.referrals 
  WHERE referred_id = p_user_id;
  
  IF v_referrer_id IS NULL THEN
    RETURN json_build_object('success', true, 'reward', false);
  END IF;
  
  -- Count qualified referrals for this referrer
  SELECT COUNT(*) INTO v_qualified_count 
  FROM public.referrals 
  WHERE referrer_id = v_referrer_id AND deposit_made = true AND reward_paid = false;
  
  -- Award $50 for every 10 qualified referrals
  IF v_qualified_count >= 10 THEN
    -- Pay reward
    UPDATE public.users SET balance = balance + 50.00, updated_at = now() WHERE id = v_referrer_id;
    
    -- Mark referrals as reward_paid
    UPDATE public.referrals 
    SET reward_paid = true, updated_at = now()
    WHERE referrer_id = v_referrer_id AND deposit_made = true AND reward_paid = false;
    
    -- Log transaction
    INSERT INTO public.transactions (user_id, type, amount, description, status)
    VALUES (v_referrer_id, 'referral_reward', 50.00, 'Referral reward: 10 qualified referrals', 'completed');
    
    RETURN json_build_object('success', true, 'reward', true, 'referrer_id', v_referrer_id);
  END IF;
  
  RETURN json_build_object('success', true, 'reward', false);
END;
$function$;
