'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useTranslations } from 'next-intl';
import { submitAssessmentAction, type AssessmentState } from './actions';
import styles from './page.module.css';

const initialState: AssessmentState = { status: 'idle' };

// Order mirrors the rubric: meta → first prompt → AI output → revised prompt
// → what changed → how you'd evaluate. The tuple drives both label keys
// (camelCase) and form-data names (snake_case matching the DB columns).
const FIELD_KEYS = [
  'businessGoal',
  'promptV1',
  'aiOutput',
  'promptV2',
  'whatChanged',
  'whyChanged',
] as const;

const NAME_BY_KEY: Record<(typeof FIELD_KEYS)[number], string> = {
  businessGoal: 'business_goal',
  promptV1: 'prompt_v1',
  aiOutput: 'ai_output',
  promptV2: 'prompt_v2',
  whatChanged: 'what_changed',
  whyChanged: 'why_changed',
};

function SubmitButton() {
  const t = useTranslations('assessment');
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={styles.submitButton} disabled={pending}>
      {pending ? t('submitting') : t('submit')}
    </button>
  );
}

export default function AssessmentForm() {
  const tFields = useTranslations('assessment.fields');
  const [state, formAction] = useActionState(
    submitAssessmentAction,
    initialState
  );

  return (
    <form action={formAction} className={styles.form} noValidate>
      {FIELD_KEYS.map((key) => {
        const name = NAME_BY_KEY[key];
        return (
          <div key={key} className={styles.field}>
            <label htmlFor={name} className={styles.label}>
              {tFields(`${key}.label`)}
            </label>
            <textarea
              id={name}
              name={name}
              required
              rows={5}
              placeholder={tFields(`${key}.placeholder`)}
              className={styles.textarea}
            />
          </div>
        );
      })}

      {state.status === 'error' && (
        <p className={styles.errorText} role="alert">
          {state.message}
        </p>
      )}
      <SubmitButton />
    </form>
  );
}
