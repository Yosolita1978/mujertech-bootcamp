'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';

async function getAuthenticatedClient() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    throw new Error('Not authenticated');
  }
  return { supabase, userId: user.id };
}

export async function markLessonStartedAction(lessonId: string): Promise<void> {
  const { supabase, userId } = await getAuthenticatedClient();

  // First-touch insert. If a row already exists, leave its timestamps alone —
  // re-entering a module shouldn't reset `started_at` or wipe `completed_at`.
  const { error } = await supabase.from('lesson_progress').upsert(
    { user_id: userId, lesson_id: lessonId },
    { onConflict: 'user_id,lesson_id', ignoreDuplicates: true }
  );

  if (error) {
    throw new Error(`Failed to mark lesson started: ${error.message}`);
  }
}

export async function markLessonCompletedAction(lessonId: string): Promise<void> {
  const { supabase, userId } = await getAuthenticatedClient();

  // Idempotent: re-completing simply rewrites completed_at (and the updated_at
  // trigger fires). started_at is not in the payload, so an existing value is
  // preserved on conflict.
  const { error } = await supabase.from('lesson_progress').upsert(
    {
      user_id: userId,
      lesson_id: lessonId,
      completed_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,lesson_id' }
  );

  if (error) {
    throw new Error(`Failed to mark lesson completed: ${error.message}`);
  }
}
