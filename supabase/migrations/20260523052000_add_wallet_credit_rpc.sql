create unique index if not exists wallet_transactions_topup_reference_key
on public.wallet_transactions(reference)
where kind = 'topup' and reference is not null;

create or replace function public.credit_wallet_topup(
  _user_id uuid,
  _amount integer,
  _reference text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  bal integer;
begin
  if _user_id is null then
    return jsonb_build_object('ok', false, 'error', 'missing_user_id');
  end if;

  if _amount <= 0 or _amount > 1000000 then
    return jsonb_build_object('ok', false, 'error', 'invalid_amount');
  end if;

  if nullif(trim(_reference), '') is null then
    return jsonb_build_object('ok', false, 'error', 'missing_reference');
  end if;

  if exists (
    select 1
    from public.wallet_transactions
    where kind = 'topup' and reference = _reference
  ) then
    select balance into bal from public.wallets where user_id = _user_id;
    return jsonb_build_object('ok', true, 'already', true, 'balance', coalesce(bal, 0));
  end if;

  select balance into bal
  from public.wallets
  where user_id = _user_id
  for update;

  if bal is null then
    insert into public.wallets(user_id, balance)
    values (_user_id, _amount);
    bal := 0;
  else
    update public.wallets
    set balance = balance + _amount
    where user_id = _user_id;
  end if;

  insert into public.wallet_transactions(user_id, kind, amount, balance_after, reference, note)
  values (_user_id, 'topup', _amount, bal + _amount, _reference, 'Paystack wallet top-up');

  return jsonb_build_object('ok', true, 'balance', bal + _amount);
end;
$$;

revoke execute on function public.credit_wallet_topup(uuid, integer, text) from public, anon, authenticated;
grant execute on function public.credit_wallet_topup(uuid, integer, text) to service_role;
