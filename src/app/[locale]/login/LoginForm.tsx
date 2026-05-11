'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useTranslations } from 'next-intl';
import { signInWithEmailAction, type LoginState } from './actions';
import styles from './page.module.css';

const initialState: LoginState = { status: 'idle' };

function SubmitButton() {
  const t = useTranslations('auth.login');
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={styles.submitButton} disabled={pending}>
      {pending ? t('submitting') : t('submit')}
    </button>
  );
}

export default function LoginForm() {
  const t = useTranslations('auth.login');
  const [state, formAction] = useActionState(signInWithEmailAction, initialState);

  if (state.status === 'success') {
    return (
      <div className={styles.calloutSuccess} role="status">
        <p className={styles.calloutTitle}>{t('checkEmailTitle')}</p>
        <p>{t('checkEmailBody', { email: state.email })}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className={styles.form} noValidate>
      <label htmlFor="email" className={styles.label}>
        {t('emailLabel')}
      </label>
      <input
        id="email"
        name="email"
        type="email"
        required
        autoComplete="email"
        inputMode="email"
        placeholder={t('emailPlaceholder')}
        className={styles.input}
      />
      {state.status === 'error' && (
        <p className={styles.errorText} role="alert">
          {state.message}
        </p>
      )}
      <SubmitButton />
    </form>
  );
}
