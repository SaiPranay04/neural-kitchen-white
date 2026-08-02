-- Add super_admin to member roles (run once in SQL editor)
do $$
begin
  if not exists (
    select 1 from pg_enum e
    join pg_type t on t.oid = e.enumtypid
    where t.typname = 'member_role' and e.enumlabel = 'super_admin'
  ) then
    alter type member_role add value 'super_admin';
  end if;
end $$;
