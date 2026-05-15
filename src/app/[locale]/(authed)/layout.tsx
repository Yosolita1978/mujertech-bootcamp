import { redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import type { ReactNode } from 'react';
import AuthedShell from '@/components/AuthedShell/AuthedShell';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { isAdminEmail } from '@/lib/admin';

type Props = {
  params: Promise<{ locale: string }>;
  children: ReactNode;
};

export default async function AuthedLayout({ params, children }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    redirect(`/${locale}/login`);
  }

  const isAdmin = isAdminEmail(user.email);

  return (
    <AuthedShell userEmail={user.email} isAdmin={isAdmin}>
      {children}
    </AuthedShell>
  );
}
