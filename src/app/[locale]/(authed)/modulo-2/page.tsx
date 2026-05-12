import { setRequestLocale } from 'next-intl/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import Module2Client from './Module2Client';

type Props = {
  params: Promise<{ locale: string }>;
};

async function getMainLessonId(moduleSlug: string): Promise<string> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('lessons')
    .select('id, modules!inner(slug)')
    .eq('slug', 'main')
    .eq('modules.slug', moduleSlug)
    .single();

  if (error || !data) {
    throw new Error(
      `Lesson row missing for module=${moduleSlug}: ${error?.message ?? 'no data'}`
    );
  }
  return data.id;
}

export default async function Modulo2Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const lessonId = await getMainLessonId('module2');
  return <Module2Client lessonId={lessonId} />;
}
