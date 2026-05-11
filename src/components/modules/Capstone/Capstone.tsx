'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import type { NotificationType } from '@/lib/hooks/useNotification';
import styles from './Capstone.module.css';

const TOTAL_STEPS = 10;
const STORAGE_KEY = 'mujertech_capstone_practice';

type PracticeData = { context: string; task: string; output: string };
type PracticeField = keyof PracticeData;
type QuestionId = 'step8.q1' | 'step8.q2' | 'step8.q3';
type OptionId = 'option1' | 'option2' | 'option3' | 'option4';
type QuizAnswers = Partial<Record<QuestionId, OptionId[]>>;
type QuizSubmitted = Partial<Record<QuestionId, boolean>>;

function loadPractice(): PracticeData {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved) as PracticeData;
  } catch {
    // ignore
  }
  return { context: '', task: '', output: '' };
}

function savePractice(data: PracticeData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

type Props = {
  onBack: () => void;
  showNotification: (message: string, type?: NotificationType) => void;
  trackEvent?: (eventName: string, eventData?: Record<string, unknown>) => void;
};

export default function Capstone({ onBack, showNotification, trackEvent }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [practice, setPractice] = useState<PracticeData>({
    context: '',
    task: '',
    output: '',
  });
  const [showPracticeResult, setShowPracticeResult] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswers>({});
  const [quizSubmitted, setQuizSubmitted] = useState<QuizSubmitted>({});
  const [reflection, setReflection] = useState('');

  const t = useTranslations('capstone');
  const tNotifications = useTranslations('notifications');

  useEffect(() => {
    const saved = loadPractice();
    setPractice(saved);
  }, []);

  const handlePracticeChange = (field: PracticeField, value: string) => {
    const updated = { ...practice, [field]: value };
    setPractice(updated);
    savePractice(updated);
  };

  const handleGeneratePractice = () => {
    if (!practice.context.trim() || !practice.task.trim() || !practice.output.trim()) {
      showNotification(t('step6.fillAll'), 'error');
      return;
    }
    setShowPracticeResult(true);
    if (trackEvent) {
      trackEvent('capstone_practice_generated');
    }
  };

  const copyToClipboard = async (text: string, source: string) => {
    if (trackEvent) {
      trackEvent('copy_clicked', { module: 'capstone', source });
    }
    try {
      await navigator.clipboard.writeText(text);
      showNotification(tNotifications('copied'), 'success');
    } catch {
      showNotification(tNotifications('copyFailed'), 'error');
    }
  };

  const handleQuizSelect = (questionId: QuestionId, optionId: OptionId) => {
    if (quizSubmitted[questionId]) return;
    setQuizAnswers((prev) => {
      const current = prev[questionId] || [];
      const correct = t(`${questionId}.correct`);
      const isMultiple = correct.includes(',');

      if (isMultiple) {
        const updated = current.includes(optionId)
          ? current.filter((id) => id !== optionId)
          : [...current, optionId];
        return { ...prev, [questionId]: updated };
      }
      return { ...prev, [questionId]: [optionId] };
    });
  };

  const handleQuizSubmit = (questionId: QuestionId) => {
    setQuizSubmitted((prev) => ({ ...prev, [questionId]: true }));
    if (trackEvent) {
      trackEvent('capstone_quiz_answered', { question: questionId });
    }
  };

  const isQuizCorrect = (questionId: QuestionId): boolean => {
    const correct = t(`${questionId}.correct`).split(',').sort().join(',');
    const answered = (quizAnswers[questionId] || []).sort().join(',');
    return correct === answered;
  };

  const goNext = () => {
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goPrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (trackEvent) {
      trackEvent('capstone_exited', { step: currentStep });
    }
    onBack();
  };

  const practicePrompt = `${practice.context.trim()}\n\n${practice.task.trim()}\n\n${practice.output.trim()}`;

  const referenceGuideText = `${t('step9.formulaTitle')}
C - ${t('step9.formulaC')}
T - ${t('step9.formulaT')}
O - ${t('step9.formulaO')}

${t('step9.tipsTitle')}
1. ${t('step9.tip1')}
2. ${t('step9.tip2')}
3. ${t('step9.tip3')}
4. ${t('step9.tip4')}
5. ${t('step9.tip5')}

${t('step9.exampleTitle')}
${t('step9.examplePrompt')}`;

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className={styles.stepContent}>
            <header className={styles.moduleHeader}>
              <h1>{t('step0.title')}</h1>
              <p className={styles.moduleSubtitle}>{t('step0.subtitle')}</p>
              <span className={styles.timeBadge}>{t('step0.duration')}</span>
            </header>
            <div className={styles.card}>
              <p className={styles.cardText}>{t('step0.welcome1')}</p>
              <p className={styles.cardText}>{t('step0.welcome2')}</p>
              <p className={styles.cardText}>{t('step0.welcome3')}</p>
              <div className={styles.encouragementBox}>
                <span className={styles.encouragementIcon}>💪</span>
                <p>{t('step0.encouragement')}</p>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className={styles.stepContent}>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>
                <span className={styles.cardIcon}>🎯</span>
                {t('step1.title')}
              </h2>
              <div className={styles.objectivesList}>
                <div className={styles.objectiveItem}>
                  <span className={styles.objectiveCheck}>✅</span>
                  <p>{t('step1.objective1')}</p>
                </div>
                <div className={styles.objectiveItem}>
                  <span className={styles.objectiveCheck}>✅</span>
                  <p>{t('step1.objective2')}</p>
                </div>
                <div className={styles.objectiveItem}>
                  <span className={styles.objectiveCheck}>✅</span>
                  <p>{t('step1.objective3')}</p>
                </div>
              </div>
              <div className={styles.noteBox}>
                <p>{t('step1.note')}</p>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className={styles.stepContent}>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>
                <span className={styles.cardIcon}>💡</span>
                {t('step2.title')}
              </h2>
              <p className={styles.cardText}>{t('step2.text1')}</p>
              <div className={styles.ruleBox}>
                <p className={styles.ruleText}>{t('step2.rule')}</p>
              </div>
            </div>
            <div className={styles.comparisonSection}>
              <div className={`${styles.comparisonCard} ${styles.weak}`}>
                <span className={styles.comparisonLabel}>{t('step2.example1Label')}</span>
                <p className={styles.comparisonPrompt}>{t('step2.example1')}</p>
                <p className={styles.comparisonResult}>{t('step2.example1Result')}</p>
              </div>
              <div className={`${styles.comparisonCard} ${styles.strong}`}>
                <span className={styles.comparisonLabel}>{t('step2.example2Label')}</span>
                <p className={styles.comparisonPrompt}>{t('step2.example2')}</p>
                <p className={styles.comparisonResult}>{t('step2.example2Result')}</p>
              </div>
            </div>
            <div className={styles.takeawayBox}>
              <p>{t('step2.takeaway')}</p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className={styles.stepContent}>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>
                <span className={styles.cardIcon}>🔑</span>
                {t('step3.title')}
              </h2>
              <p className={styles.cardText}>{t('step3.intro')}</p>
            </div>
            <div className={styles.ctoGrid}>
              <div className={`${styles.ctoCard} ${styles.ctoContext}`}>
                <div className={styles.ctoLetter}>{t('step3.context.letter')}</div>
                <h3>{t('step3.context.title')}</h3>
                <p className={styles.ctoDescription}>{t('step3.context.description')}</p>
                <div className={styles.ctoExample}>
                  <p>{t('step3.context.example')}</p>
                </div>
              </div>
              <div className={`${styles.ctoCard} ${styles.ctoTask}`}>
                <div className={styles.ctoLetter}>{t('step3.task.letter')}</div>
                <h3>{t('step3.task.title')}</h3>
                <p className={styles.ctoDescription}>{t('step3.task.description')}</p>
                <div className={styles.ctoExample}>
                  <p>{t('step3.task.example')}</p>
                </div>
              </div>
              <div className={`${styles.ctoCard} ${styles.ctoOutput}`}>
                <div className={styles.ctoLetter}>{t('step3.output.letter')}</div>
                <h3>{t('step3.output.title')}</h3>
                <p className={styles.ctoDescription}>{t('step3.output.description')}</p>
                <div className={styles.ctoExample}>
                  <p>{t('step3.output.example')}</p>
                </div>
              </div>
            </div>
            <div className={styles.noteBox}>
              <p>{t('step3.tip')}</p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className={styles.stepContent}>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>
                <span className={styles.cardIcon}>⚖️</span>
                {t('step4.title')}
              </h2>
              <p className={styles.cardText}>{t('step4.intro')}</p>
            </div>

            <div className={styles.exampleBlock}>
              <div className={`${styles.comparisonCard} ${styles.weak}`}>
                <span className={styles.comparisonLabel}>{t('step4.example1.weakLabel')}</span>
                <p className={styles.comparisonPrompt}>{t('step4.example1.weak')}</p>
              </div>
              <div className={`${styles.comparisonCard} ${styles.strong}`}>
                <span className={styles.comparisonLabel}>{t('step4.example1.strongLabel')}</span>
                <p className={styles.comparisonPrompt}>{t('step4.example1.strong')}</p>
              </div>
              <div className={styles.whyBox}>
                <h4>{t('step4.example1.whyTitle')}</h4>
                <ul>
                  <li>{t('step4.example1.why1')}</li>
                  <li>{t('step4.example1.why2')}</li>
                  <li>{t('step4.example1.why3')}</li>
                </ul>
              </div>
            </div>

            <div className={styles.exampleBlock}>
              <div className={`${styles.comparisonCard} ${styles.weak}`}>
                <span className={styles.comparisonLabel}>{t('step4.example2.weakLabel')}</span>
                <p className={styles.comparisonPrompt}>{t('step4.example2.weak')}</p>
              </div>
              <div className={`${styles.comparisonCard} ${styles.strong}`}>
                <span className={styles.comparisonLabel}>{t('step4.example2.strongLabel')}</span>
                <p className={styles.comparisonPrompt}>{t('step4.example2.strong')}</p>
              </div>
              <div className={styles.whyBox}>
                <h4>{t('step4.example2.whyTitle')}</h4>
                <ul>
                  <li>{t('step4.example2.why1')}</li>
                  <li>{t('step4.example2.why2')}</li>
                  <li>{t('step4.example2.why3')}</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className={styles.stepContent}>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>
                <span className={styles.cardIcon}>🔄</span>
                {t('step5.title')}
              </h2>
              <p className={styles.cardText}>{t('step5.intro')}</p>
            </div>

            <div className={`${styles.comparisonCard} ${styles.weak}`}>
              <span className={styles.comparisonLabel}>{t('step5.originalLabel')}</span>
              <p className={styles.comparisonPrompt}>{t('step5.original')}</p>
              <p className={styles.comparisonResult}>{t('step5.problem')}</p>
            </div>

            <div className={styles.card}>
              <h3>{t('step5.transformTitle')}</h3>
              <div className={styles.transformSteps}>
                <div className={styles.transformStep}>
                  <span className={styles.transformLabel}>{t('step5.contextLabel')}</span>
                  <p>{t('step5.contextText')}</p>
                </div>
                <div className={styles.transformStep}>
                  <span className={styles.transformLabel}>{t('step5.taskLabel')}</span>
                  <p>{t('step5.taskText')}</p>
                </div>
                <div className={styles.transformStep}>
                  <span className={styles.transformLabel}>{t('step5.outputLabel')}</span>
                  <p>{t('step5.outputText')}</p>
                </div>
              </div>
            </div>

            <div className={`${styles.comparisonCard} ${styles.strong}`}>
              <span className={styles.comparisonLabel}>{t('step5.revisedLabel')}</span>
              <p className={styles.comparisonPrompt} style={{ whiteSpace: 'pre-wrap' }}>
                {t('step5.revised')}
              </p>
            </div>

            <div className={styles.card}>
              <h3>{t('step5.sampleResponseLabel')}</h3>
              <div className={styles.aiResponseBox}>
                <p>{t('step5.sampleResponse1')}</p>
              </div>
              <div className={styles.aiResponseBox}>
                <p>{t('step5.sampleResponse2')}</p>
              </div>
            </div>

            <div className={styles.reflectionCard}>
              <h3>{t('step5.reflectionTitle')}</h3>
              <ul>
                <li>{t('step5.reflection1')}</li>
                <li>{t('step5.reflection2')}</li>
                <li>{t('step5.reflection3')}</li>
              </ul>
              <div className={styles.humanReminder}>
                <p>{t('step5.reflectionHuman')}</p>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className={styles.stepContent}>
            <div className={`${styles.card} ${styles.practiceCard}`}>
              <h2 className={styles.cardTitle}>
                <span className={styles.cardIcon}>✏️</span>
                {t('step6.title')}
              </h2>
              <p className={styles.cardText}>{t('step6.intro')}</p>

              <div className={styles.practiceForm}>
                <div className={styles.practiceField}>
                  <label className={styles.practiceLabel}>{t('step6.contextLabel')}</label>
                  <textarea
                    className={styles.practiceInput}
                    placeholder={t('step6.contextPlaceholder')}
                    value={practice.context}
                    onChange={(e) => handlePracticeChange('context', e.target.value)}
                    rows={3}
                  />
                </div>
                <div className={styles.practiceField}>
                  <label className={styles.practiceLabel}>{t('step6.taskLabel')}</label>
                  <textarea
                    className={styles.practiceInput}
                    placeholder={t('step6.taskPlaceholder')}
                    value={practice.task}
                    onChange={(e) => handlePracticeChange('task', e.target.value)}
                    rows={3}
                  />
                </div>
                <div className={styles.practiceField}>
                  <label className={styles.practiceLabel}>{t('step6.outputLabel')}</label>
                  <textarea
                    className={styles.practiceInput}
                    placeholder={t('step6.outputPlaceholder')}
                    value={practice.output}
                    onChange={(e) => handlePracticeChange('output', e.target.value)}
                    rows={3}
                  />
                </div>

                <button
                  className={styles.btnGenerate}
                  onClick={handleGeneratePractice}
                  type="button"
                >
                  {t('step6.generateButton')}
                </button>

                {showPracticeResult && (
                  <div className={styles.practiceResult}>
                    <p className={styles.resultLabel}>{t('step6.resultLabel')}</p>
                    <div className={styles.resultText}>{practicePrompt}</div>
                    <button
                      className={styles.btnCopy}
                      onClick={() => copyToClipboard(practicePrompt, 'capstone_practice')}
                      type="button"
                    >
                      {t('step6.copyButton')}
                    </button>
                    <div className={styles.hintBox}>
                      <p>{t('step6.hint')}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className={styles.stepContent}>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>
                <span className={styles.cardIcon}>🤔</span>
                {t('step7.title')}
              </h2>
              <p className={styles.cardText}>{t('step7.intro')}</p>
            </div>

            <div className={styles.reflectionGrid}>
              <div className={styles.reflectionItem}>
                <span className={styles.reflectionIcon}>🔍</span>
                <h3>{t('step7.question1Title')}</h3>
                <p>{t('step7.question1Text')}</p>
              </div>
              <div className={styles.reflectionItem}>
                <span className={styles.reflectionIcon}>👥</span>
                <h3>{t('step7.question2Title')}</h3>
                <p>{t('step7.question2Text')}</p>
              </div>
              <div className={styles.reflectionItem}>
                <span className={styles.reflectionIcon}>🏷️</span>
                <h3>{t('step7.question3Title')}</h3>
                <p>{t('step7.question3Text')}</p>
              </div>
              <div className={styles.reflectionItem}>
                <span className={styles.reflectionIcon}>✏️</span>
                <h3>{t('step7.question4Title')}</h3>
                <p>{t('step7.question4Text')}</p>
              </div>
            </div>

            <div className={styles.humanReminder}>
              <p>{t('step7.summary')}</p>
            </div>
          </div>
        );

      case 8:
        return (
          <div className={styles.stepContent}>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>
                <span className={styles.cardIcon}>📝</span>
                {t('step8.title')}
              </h2>
              <p className={styles.cardText}>{t('step8.intro')}</p>
            </div>

            {/* Quiz Question 1 - Multiple select */}
            <div className={styles.quizCard}>
              <h3>{t('step8.q1.question')}</h3>
              <div className={styles.quizOptions}>
                {(['option1', 'option2', 'option3', 'option4'] as const).map((opt) => (
                  <button
                    key={opt}
                    className={`${styles.quizOption} ${
                      (quizAnswers['step8.q1'] || []).includes(opt) ? styles.quizSelected : ''
                    } ${
                      quizSubmitted['step8.q1']
                        ? t('step8.q1.correct').includes(opt)
                          ? styles.quizCorrect
                          : (quizAnswers['step8.q1'] || []).includes(opt)
                            ? styles.quizWrong
                            : ''
                        : ''
                    }`}
                    onClick={() => handleQuizSelect('step8.q1', opt)}
                    type="button"
                    disabled={quizSubmitted['step8.q1']}
                  >
                    {t(`step8.q1.${opt}`)}
                  </button>
                ))}
              </div>
              {!quizSubmitted['step8.q1'] && (quizAnswers['step8.q1'] || []).length > 0 && (
                <button
                  className={styles.btnCheck}
                  onClick={() => handleQuizSubmit('step8.q1')}
                  type="button"
                >
                  Comprobar
                </button>
              )}
              {quizSubmitted['step8.q1'] && (
                <div
                  className={`${styles.quizFeedback} ${
                    isQuizCorrect('step8.q1') ? styles.feedbackCorrect : styles.feedbackIncorrect
                  }`}
                >
                  <p>
                    {isQuizCorrect('step8.q1')
                      ? t('step8.q1.feedback_correct')
                      : t('step8.q1.feedback_incorrect')}
                  </p>
                </div>
              )}
            </div>

            {/* Quiz Question 2 - Single select */}
            <div className={styles.quizCard}>
              <h3>{t('step8.q2.question')}</h3>
              <div className={styles.quizOptions}>
                {(['option1', 'option2'] as const).map((opt) => (
                  <button
                    key={opt}
                    className={`${styles.quizOption} ${
                      (quizAnswers['step8.q2'] || []).includes(opt) ? styles.quizSelected : ''
                    } ${
                      quizSubmitted['step8.q2']
                        ? t('step8.q2.correct') === opt
                          ? styles.quizCorrect
                          : (quizAnswers['step8.q2'] || []).includes(opt)
                            ? styles.quizWrong
                            : ''
                        : ''
                    }`}
                    onClick={() => handleQuizSelect('step8.q2', opt)}
                    type="button"
                    disabled={quizSubmitted['step8.q2']}
                  >
                    {t(`step8.q2.${opt}`)}
                  </button>
                ))}
              </div>
              {!quizSubmitted['step8.q2'] && (quizAnswers['step8.q2'] || []).length > 0 && (
                <button
                  className={styles.btnCheck}
                  onClick={() => handleQuizSubmit('step8.q2')}
                  type="button"
                >
                  Comprobar
                </button>
              )}
              {quizSubmitted['step8.q2'] && (
                <div
                  className={`${styles.quizFeedback} ${
                    isQuizCorrect('step8.q2') ? styles.feedbackCorrect : styles.feedbackIncorrect
                  }`}
                >
                  <p>
                    {isQuizCorrect('step8.q2')
                      ? t('step8.q2.feedback_correct')
                      : t('step8.q2.feedback_incorrect')}
                  </p>
                </div>
              )}
            </div>

            {/* Quiz Question 3 - Single select */}
            <div className={styles.quizCard}>
              <h3>{t('step8.q3.question')}</h3>
              <div className={styles.quizOptions}>
                {(['option1', 'option2'] as const).map((opt) => (
                  <button
                    key={opt}
                    className={`${styles.quizOption} ${
                      (quizAnswers['step8.q3'] || []).includes(opt) ? styles.quizSelected : ''
                    } ${
                      quizSubmitted['step8.q3']
                        ? t('step8.q3.correct') === opt
                          ? styles.quizCorrect
                          : (quizAnswers['step8.q3'] || []).includes(opt)
                            ? styles.quizWrong
                            : ''
                        : ''
                    }`}
                    onClick={() => handleQuizSelect('step8.q3', opt)}
                    type="button"
                    disabled={quizSubmitted['step8.q3']}
                  >
                    {t(`step8.q3.${opt}`)}
                  </button>
                ))}
              </div>
              {!quizSubmitted['step8.q3'] && (quizAnswers['step8.q3'] || []).length > 0 && (
                <button
                  className={styles.btnCheck}
                  onClick={() => handleQuizSubmit('step8.q3')}
                  type="button"
                >
                  Comprobar
                </button>
              )}
              {quizSubmitted['step8.q3'] && (
                <div
                  className={`${styles.quizFeedback} ${
                    isQuizCorrect('step8.q3') ? styles.feedbackCorrect : styles.feedbackIncorrect
                  }`}
                >
                  <p>
                    {isQuizCorrect('step8.q3')
                      ? t('step8.q3.feedback_correct')
                      : t('step8.q3.feedback_incorrect')}
                  </p>
                </div>
              )}
            </div>

            {/* Reflection */}
            <div className={styles.card}>
              <h3>{t('step8.reflectionLabel')}</h3>
              <p className={styles.cardText}>{t('step8.reflectionQuestion')}</p>
              <textarea
                className={styles.practiceInput}
                placeholder={t('step8.reflectionPlaceholder')}
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        );

      case 9:
        return (
          <div className={styles.stepContent}>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>
                <span className={styles.cardIcon}>📋</span>
                {t('step9.title')}
              </h2>
              <p className={styles.cardText}>{t('step9.subtitle')}</p>
            </div>

            <div className={styles.referenceGuide}>
              <div className={styles.referenceSection}>
                <h3>{t('step9.formulaTitle')}</h3>
                <div className={styles.formulaItems}>
                  <div className={`${styles.formulaItem} ${styles.formulaC}`}>
                    <span className={styles.formulaLetter}>C</span>
                    <p>{t('step9.formulaC')}</p>
                  </div>
                  <div className={`${styles.formulaItem} ${styles.formulaT}`}>
                    <span className={styles.formulaLetter}>T</span>
                    <p>{t('step9.formulaT')}</p>
                  </div>
                  <div className={`${styles.formulaItem} ${styles.formulaO}`}>
                    <span className={styles.formulaLetter}>O</span>
                    <p>{t('step9.formulaO')}</p>
                  </div>
                </div>
              </div>

              <div className={styles.referenceSection}>
                <h3>{t('step9.tipsTitle')}</h3>
                <ol className={styles.tipsList}>
                  <li>{t('step9.tip1')}</li>
                  <li>{t('step9.tip2')}</li>
                  <li>{t('step9.tip3')}</li>
                  <li>{t('step9.tip4')}</li>
                  <li>{t('step9.tip5')}</li>
                </ol>
              </div>

              <div className={styles.referenceSection}>
                <h3>{t('step9.exampleTitle')}</h3>
                <div className={styles.examplePromptBox}>
                  <p style={{ whiteSpace: 'pre-wrap' }}>{t('step9.examplePrompt')}</p>
                </div>
              </div>

              <button
                className={styles.btnCopy}
                onClick={() => copyToClipboard(referenceGuideText, 'capstone_reference')}
                type="button"
              >
                {t('step9.copyButton')}
              </button>
            </div>

            <div className={styles.closingCard}>
              <h2>{t('step9.closingTitle')}</h2>
              <p>{t('step9.closingText1')}</p>
              <p>{t('step9.closingText2')}</p>
              <p className={styles.closingEmphasis}>{t('step9.closingText3')}</p>
            </div>

            <button className={styles.btnFinal} onClick={handleBack} type="button">
              {t('step9.finalButton')}
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={styles.moduleContent}>
      {/* Back to workshop button */}
      <button className={styles.btnBack} onClick={handleBack} type="button">
        ← {t('backButton')}
      </button>

      {/* Step progress indicator */}
      <div className={styles.stepProgress}>
        <span className={styles.stepProgressText}>
          {t('stepOf', { current: currentStep + 1, total: TOTAL_STEPS })}
        </span>
        <div className={styles.stepDots}>
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <div
              key={i}
              className={`${styles.stepDot} ${
                i === currentStep
                  ? styles.dotCurrent
                  : i < currentStep
                    ? styles.dotCompleted
                    : styles.dotUpcoming
              }`}
            />
          ))}
        </div>
        <div className={styles.stepTrack}>
          <div
            className={styles.stepFill}
            style={{ width: `${((currentStep + 1) / TOTAL_STEPS) * 100}%` }}
          />
        </div>
      </div>

      {/* Step content */}
      {renderStep()}

      {/* Navigation */}
      <div className={styles.navButtons}>
        {currentStep > 0 && (
          <button className={`${styles.btnNav} ${styles.btnPrev}`} onClick={goPrev} type="button">
            ← {t('prevStep')}
          </button>
        )}
        {currentStep < TOTAL_STEPS - 1 && (
          <button className={`${styles.btnNav} ${styles.btnNext}`} onClick={goNext} type="button">
            {t('nextStep')} →
          </button>
        )}
      </div>
    </div>
  );
}
