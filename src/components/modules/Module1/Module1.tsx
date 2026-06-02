'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import SuccessCriteria from '@/components/SuccessCriteria/SuccessCriteria';
import { rawHtml } from '@/lib/i18n';
import type { NotificationType } from '@/lib/hooks/useNotification';
import styles from './Module1.module.css';

const COMMUNITY_URL = 'https://chat.whatsapp.com/BeKIk6RzQ68JFnHOL1ah12';

type AnswerValue = 'verdad' | 'mentira';
type QuestionNum = 1 | 2 | 3;
type QuizAnswer = { answer: AnswerValue; isCorrect: boolean };
type QuizAnswers = Partial<Record<QuestionNum, QuizAnswer>>;

type Props = {
  onNext: () => void;
  onPrev: () => void;
  showNotification: (message: string, type?: NotificationType) => void;
  hidePrev: boolean;
  trackEvent?: (eventName: string, eventData?: Record<string, unknown>) => void;
};

export default function Module1({
  onNext,
  onPrev,
  showNotification,
  hidePrev,
  trackEvent,
}: Props) {
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswers>({});
  const t = useTranslations('module1');
  const tCommon = useTranslations('common');
  const tNotifications = useTranslations('notifications');

  const MYTH_ANSWERS: Record<QuestionNum, { correct: AnswerValue; explanation: string }> = {
    1: { correct: 'mentira', explanation: t('quiz.explanation1') },
    2: { correct: 'verdad', explanation: t('quiz.explanation2') },
    3: { correct: 'mentira', explanation: t('quiz.explanation3') },
  };

  const MODULE_OUTCOMES = [t('outcomes.item1'), t('outcomes.item2')];

  const handleQuizAnswer = (questionNum: QuestionNum, answer: AnswerValue) => {
    if (quizAnswers[questionNum]) return;

    const isCorrect = answer === MYTH_ANSWERS[questionNum].correct;
    setQuizAnswers((prev) => ({
      ...prev,
      [questionNum]: { answer, isCorrect },
    }));

    if (trackEvent) {
      trackEvent('quiz_answered', {
        module: 'module1',
        question: questionNum,
        answer,
        correct: isCorrect ? 'yes' : 'no',
      });
    }
  };

  const handleWhatsAppShare = () => {
    if (trackEvent) {
      trackEvent('whatsapp_share', { module: 'module1' });
    }
    window.open(COMMUNITY_URL, '_blank');
    showNotification(tNotifications('joinGroup'), 'success');
  };

  const handleNext = () => {
    if (trackEvent) {
      const answeredCount = Object.keys(quizAnswers).length;
      const correctCount = Object.values(quizAnswers).filter((a) => a?.isCorrect).length;
      trackEvent('module1_completed', {
        quizAnswered: answeredCount,
        quizCorrect: correctCount,
      });
    }
    onNext();
  };

  return (
    <div className={styles.moduleContent}>
      <header className={styles.moduleHeader}>
        <h1>{t('title')}</h1>
        <p className={styles.moduleSubtitle}>{t('subtitle')}</p>
        <span className={styles.timeBadge}>{t('duration')}</span>
      </header>

      <SuccessCriteria mode="intro" outcomes={MODULE_OUTCOMES} />

      <div className={`${styles.card} ${styles.explanationCard}`}>
        <div className={styles.bigIcon}>🤖</div>
        <h2 className={styles.cardTitle}>{t('explanation.title')}</h2>
        <p className={styles.cardText}>{t('explanation.text')}</p>
        <ul className={styles.simpleList}>
          <li>{t('explanation.item1')}</li>
          <li>{t('explanation.item2')}</li>
          <li>{t('explanation.item3')}</li>
        </ul>
        <p
          className={styles.cardText}
          dangerouslySetInnerHTML={rawHtml(t.raw('explanation.conclusion'))}
        />
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>
          <span className={styles.cardIcon}>✅</span>
          {t('canDo.title')}
        </h2>
        <div className={styles.canDoList}>
          <div className={styles.canDoItem}>
            <span className={styles.canIcon}>💬</span>
            <p>{t('canDo.item1')}</p>
          </div>
          <div className={styles.canDoItem}>
            <span className={styles.canIcon}>💡</span>
            <p>{t('canDo.item2')}</p>
          </div>
          <div className={styles.canDoItem}>
            <span className={styles.canIcon}>🎨</span>
            <p>{t('canDo.item3')}</p>
          </div>
          <div className={styles.canDoItem}>
            <span className={styles.canIcon}>📝</span>
            <p>{t('canDo.item4')}</p>
          </div>
        </div>
      </div>

      <div className={`${styles.card} ${styles.warningCard}`}>
        <h2 className={styles.cardTitle}>
          <span className={styles.cardIcon}>⚠️</span>
          {t('cannotDo.title')}
        </h2>
        <div className={styles.cannotDoList}>
          <div className={styles.cannotItem}>
            <span className={styles.cannotIcon}>🧠</span>
            <p>
              <strong>{t('cannotDo.item1.title')}</strong> {t('cannotDo.item1.description')}
            </p>
          </div>
          <div className={styles.cannotItem}>
            <span className={styles.cannotIcon}>❌</span>
            <p>
              <strong>{t('cannotDo.item2.title')}</strong> {t('cannotDo.item2.description')}
            </p>
          </div>
          <div className={styles.cannotItem}>
            <span className={styles.cannotIcon}>👀</span>
            <p>
              <strong>{t('cannotDo.item3.title')}</strong> {t('cannotDo.item3.description')}
            </p>
          </div>
        </div>
      </div>

      <div className={styles.activityCard}>
        <h2 className={styles.cardTitle}>
          <span className={styles.cardIcon}>🎯</span>
          {t('quiz.title')}
        </h2>
        <p className={styles.cardText}>{t('quiz.instruction')}</p>

        <div className={styles.quizSimple}>
          <div className={styles.quizQuestionItem}>
            <p className={styles.quizStatement}>{t('quiz.question1')}</p>
            <div className={styles.quizButtons}>
              <button
                className={`${styles.quizBtn} ${quizAnswers[1] ? styles.disabled : ''}`}
                onClick={() => handleQuizAnswer(1, 'verdad')}
                disabled={!!quizAnswers[1]}
                type="button"
              >
                {t('quiz.truth')}
              </button>
              <button
                className={`${styles.quizBtn} ${quizAnswers[1] ? styles.disabled : ''}`}
                onClick={() => handleQuizAnswer(1, 'mentira')}
                disabled={!!quizAnswers[1]}
                type="button"
              >
                {t('quiz.lie')}
              </button>
            </div>
            {quizAnswers[1] && (
              <div className={styles.quizFeedback}>
                {quizAnswers[1].isCorrect ? (
                  <div className={styles.feedbackCorrect}>
                    <span className={styles.feedbackIcon}>✅</span>
                    <p>{t('quiz.correct')}</p>
                  </div>
                ) : (
                  <div className={styles.feedbackIncorrect}>
                    <span className={styles.feedbackIcon}>❌</span>
                    <p>{MYTH_ANSWERS[1].explanation}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className={styles.quizQuestionItem}>
            <p className={styles.quizStatement}>{t('quiz.question2')}</p>
            <div className={styles.quizButtons}>
              <button
                className={`${styles.quizBtn} ${quizAnswers[2] ? styles.disabled : ''}`}
                onClick={() => handleQuizAnswer(2, 'verdad')}
                disabled={!!quizAnswers[2]}
                type="button"
              >
                {t('quiz.truth')}
              </button>
              <button
                className={`${styles.quizBtn} ${quizAnswers[2] ? styles.disabled : ''}`}
                onClick={() => handleQuizAnswer(2, 'mentira')}
                disabled={!!quizAnswers[2]}
                type="button"
              >
                {t('quiz.lie')}
              </button>
            </div>
            {quizAnswers[2] && (
              <div className={styles.quizFeedback}>
                {quizAnswers[2].isCorrect ? (
                  <div className={styles.feedbackCorrect}>
                    <span className={styles.feedbackIcon}>✅</span>
                    <p>{t('quiz.correct')}</p>
                  </div>
                ) : (
                  <div className={styles.feedbackIncorrect}>
                    <span className={styles.feedbackIcon}>❌</span>
                    <p>{MYTH_ANSWERS[2].explanation}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className={styles.quizQuestionItem}>
            <p className={styles.quizStatement}>{t('quiz.question3')}</p>
            <div className={styles.quizButtons}>
              <button
                className={`${styles.quizBtn} ${quizAnswers[3] ? styles.disabled : ''}`}
                onClick={() => handleQuizAnswer(3, 'verdad')}
                disabled={!!quizAnswers[3]}
                type="button"
              >
                {t('quiz.truth')}
              </button>
              <button
                className={`${styles.quizBtn} ${quizAnswers[3] ? styles.disabled : ''}`}
                onClick={() => handleQuizAnswer(3, 'mentira')}
                disabled={!!quizAnswers[3]}
                type="button"
              >
                {t('quiz.lie')}
              </button>
            </div>
            {quizAnswers[3] && (
              <div className={styles.quizFeedback}>
                {quizAnswers[3].isCorrect ? (
                  <div className={styles.feedbackCorrect}>
                    <span className={styles.feedbackIcon}>✅</span>
                    <p>{t('quiz.correct')}</p>
                  </div>
                ) : (
                  <div className={styles.feedbackIncorrect}>
                    <span className={styles.feedbackIcon}>❌</span>
                    <p>{MYTH_ANSWERS[3].explanation}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={styles.ethicsCard}>
        <div className={styles.ethicsCardHeader}>
          <span className={styles.ethicsIcon}>🤔</span>
          <h3>{t('ethics.title')}</h3>
        </div>
        <div className={styles.ethicsReflection}>
          <p>{t('ethics.text')}</p>
        </div>
        <div className={styles.ethicsQuestion}>
          <span className={styles.ethicsQuestionIcon}>💬</span>
          <p>{t('ethics.question')}</p>
        </div>
        <button
          className={styles.btnWhatsapp}
          onClick={handleWhatsAppShare}
          type="button"
        >
          <span className={styles.whatsappIcon}>📱</span>
          {t('ethics.shareButton')}
        </button>
      </div>

      <SuccessCriteria mode="completion" completionText={t('completion')} />

      <div className={styles.navButtons}>
        {!hidePrev && (
          <button
            className={`${styles.btnNav} ${styles.btnPrev}`}
            onClick={onPrev}
            type="button"
          >
            ← {tCommon('previous')}
          </button>
        )}
        <button
          className={`${styles.btnNav} ${styles.btnNext}`}
          onClick={handleNext}
          type="button"
        >
          {tCommon('next')} →
        </button>
      </div>
    </div>
  );
}
