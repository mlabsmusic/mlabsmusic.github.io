import { supabase, isSupabaseConfigured } from '../lib/supabase';

const hiddenClass = 'is-auth-hidden';

function setHidden(element: Element | null, hidden: boolean) {
  if (!element) return;
  element.classList.toggle(hiddenClass, hidden);
  if (hidden) element.setAttribute('aria-hidden', 'true');
  else element.removeAttribute('aria-hidden');
}

async function setupAuthNav() {
  const appsLinks = document.querySelectorAll('[data-auth-link="apps"]');
  const adminLinks = document.querySelectorAll('[data-auth-link="admin"]');
  const loginLinks = document.querySelectorAll('[data-auth-link="login"]');
  const primaryLinks = document.querySelectorAll('[data-auth-primary]');

  for (const link of appsLinks) setHidden(link, true);
  for (const link of adminLinks) setHidden(link, true);

  if (!isSupabaseConfigured || !supabase) return;

  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData.session;

  if (!session) {
    for (const link of loginLinks) setHidden(link, false);
    for (const link of primaryLinks) {
      link.setAttribute('href', '/login');
      link.textContent = 'Iniciar sesion';
    }
    return;
  }

  for (const link of loginLinks) setHidden(link, true);
  for (const link of appsLinks) setHidden(link, false);
  for (const link of primaryLinks) {
    link.setAttribute('href', '/apps');
    link.textContent = 'Mis apps';
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();

  if (profile?.role === 'admin') {
    for (const link of adminLinks) setHidden(link, false);
  }
}

setupAuthNav();
