update public.profiles
set role = 'admin',
    updated_at = now()
where email = 'marquesedition@gmail.com';

update public.profiles
set role = 'user',
    updated_at = now()
where email = 'info@nightstage-es.com';

select id, email, role
from public.profiles
where email in ('marquesedition@gmail.com', 'info@nightstage-es.com')
order by email;
