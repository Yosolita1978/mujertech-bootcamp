import { createSupabaseServerClient } from '@/lib/supabase/server';

export type ProgressStatus = 'not_started' | 'in_progress' | 'completed';

/**
 * Returns a map of module slug → progress status for the given user.
 * Modules with no lesson_progress row are reported as `not_started`.
 *
 * `userId` is passed explicitly (defense-in-depth on top of RLS, which
 * already filters lesson_progress to rows where auth.uid() = user_id).
 */
export async function getProgressByModuleSlug(
  userId: string
): Promise<Record<string, ProgressStatus>> {
  const supabase = await createSupabaseServerClient();

  const { data: modules, error: modulesError } = await supabase
    .from('modules')
    .select('slug, lessons(id)');

  if (modulesError) {
    throw new Error(`Failed to load modules: ${modulesError.message}`);
  }

  const { data: progress, error: progressError } = await supabase
    .from('lesson_progress')
    .select('lesson_id, completed_at')
    .eq('user_id', userId);

  if (progressError) {
    throw new Error(`Failed to load progress: ${progressError.message}`);
  }

  const lessonIdToModuleSlug = new Map<string, string>();
  const statusBySlug: Record<string, ProgressStatus> = {};

  for (const m of modules) {
    statusBySlug[m.slug] = 'not_started';
    for (const l of m.lessons) {
      lessonIdToModuleSlug.set(l.id, m.slug);
    }
  }

  for (const row of progress) {
    const moduleSlug = lessonIdToModuleSlug.get(row.lesson_id);
    if (!moduleSlug) continue;
    statusBySlug[moduleSlug] = row.completed_at ? 'completed' : 'in_progress';
  }

  return statusBySlug;
}

/**
 * Returns true if the given user has submitted the marketing assessment at
 * least once. RLS already restricts reads to the owner's rows; userId is
 * passed explicitly as defense-in-depth.
 */
export async function hasSubmittedAssessment(userId: string): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('marketing_assessment_submissions')
    .select('id')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle();
  if (error) {
    throw new Error(`Failed to check assessment status: ${error.message}`);
  }
  return data !== null;
}
