'use server';

import { redirect } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export type AssessmentState =
  | { status: 'idle' }
  | { status: 'error'; message: string };

const FIELDS = [
  'business_goal',
  'prompt_v1',
  'ai_output',
  'prompt_v2',
  'what_changed',
  'why_changed',
] as const;

type Field = (typeof FIELDS)[number];

export async function submitAssessmentAction(
  _prevState: AssessmentState,
  formData: FormData
): Promise<AssessmentState> {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'assessment.errors' });

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { status: 'error', message: t('notAuthenticated') };
  }

  // Build values by iterating FIELDS so adding/removing a column only requires
  // editing the tuple. Empty string init keeps the type as Record<Field,string>
  // without a cast; the loop validates and fills every key before insert.
  const values: Record<Field, string> = {
    business_goal: '',
    prompt_v1: '',
    ai_output: '',
    prompt_v2: '',
    what_changed: '',
    why_changed: '',
  };
  for (const field of FIELDS) {
    const raw = formData.get(field);
    if (typeof raw !== 'string' || raw.trim() === '') {
      return { status: 'error', message: t('missingField') };
    }
    values[field] = raw.trim();
  }

  // Defense-in-depth: RLS already enforces auth.uid() = user_id on insert, but
  // we pass user.id explicitly so the row is owned by the authenticated user.
  const { error: insertError } = await supabase
    .from('marketing_assessment_submissions')
    .insert({
      user_id: user.id,
      ...values,
    });

  if (insertError) {
    return { status: 'error', message: t('generic') };
  }

  redirect(`/${locale}/modulo-3/evaluacion/gracias`);
}
