create or replace function private.audit_catalog_parser_override_change()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
declare
  old_data jsonb;
  new_data jsonb;
  changed text[];
begin
  if not private.is_admin(auth.uid()) then
    return coalesce(new, old);
  end if;

  old_data := case when tg_op = 'INSERT' then '{}'::jsonb else to_jsonb(old) end;
  new_data := case when tg_op = 'DELETE' then '{}'::jsonb else to_jsonb(new) end;
  changed := private.jsonb_changed_fields(old_data, new_data);

  if coalesce(array_length(changed, 1), 0) > 0 then
    insert into public.admin_audit_events (
      actor_user_id,
      action,
      table_name,
      row_id,
      before_data,
      after_data,
      changed_fields
    )
    values (
      auth.uid(),
      case
        when tg_op = 'INSERT' then 'parser_override_create'
        when tg_op = 'UPDATE' and old.is_active is true and new.is_active is false then 'parser_override_disable'
        when tg_op = 'UPDATE' then 'parser_override_update'
        else 'parser_override_delete'
      end,
      'catalog_parser_overrides',
      coalesce(new.id, old.id),
      old_data,
      new_data,
      changed
    );
  end if;

  return coalesce(new, old);
end;
$$;

revoke all on function private.audit_catalog_parser_override_change() from public, anon, authenticated;

drop trigger if exists audit_catalog_parser_override_change on public.catalog_parser_overrides;

create trigger audit_catalog_parser_override_change
  after insert or update or delete on public.catalog_parser_overrides
  for each row
  execute function private.audit_catalog_parser_override_change();
