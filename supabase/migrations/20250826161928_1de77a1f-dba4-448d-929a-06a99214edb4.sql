-- Enable required extension for UUID generation
create extension if not exists pgcrypto;

-- Enums
create type public.transaction_type as enum ('deposit','bet','win','withdrawal');
create type public.bet_status as enum ('pending','lost','won','cancelled');

-- Users table
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  balance numeric(14,2) not null default 0 check (balance >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Transactions table
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  type public.transaction_type not null,
  amount numeric(14,2) not null check (amount > 0),
  balance_after numeric(14,2) not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_transactions_user_created on public.transactions(user_id, created_at desc);

-- Bets table
create table if not exists public.bets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  game_id text,
  bet_amount numeric(14,2) not null check (bet_amount > 0),
  status public.bet_status not null default 'pending',
  payout numeric(14,2) not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists idx_bets_user_created on public.bets(user_id, created_at desc);

-- Timestamp trigger function
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger for users.updated_at
create trigger trg_users_updated_at
before update on public.users
for each row execute function public.update_updated_at_column();

-- RLS
alter table public.users enable row level security;
alter table public.transactions enable row level security;
alter table public.bets enable row level security;

-- Policies for users
create policy "Users can select own profile" on public.users
for select to authenticated using (id = auth.uid());

create policy "Users can insert own profile" on public.users
for insert to authenticated with check (id = auth.uid());

create policy "Users can update own profile" on public.users
for update to authenticated using (id = auth.uid());

-- Policies for transactions
create policy "Users can view own transactions" on public.transactions
for select to authenticated using (user_id = auth.uid());

create policy "Users can insert own transactions" on public.transactions
for insert to authenticated with check (user_id = auth.uid());

-- Policies for bets
create policy "Users can view own bets" on public.bets
for select to authenticated using (user_id = auth.uid());

create policy "Users can insert own bets" on public.bets
for insert to authenticated with check (user_id = auth.uid());

create policy "Users can update own bets" on public.bets
for update to authenticated using (user_id = auth.uid());

-- Create signup trigger to auto-provision users row
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public as $$
begin
  insert into public.users (id, username)
  values (new.id, coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Atomic balance operations
create or replace function public.get_user_balance()
returns numeric language sql stable security definer set search_path = public as $$
  select balance from public.users where id = auth.uid();
$$;

grant execute on function public.get_user_balance() to authenticated;

create or replace function public.deposit(_amount numeric)
returns table(balance numeric) language plpgsql security definer set search_path = public as $$
declare v_balance numeric;
begin
  if _amount is null or _amount <= 0 then
    raise exception 'Amount must be > 0';
  end if;

  update public.users
    set balance = balance + _amount,
        updated_at = now()
    where id = auth.uid()
    returning balance into v_balance;

  if not found then
    raise exception 'User not found';
  end if;

  insert into public.transactions (user_id, type, amount, balance_after)
  values (auth.uid(), 'deposit', _amount, v_balance);

  return query select v_balance as balance;
end;
$$;

grant execute on function public.deposit(numeric) to authenticated;

create or replace function public.withdraw(_amount numeric)
returns table(balance numeric) language plpgsql security definer set search_path = public as $$
declare v_balance numeric;
        v_curr numeric;
begin
  if _amount is null or _amount <= 0 then
    raise exception 'Amount must be > 0';
  end if;

  select balance into v_curr from public.users where id = auth.uid() for update;
  if not found then
    raise exception 'User not found';
  end if;
  if v_curr < _amount then
    raise exception 'Insufficient funds';
  end if;

  update public.users
    set balance = v_curr - _amount,
        updated_at = now()
    where id = auth.uid()
    returning balance into v_balance;

  insert into public.transactions (user_id, type, amount, balance_after)
  values (auth.uid(), 'withdrawal', _amount, v_balance);

  return query select v_balance as balance;
end;
$$;

grant execute on function public.withdraw(numeric) to authenticated;

create or replace function public.place_bet(_game_id text, _bet_amount numeric)
returns table (bet_id uuid, balance numeric) language plpgsql security definer set search_path = public as $$
declare v_balance numeric; v_bet_id uuid;
        v_curr numeric;
begin
  if _bet_amount is null or _bet_amount <= 0 then
    raise exception 'Bet amount must be > 0';
  end if;
  select balance into v_curr from public.users where id = auth.uid() for update;
  if not found then raise exception 'User not found'; end if;
  if v_curr < _bet_amount then raise exception 'Insufficient balance'; end if;

  update public.users set balance = v_curr - _bet_amount, updated_at = now()
    where id = auth.uid() returning balance into v_balance;

  insert into public.bets (user_id, game_id, bet_amount, status)
  values (auth.uid(), _game_id, _bet_amount, 'pending')
  returning id into v_bet_id;

  insert into public.transactions (user_id, type, amount, balance_after)
  values (auth.uid(), 'bet', _bet_amount, v_balance);

  return query select v_bet_id, v_balance;
end;
$$;

grant execute on function public.place_bet(text, numeric) to authenticated;

create or replace function public.resolve_bet(_bet_id uuid, _multiplier numeric)
returns table (payout numeric, balance numeric, status public.bet_status) language plpgsql security definer set search_path = public as $$
declare v_bet record; v_payout numeric; v_balance numeric; v_status public.bet_status;
begin
  select * into v_bet from public.bets where id = _bet_id and user_id = auth.uid() for update;
  if not found then raise exception 'Bet not found'; end if;
  if v_bet.status <> 'pending' then raise exception 'Bet already resolved'; end if;
  if _multiplier is null or _multiplier < 0 then raise exception 'Invalid multiplier'; end if;

  v_payout := round(v_bet.bet_amount * coalesce(_multiplier, 0), 2);
  if v_payout > 0 then
    v_status := 'won';
    update public.users set balance = balance + v_payout, updated_at = now()
      where id = auth.uid() returning balance into v_balance;
    update public.bets set status = 'won', payout = v_payout where id = _bet_id;
    insert into public.transactions (user_id, type, amount, balance_after)
    values (auth.uid(), 'win', v_payout, v_balance);
  else
    v_status := 'lost';
    v_balance := (select balance from public.users where id = auth.uid());
    update public.bets set status = 'lost', payout = 0 where id = _bet_id;
  end if;

  return query select v_payout, v_balance, v_status;
end;
$$;

grant execute on function public.resolve_bet(uuid, numeric) to authenticated;