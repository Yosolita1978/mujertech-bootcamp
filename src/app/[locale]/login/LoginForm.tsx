'use client';

import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { useTranslations } from 'next-intl';
import {
  signInWithEmailAction,
  verifyOtpCodeAction,
  type LoginState,
} from './actions';
import styles from './page.module.css';

type Props = {
  defaultEmail?: string;
};

const initialState: LoginState = { status: 'idle' };

function EmailSubmitButton() {
  const t = useTranslations('auth.login');
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={styles.submitButton} disabled={pending}>
      {pending ? t('submitting') : t('submit')}
    </button>
  );
}

function CodeSubmitButton() {
  const t = useTranslations('auth.login');
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={styles.submitButton} disabled={pending}>
      {pending ? t('verifyingCode') : t('verifyCode')}
    </button>
  );
}

export default function LoginForm({ defaultEmail = '' }: Props) {
  const t = useTranslations('auth.login');

  const [emailState, emailAction] = useActionState<LoginState, FormData>(
    signInWithEmailAction,
    initialState
  );
  const [codeState, codeAction] = useActionState<LoginState, FormData>(
    verifyOtpCodeAction,
    initialState
  );

  const [view, setView] = useState<'email' | 'code'>('email');

  useEffect(() => {
    if (emailState.status === 'codeSent') {
      setView('code');
    }
  }, [emailState]);

  if (view === 'code' && emailState.status === 'codeSent') {
    const email = emailState.email;
    return (
      <div className={styles.calloutSuccess} role="status">
        <p className={styles.calloutTitle}>{t('checkEmailTitle')}</p>
        <p>{t('checkEmailIntro', { email })}</p>

        <ol className={styles.optionsList}>
          <li className={styles.optionItem}>
            <strong>{t('checkEmailOption1Title')}</strong>
            <p className={styles.helperText}>{t('checkEmailOption1Body')}</p>
          </li>
          <li className={styles.optionItem}>
            <strong>{t('checkEmailOption2Title')}</strong>
            <form action={codeAction} className={styles.form} noValidate>
              <input type="hidden" name="email" value={email} />
              <label htmlFor="code" className={styles.label}>
                {t('codeLabel')}
              </label>
              <input
                id="code"
                name="code"
                type="text"
                required
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                autoComplete="one-time-code"
                placeholder={t('codePlaceholder')}
                className={`${styles.input} ${styles.codeInput}`}
              />
              {codeState.status === 'error' && (
                <p className={styles.errorText} role="alert">
                  {codeState.message}
                </p>
              )}
              <CodeSubmitButton />
            </form>
          </li>
        </ol>

        <button
          type="button"
          className={styles.linkButton}
          onClick={() => setView('email')}
        >
          {t('changeEmail')}
        </button>
      </div>
    );
  }

  const fieldError = emailState.status === 'error' ? emailState.message : null;
  const lastAttemptedEmail =
    (emailState.status === 'error' && emailState.email) ||
    (emailState.status === 'codeSent' && emailState.email) ||
    '';
  const initialEmail = lastAttemptedEmail || defaultEmail;

  return (
    <form action={emailAction} className={styles.form} noValidate>
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
        defaultValue={initialEmail}
        className={styles.input}
      />
      {fieldError && (
        <p className={styles.errorText} role="alert">
          {fieldError}
        </p>
      )}
      <EmailSubmitButton />
    </form>
  );
}
