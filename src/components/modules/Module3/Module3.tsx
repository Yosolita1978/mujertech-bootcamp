'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import SuccessCriteria from '@/components/SuccessCriteria/SuccessCriteria';
import { rawHtml } from '@/lib/i18n';
import type { NotificationType } from '@/lib/hooks/useNotification';
import styles from './Module3.module.css';

const STORAGE_KEY = 'mujertech_module3_practice';

type GoalId = 'returningClients' | 'newClients' | 'sellProduct' | 'announceNew' | 'beRemembered';
type VoiceId = 'warm' | 'professional' | 'fun';
type FormatId = 'whatsapp' | 'instagram' | 'flyer' | 'story';
type IssueId = 'tooFormal' | 'wrongDiscount' | 'exaggeratedPromise' | 'wrongEmoji' | 'missingTuesday';
type Quiz1Answer = 'verdad' | 'mentira';
type Quiz2Answer = 'A' | 'B';
type Quiz3Answer = 'A' | 'B' | 'C';

type ReviewChecks = {
  soundsLikeMe: boolean;
  speaksToClient: boolean;
  meetsGoal: boolean;
};

type PracticeData = {
  goal: GoalId | null;
  goalDetail: string;
  context: string;
  audience: string;
  voice: VoiceId | null;
  taskFormat: FormatId | null;
  outputDetails: string;
  aiResponseEdited: string;
  reviewChecks: ReviewChecks;
};

const INITIAL_PRACTICE: PracticeData = {
  goal: null,
  goalDetail: '',
  context: '',
  audience: '',
  voice: null,
  taskFormat: null,
  outputDetails: '',
  aiResponseEdited: '',
  reviewChecks: { soundsLikeMe: false, speaksToClient: false, meetsGoal: false },
};

const GOAL_IDS: readonly GoalId[] = [
  'returningClients',
  'newClients',
  'sellProduct',
  'announceNew',
  'beRemembered',
];

const VOICE_IDS: readonly VoiceId[] = ['warm', 'professional', 'fun'];

const FORMAT_IDS: readonly FormatId[] = ['whatsapp', 'instagram', 'flyer', 'story'];

const ISSUE_IDS: readonly IssueId[] = [
  'tooFormal',
  'wrongDiscount',
  'exaggeratedPromise',
  'wrongEmoji',
  'missingTuesday',
];

const CHATGPT_URL = 'https://chatgpt.com/';
const WHATSAPP_URL = 'https://wa.me/';

function loadPractice(): PracticeData {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as Partial<PracticeData>;
      return {
        ...INITIAL_PRACTICE,
        ...parsed,
        reviewChecks: {
          ...INITIAL_PRACTICE.reviewChecks,
          ...(parsed.reviewChecks ?? {}),
        },
      };
    }
  } catch {
    // ignore
  }
  return INITIAL_PRACTICE;
}

function savePractice(data: PracticeData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

type Props = {
  onNext: () => void;
  onPrev: () => void;
  showNotification: (message: string, type?: NotificationType) => void;
  hidePrev: boolean;
  trackEvent?: (eventName: string, eventData?: Record<string, unknown>) => void;
};

export default function Module3({
  onNext,
  onPrev,
  showNotification,
  hidePrev,
  trackEvent,
}: Props) {
  const [practice, setPractice] = useState<PracticeData>(INITIAL_PRACTICE);
  const [showGeneratedPrompt, setShowGeneratedPrompt] = useState(false);
  const [quiz1Answer, setQuiz1Answer] = useState<Quiz1Answer | null>(null);
  const [quiz2Answer, setQuiz2Answer] = useState<Quiz2Answer | null>(null);
  const [quiz3Answer, setQuiz3Answer] = useState<Quiz3Answer | null>(null);
  const [selectedIssues, setSelectedIssues] = useState<readonly IssueId[]>([]);
  const [showCorrected, setShowCorrected] = useState(false);

  const t = useTranslations('module3');
  const tCommon = useTranslations('common');
  const tNotifications = useTranslations('notifications');

  useEffect(() => {
    setPractice(loadPractice());
  }, []);

  const updatePractice = (updater: (prev: PracticeData) => PracticeData) => {
    setPractice((prev) => {
      const next = updater(prev);
      savePractice(next);
      return next;
    });
  };

  const MODULE_OUTCOMES: readonly string[] = [
    t('outcomes.item1'),
    t('outcomes.item2'),
    t('outcomes.item3'),
    t('outcomes.item4'),
  ];

  const handleGoalSelect = (goal: GoalId) => {
    updatePractice((prev) => ({ ...prev, goal }));
    if (trackEvent) {
      trackEvent('module3_goal_selected', { goal });
    }
  };

  const handleGoalDetailChange = (value: string) => {
    updatePractice((prev) => ({ ...prev, goalDetail: value }));
  };

  const handleVoiceSelect = (voice: VoiceId) => {
    updatePractice((prev) => ({ ...prev, voice }));
  };

  const handleFormatSelect = (taskFormat: FormatId) => {
    updatePractice((prev) => ({ ...prev, taskFormat }));
  };

  const handleContextChange = (value: string) => {
    updatePractice((prev) => ({ ...prev, context: value }));
  };

  const handleAudienceChange = (value: string) => {
    updatePractice((prev) => ({ ...prev, audience: value }));
  };

  const handleOutputDetailsChange = (value: string) => {
    updatePractice((prev) => ({ ...prev, outputDetails: value }));
  };

  const handleAiResponseChange = (value: string) => {
    updatePractice((prev) => ({ ...prev, aiResponseEdited: value }));
  };

  const handleToggleCheck = (key: keyof ReviewChecks) => {
    updatePractice((prev) => ({
      ...prev,
      reviewChecks: { ...prev.reviewChecks, [key]: !prev.reviewChecks[key] },
    }));
  };

  const isReadyToBuildPrompt = (): boolean => {
    return (
      practice.goal !== null &&
      practice.voice !== null &&
      practice.taskFormat !== null &&
      practice.context.trim().length > 0 &&
      practice.audience.trim().length > 0
    );
  };

  const buildPromptText = (): string => {
    if (!practice.goal || !practice.voice || !practice.taskFormat) return '';

    const goalPhrase = t(`section1.goalPhrases.${practice.goal}`);
    const voicePhrase = t(`section2.activity.voicePhrases.${practice.voice}`);
    const formatPhrase = t(`section2.activity.formatPhrases.${practice.taskFormat}`);

    const goalDetailFragment = practice.goalDetail.trim()
      ? ` (${practice.goalDetail.trim()})`
      : '';
    const outputDetails =
      practice.outputDetails.trim() || t('section2.activity.promptOutputDefault');

    const contextLine = t('section2.activity.promptContextTemplate', {
      business: practice.context.trim(),
      audience: practice.audience.trim(),
      voicePhrase,
    });

    const taskLine = t('section2.activity.promptTaskTemplate', {
      goalPhrase,
      goalDetail: goalDetailFragment,
      formatPhrase,
    });

    const outputLine = t('section2.activity.promptOutputTemplate', {
      details: outputDetails,
    });

    return `${contextLine}\n\n${taskLine}\n\n${outputLine}`;
  };

  const builtPrompt = buildPromptText();

  const handleGeneratePrompt = () => {
    if (!isReadyToBuildPrompt()) {
      showNotification(t('section2.activity.fillAll'), 'error');
      return;
    }
    setShowGeneratedPrompt(true);
    if (trackEvent) {
      trackEvent('module3_prompt_built', {
        goal: practice.goal,
        voice: practice.voice,
        format: practice.taskFormat,
      });
    }
  };

  const copyText = async (text: string, source: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showNotification(tNotifications('copied'), 'success');
      if (trackEvent) {
        trackEvent('module3_copy', { source });
      }
    } catch {
      showNotification(tNotifications('copyFailed'), 'error');
    }
  };

  const handleQuiz1Answer = (answer: Quiz1Answer) => {
    if (quiz1Answer) return;
    setQuiz1Answer(answer);
    if (trackEvent) {
      trackEvent('module3_section1_quiz_answered', {
        answer,
        correct: answer === 'mentira' ? 'yes' : 'no',
      });
    }
  };

  const handleQuiz2Answer = (answer: Quiz2Answer) => {
    if (quiz2Answer) return;
    setQuiz2Answer(answer);
    if (trackEvent) {
      trackEvent('module3_section2_quiz_answered', {
        answer,
        correct: answer === 'B' ? 'yes' : 'no',
      });
    }
  };

  const handleQuiz3Answer = (answer: Quiz3Answer) => {
    if (quiz3Answer) return;
    setQuiz3Answer(answer);
    if (trackEvent) {
      trackEvent('module3_section3_quiz_answered', {
        answer,
        correct: answer === 'B' ? 'yes' : 'no',
      });
    }
  };

  const handleToggleIssue = (issue: IssueId) => {
    setSelectedIssues((prev) =>
      prev.includes(issue) ? prev.filter((id) => id !== issue) : [...prev, issue]
    );
  };

  const handleShowCorrected = () => {
    setShowCorrected(true);
    if (trackEvent) {
      trackEvent('module3_issues_identified', {
        count: selectedIssues.length,
        issues: selectedIssues.join(','),
      });
    }
  };

  const handleEthicsShare = () => {
    if (trackEvent) {
      trackEvent('module3_ethics_shared');
    }
    const message = encodeURIComponent(t('ethics.shareText'));
    window.open(`${WHATSAPP_URL}?text=${message}`, '_blank');
    showNotification(tNotifications('shareSuccess'), 'success');
  };

  const handleCopyFinalText = () => {
    if (!practice.aiResponseEdited.trim()) {
      showNotification(t('culminating.fillEdited'), 'error');
      return;
    }
    if (trackEvent) {
      trackEvent('module3_culminating_copied');
    }
    void copyText(practice.aiResponseEdited, 'culminating_final');
  };

  const handleSendWhatsApp = () => {
    if (!practice.aiResponseEdited.trim()) {
      showNotification(t('culminating.fillEdited'), 'error');
      return;
    }
    if (trackEvent) {
      trackEvent('module3_culminating_whatsapp_sent');
    }
    const message = encodeURIComponent(practice.aiResponseEdited.trim());
    window.open(`${WHATSAPP_URL}?text=${message}`, '_blank');
  };

  const handleOpenChatGPT = () => {
    if (trackEvent) {
      trackEvent('module3_chatgpt_opened');
    }
    window.open(CHATGPT_URL, '_blank');
  };

  const handleNext = () => {
    if (trackEvent) {
      trackEvent('module3_completed', {
        goalSelected: practice.goal ?? 'none',
        promptBuilt: showGeneratedPrompt ? 'yes' : 'no',
        finalTextLength: practice.aiResponseEdited.trim().length,
      });
    }
    onNext();
  };

  const recapGoalText = practice.goal
    ? `${t(`section1.activity.goals.${practice.goal}`)}${practice.goalDetail.trim() ? ` — ${practice.goalDetail.trim()}` : ''}`
    : '';

  return (
    <div className={styles.moduleContent}>
      {/* Module Header */}
      <header className={styles.moduleHeader}>
        <h1>{t('title')}</h1>
        <p className={styles.moduleSubtitle}>{t('subtitle')}</p>
        <span className={styles.timeBadge}>{t('duration')}</span>
      </header>

      <SuccessCriteria mode="intro" outcomes={MODULE_OUTCOMES} />

      {/* ============================================================ */}
      {/* SECTION 1 — Primero decide qué quieres lograr */}
      {/* ============================================================ */}

      <div className={styles.sectionHeader}>
        <span className={styles.sectionLabel}>{t('section1.sectionLabel')}</span>
        <h2>{t('section1.title')}</h2>
      </div>

      <div className={`${styles.card} ${styles.explanationCard}`}>
        <p className={styles.cardText}>{t('section1.explanation.p1')}</p>
        <p className={styles.cardText}>{t('section1.explanation.p2')}</p>
        <ul className={styles.simpleList}>
          <li>{t('section1.explanation.listItem1')}</li>
          <li>{t('section1.explanation.listItem2')}</li>
          <li>{t('section1.explanation.listItem3')}</li>
          <li>{t('section1.explanation.listItem4')}</li>
          <li>{t('section1.explanation.listItem5')}</li>
        </ul>
        <p className={styles.cardText}>{t('section1.explanation.p3')}</p>
        <p className={styles.cardText}>{t('section1.explanation.p4')}</p>
        <div className={styles.sofiaBox}>
          <p dangerouslySetInnerHTML={rawHtml(t.raw('section1.explanation.sofia'))} />
        </div>
        <p className={styles.cardText} style={{ marginTop: 'var(--spacing-md)' }}>
          {t('section1.explanation.conclusion')}
        </p>
      </div>

      {/* Section 1 Activity */}
      <div className={styles.activityCard}>
        <h2 className={styles.cardTitle}>
          <span className={styles.cardIcon}>🎯</span>
          {t('section1.activity.title')}
        </h2>
        <p className={styles.activityIntro}>{t('section1.activity.intro')}</p>

        <div className={styles.goalsList}>
          {GOAL_IDS.map((goalId) => (
            <button
              key={goalId}
              type="button"
              className={`${styles.goalOption} ${practice.goal === goalId ? styles.selected : ''}`}
              onClick={() => handleGoalSelect(goalId)}
            >
              {t(`section1.activity.goals.${goalId}`)}
            </button>
          ))}
        </div>

        <div className={styles.detailField}>
          <label className={styles.detailLabel} htmlFor="module3-goal-detail">
            {t('section1.activity.detailLabel')}
          </label>
          <input
            id="module3-goal-detail"
            type="text"
            className={styles.detailInput}
            placeholder={t('section1.activity.detailPlaceholder')}
            value={practice.goalDetail}
            onChange={(e) => handleGoalDetailChange(e.target.value)}
          />
        </div>

        {practice.goal && (
          <div className={styles.savedHint}>{t('section1.activity.savedLabel')}</div>
        )}
      </div>

      {/* Section 1 Quiz */}
      <div className={styles.activityCard}>
        <h2 className={styles.cardTitle}>
          <span className={styles.cardIcon}>✅</span>
          {t('section1.quiz.title')}
        </h2>
        <div className={styles.quizSimple}>
          <div className={styles.quizQuestionItem}>
            <p className={styles.quizStatement}>{t('section1.quiz.statement')}</p>
            <div className={styles.quizButtons}>
              <button
                type="button"
                className={`${styles.quizBtn} ${quiz1Answer ? styles.disabled : ''}`}
                onClick={() => handleQuiz1Answer('verdad')}
                disabled={quiz1Answer !== null}
              >
                {t('section1.quiz.truth')}
              </button>
              <button
                type="button"
                className={`${styles.quizBtn} ${quiz1Answer ? styles.disabled : ''}`}
                onClick={() => handleQuiz1Answer('mentira')}
                disabled={quiz1Answer !== null}
              >
                {t('section1.quiz.lie')}
              </button>
            </div>
            {quiz1Answer && (
              <div className={styles.quizFeedback}>
                {quiz1Answer === 'mentira' ? (
                  <div className={styles.feedbackCorrect}>
                    <span className={styles.feedbackIcon}>✅</span>
                    <p>{t('section1.quiz.correct')}</p>
                  </div>
                ) : (
                  <div className={styles.feedbackIncorrect}>
                    <span className={styles.feedbackIcon}>❌</span>
                    <p
                      dangerouslySetInnerHTML={rawHtml(
                        t.raw('section1.quiz.incorrectExplanation')
                      )}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SECTION 2 — Convierte tu meta en un prompt con CTO */}
      {/* ============================================================ */}

      <div className={styles.sectionHeader}>
        <span className={styles.sectionLabel}>{t('section2.sectionLabel')}</span>
        <h2>{t('section2.title')}</h2>
      </div>

      <div className={`${styles.card} ${styles.explanationCard}`}>
        <p
          className={styles.cardText}
          dangerouslySetInnerHTML={rawHtml(t.raw('section2.explanation.intro1'))}
        />
        <p
          className={styles.cardText}
          dangerouslySetInnerHTML={rawHtml(t.raw('section2.explanation.intro2'))}
        />

        {/* CTO refresher panel */}
        <div className={styles.ctoPanel}>
          <div className={styles.ctoPanelTitle}>{t('section2.cto.title')}</div>
          <div className={styles.ctoRow}>
            <div className={styles.ctoLetter}>{t('section2.cto.cLetter')}</div>
            <div className={styles.ctoText}>
              <div className={styles.ctoName}>{t('section2.cto.cName')}</div>
              <div className={styles.ctoDesc}>{t('section2.cto.cDesc')}</div>
            </div>
          </div>
          <div className={styles.ctoRow}>
            <div className={styles.ctoLetter}>{t('section2.cto.tLetter')}</div>
            <div className={styles.ctoText}>
              <div className={styles.ctoName}>{t('section2.cto.tName')}</div>
              <div className={styles.ctoDesc}>{t('section2.cto.tDesc')}</div>
            </div>
          </div>
          <div className={styles.ctoRow}>
            <div className={styles.ctoLetter}>{t('section2.cto.oLetter')}</div>
            <div className={styles.ctoText}>
              <div className={styles.ctoName}>{t('section2.cto.oName')}</div>
              <div className={styles.ctoDesc}>{t('section2.cto.oDesc')}</div>
            </div>
          </div>
        </div>

        <p className={styles.cardText}>{t('section2.explanation.transition')}</p>
        <p
          className={styles.cardText}
          dangerouslySetInnerHTML={rawHtml(t.raw('section2.explanation.audience'))}
        />
        <p
          className={styles.cardText}
          dangerouslySetInnerHTML={rawHtml(t.raw('section2.explanation.voice'))}
        />
        <p className={styles.cardText}>{t('section2.explanation.sofiaIntro')}</p>

        <div className={styles.sofiaPromptBox}>
          <div className={styles.sofiaPromptPart}>
            <div className={styles.sofiaPromptLabel}>
              {t('section2.explanation.sofiaContextLabel')}
            </div>
            <div className={styles.sofiaPromptText}>{t('section2.explanation.sofiaContext')}</div>
          </div>
          <div className={styles.sofiaPromptPart}>
            <div className={styles.sofiaPromptLabel}>
              {t('section2.explanation.sofiaTaskLabel')}
            </div>
            <div className={styles.sofiaPromptText}>{t('section2.explanation.sofiaTask')}</div>
          </div>
          <div className={styles.sofiaPromptPart}>
            <div className={styles.sofiaPromptLabel}>
              {t('section2.explanation.sofiaOutputLabel')}
            </div>
            <div className={styles.sofiaPromptText}>{t('section2.explanation.sofiaOutput')}</div>
          </div>
        </div>

        <p className={styles.cardText} style={{ marginTop: 'var(--spacing-md)' }}>
          {t('section2.explanation.conclusion')}
        </p>
      </div>

      {/* Section 2 Activity — Prompt builder */}
      <div className={styles.activityCard}>
        <h2 className={styles.cardTitle}>
          <span className={styles.cardIcon}>✨</span>
          {t('section2.activity.title')}
        </h2>
        <p className={styles.activityIntro}>{t('section2.activity.intro')}</p>

        <div className={styles.promptBuilder}>
          {/* Block 1: Context */}
          <div className={styles.builderBlock}>
            <div className={styles.builderBlockLabel}>
              <span className={styles.builderBlockNumber}>1</span>
              {t('section2.activity.contextBlockLabel')}
            </div>

            <div className={styles.builderField}>
              <label
                className={styles.builderFieldLabel}
                htmlFor="module3-business"
              >
                {t('section2.activity.businessLabel')}
              </label>
              <input
                id="module3-business"
                type="text"
                className={styles.builderInput}
                placeholder={t('section2.activity.businessPlaceholder')}
                value={practice.context}
                onChange={(e) => handleContextChange(e.target.value)}
              />
            </div>

            <div className={styles.builderField}>
              <label
                className={styles.builderFieldLabel}
                htmlFor="module3-audience"
              >
                {t('section2.activity.audienceLabel')}
              </label>
              <input
                id="module3-audience"
                type="text"
                className={styles.builderInput}
                placeholder={t('section2.activity.audiencePlaceholder')}
                value={practice.audience}
                onChange={(e) => handleAudienceChange(e.target.value)}
              />
            </div>

            <div className={styles.builderField}>
              <span className={styles.builderFieldLabel}>
                {t('section2.activity.voiceLabel')}
              </span>
              <div className={styles.builderOptions}>
                {VOICE_IDS.map((voiceId) => (
                  <button
                    key={voiceId}
                    type="button"
                    className={`${styles.builderOption} ${practice.voice === voiceId ? styles.selected : ''}`}
                    onClick={() => handleVoiceSelect(voiceId)}
                  >
                    {t(`section2.activity.voices.${voiceId}`)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Block 2: Task */}
          <div className={styles.builderBlock}>
            <div className={styles.builderBlockLabel}>
              <span className={styles.builderBlockNumber}>2</span>
              {t('section2.activity.taskBlockLabel')}
            </div>
            <div className={styles.builderField}>
              <span className={styles.builderFieldLabel}>
                {t('section2.activity.taskIntro')}
              </span>
              <div className={styles.builderOptions}>
                {FORMAT_IDS.map((formatId) => (
                  <button
                    key={formatId}
                    type="button"
                    className={`${styles.builderOption} ${practice.taskFormat === formatId ? styles.selected : ''}`}
                    onClick={() => handleFormatSelect(formatId)}
                  >
                    {t(`section2.activity.formats.${formatId}`)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Block 3: Output */}
          <div className={styles.builderBlock}>
            <div className={styles.builderBlockLabel}>
              <span className={styles.builderBlockNumber}>3</span>
              {t('section2.activity.outputBlockLabel')}
            </div>
            <div className={styles.builderField}>
              <label
                className={styles.builderFieldLabel}
                htmlFor="module3-output-details"
              >
                {t('section2.activity.outputLabel')}
              </label>
              <input
                id="module3-output-details"
                type="text"
                className={styles.builderInput}
                placeholder={t('section2.activity.outputPlaceholder')}
                value={practice.outputDetails}
                onChange={(e) => handleOutputDetailsChange(e.target.value)}
              />
            </div>
          </div>

          <button
            type="button"
            className={styles.btnGenerate}
            onClick={handleGeneratePrompt}
          >
            {t('section2.activity.generateButton')}
          </button>

          {showGeneratedPrompt && builtPrompt && (
            <div className={styles.generatedPrompt}>
              <p className={styles.generatedLabel}>{t('section2.activity.resultLabel')}</p>
              <div className={styles.generatedText}>{builtPrompt}</div>
              <div className={styles.generatedActions}>
                <button
                  type="button"
                  className={styles.btnCopy}
                  onClick={() => void copyText(builtPrompt, 'built_prompt')}
                >
                  {t('section2.activity.copyButton')}
                </button>
                <button
                  type="button"
                  className={styles.btnOpenChatGPT}
                  onClick={handleOpenChatGPT}
                >
                  {t('section2.activity.openChatGPTButton')}
                </button>
              </div>
              <p
                className={styles.savedHint}
                style={{ marginTop: 'var(--spacing-md)' }}
              >
                {t('section2.activity.savedLabel')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Section 2 Quiz */}
      <div className={styles.activityCard}>
        <h2 className={styles.cardTitle}>
          <span className={styles.cardIcon}>✅</span>
          {t('section2.quiz.title')}
        </h2>
        <div className={styles.quizQuestionItem}>
          <p className={styles.quizQuestion}>{t('section2.quiz.question')}</p>
          <div className={styles.quizMcOptions}>
            <button
              type="button"
              className={`${styles.quizMcOption} ${
                quiz2Answer
                  ? `${styles.disabled} ${quiz2Answer === 'A' ? styles.wrongAnswer : ''}`
                  : ''
              }`}
              onClick={() => handleQuiz2Answer('A')}
              disabled={quiz2Answer !== null}
            >
              {t('section2.quiz.optionA')}
            </button>
            <button
              type="button"
              className={`${styles.quizMcOption} ${
                quiz2Answer ? `${styles.disabled} ${styles.correctAnswer}` : ''
              }`}
              onClick={() => handleQuiz2Answer('B')}
              disabled={quiz2Answer !== null}
            >
              {t('section2.quiz.optionB')}
            </button>
          </div>
          {quiz2Answer && (
            <div className={styles.quizFeedback}>
              {quiz2Answer === 'B' ? (
                <div className={styles.feedbackCorrect}>
                  <span className={styles.feedbackIcon}>✅</span>
                  <p>{t('section2.quiz.correct')}</p>
                </div>
              ) : (
                <div className={styles.feedbackIncorrect}>
                  <span className={styles.feedbackIcon}>❌</span>
                  <p>{t('section2.quiz.incorrectExplanation')}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* SECTION 3 — Revisa antes de publicar */}
      {/* ============================================================ */}

      <div className={styles.sectionHeader}>
        <span className={styles.sectionLabel}>{t('section3.sectionLabel')}</span>
        <h2>{t('section3.title')}</h2>
      </div>

      <div className={`${styles.card} ${styles.explanationCard}`}>
        <p className={styles.cardText}>{t('section3.explanation.intro1')}</p>
        <p className={styles.cardText}>{t('section3.explanation.intro2')}</p>

        <div className={styles.sofiaBox}>
          <p>
            <strong>{t('section3.explanation.q1Title')}</strong>{' '}
            {t('section3.explanation.q1Text')}
          </p>
        </div>
        <div className={styles.sofiaBox}>
          <p>
            <strong>{t('section3.explanation.q2Title')}</strong>{' '}
            {t('section3.explanation.q2Text')}
          </p>
        </div>
        <div className={styles.sofiaBox}>
          <p>
            <strong>{t('section3.explanation.q3Title')}</strong>{' '}
            {t('section3.explanation.q3Text')}
          </p>
        </div>

        <p className={styles.cardText} style={{ marginTop: 'var(--spacing-md)' }}>
          {t('section3.explanation.commonFixesIntro')}
        </p>
        <ul className={styles.simpleList}>
          <li dangerouslySetInnerHTML={rawHtml(t.raw('section3.explanation.fix1'))} />
          <li dangerouslySetInnerHTML={rawHtml(t.raw('section3.explanation.fix2'))} />
          <li dangerouslySetInnerHTML={rawHtml(t.raw('section3.explanation.fix3'))} />
        </ul>

        <p className={styles.cardText}>{t('section3.explanation.conclusion')}</p>
      </div>

      {/* Section 3 Activity — Issue picker */}
      <div className={styles.activityCard}>
        <h2 className={styles.cardTitle}>
          <span className={styles.cardIcon}>🔍</span>
          {t('section3.activity.title')}
        </h2>
        <p className={styles.activityIntro}>{t('section3.activity.intro')}</p>

        <div className={styles.aiBadExample}>
          <p>{t('section3.activity.aiExample')}</p>
        </div>

        <p className={styles.issuesInstruction}>{t('section3.activity.instruction')}</p>

        <div className={styles.issuesList}>
          {ISSUE_IDS.map((issueId) => (
            <button
              key={issueId}
              type="button"
              className={`${styles.issueOption} ${selectedIssues.includes(issueId) ? styles.selected : ''}`}
              onClick={() => handleToggleIssue(issueId)}
            >
              {t(`section3.activity.issues.${issueId}`)}
            </button>
          ))}
        </div>

        {!showCorrected ? (
          <button
            type="button"
            className={styles.btnGenerate}
            onClick={handleShowCorrected}
          >
            {t('section3.activity.showCorrectedButton')}
          </button>
        ) : (
          <div className={styles.correctedBox}>
            <div className={styles.correctedLabel}>
              {t('section3.activity.correctedLabel')}
            </div>
            <p className={styles.correctedText}>{t('section3.activity.correctedExample')}</p>
          </div>
        )}
      </div>

      {/* Section 3 Quiz */}
      <div className={styles.activityCard}>
        <h2 className={styles.cardTitle}>
          <span className={styles.cardIcon}>✅</span>
          {t('section3.quiz.title')}
        </h2>
        <div className={styles.quizQuestionItem}>
          <p className={styles.quizQuestion}>{t('section3.quiz.question')}</p>
          <div className={styles.quizMcOptions}>
            <button
              type="button"
              className={`${styles.quizMcOption} ${
                quiz3Answer
                  ? `${styles.disabled} ${quiz3Answer === 'A' ? styles.wrongAnswer : ''}`
                  : ''
              }`}
              onClick={() => handleQuiz3Answer('A')}
              disabled={quiz3Answer !== null}
            >
              {t('section3.quiz.optionA')}
            </button>
            <button
              type="button"
              className={`${styles.quizMcOption} ${
                quiz3Answer ? `${styles.disabled} ${styles.correctAnswer}` : ''
              }`}
              onClick={() => handleQuiz3Answer('B')}
              disabled={quiz3Answer !== null}
            >
              {t('section3.quiz.optionB')}
            </button>
            <button
              type="button"
              className={`${styles.quizMcOption} ${
                quiz3Answer
                  ? `${styles.disabled} ${quiz3Answer === 'C' ? styles.wrongAnswer : ''}`
                  : ''
              }`}
              onClick={() => handleQuiz3Answer('C')}
              disabled={quiz3Answer !== null}
            >
              {t('section3.quiz.optionC')}
            </button>
          </div>
          {quiz3Answer && (
            <div className={styles.quizFeedback}>
              {quiz3Answer === 'B' ? (
                <div className={styles.feedbackCorrect}>
                  <span className={styles.feedbackIcon}>✅</span>
                  <p>{t('section3.quiz.correct')}</p>
                </div>
              ) : (
                <div className={styles.feedbackIncorrect}>
                  <span className={styles.feedbackIcon}>❌</span>
                  <p>{t('section3.quiz.incorrectExplanation')}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* ETHICS REFLECTION (compact) */}
      {/* ============================================================ */}

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
          type="button"
          className={styles.btnWhatsapp}
          onClick={handleEthicsShare}
        >
          <span className={styles.whatsappIcon}>📱</span>
          {t('ethics.shareButton')}
        </button>
      </div>

      {/* ============================================================ */}
      {/* CULMINATING TASK */}
      {/* ============================================================ */}

      <div className={styles.culminatingCard}>
        <h2 className={styles.cardTitle}>
          <span className={styles.cardIcon}>🚀</span>
          {t('culminating.title')}
        </h2>
        <p className={styles.culminatingIntro}>{t('culminating.intro')}</p>

        <div className={styles.recapBox}>
          <div className={styles.recapTitle}>{t('culminating.recapTitle')}</div>
          <div className={styles.recapItem}>
            <div className={styles.recapLabel}>{t('culminating.recapGoalLabel')}</div>
            {recapGoalText ? (
              <div className={styles.recapValue}>{recapGoalText}</div>
            ) : (
              <div className={`${styles.recapValue} ${styles.recapEmpty}`}>
                {t('culminating.recapEmpty')}
              </div>
            )}
          </div>
          <div className={styles.recapItem}>
            <div className={styles.recapLabel}>{t('culminating.recapPromptLabel')}</div>
            {builtPrompt ? (
              <div className={styles.recapValue}>{builtPrompt}</div>
            ) : (
              <div className={`${styles.recapValue} ${styles.recapEmpty}`}>
                {t('culminating.recapEmpty')}
              </div>
            )}
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel} htmlFor="module3-ai-response">
            {t('culminating.pasteLabel')}
          </label>
          <textarea
            id="module3-ai-response"
            className={styles.textarea}
            placeholder={t('culminating.pastePlaceholder')}
            value={practice.aiResponseEdited}
            onChange={(e) => handleAiResponseChange(e.target.value)}
            rows={6}
          />
        </div>

        <div className={styles.checksList}>
          <div className={styles.checksTitle}>{t('culminating.checksTitle')}</div>
          <button
            type="button"
            className={styles.checkRow}
            onClick={() => handleToggleCheck('soundsLikeMe')}
          >
            <span
              className={`${styles.checkBox} ${practice.reviewChecks.soundsLikeMe ? styles.checked : ''}`}
            >
              {practice.reviewChecks.soundsLikeMe ? '✓' : ''}
            </span>
            <span className={styles.checkLabel}>{t('culminating.checkSoundsLikeMe')}</span>
          </button>
          <button
            type="button"
            className={styles.checkRow}
            onClick={() => handleToggleCheck('speaksToClient')}
          >
            <span
              className={`${styles.checkBox} ${practice.reviewChecks.speaksToClient ? styles.checked : ''}`}
            >
              {practice.reviewChecks.speaksToClient ? '✓' : ''}
            </span>
            <span className={styles.checkLabel}>{t('culminating.checkSpeaksToClient')}</span>
          </button>
          <button
            type="button"
            className={styles.checkRow}
            onClick={() => handleToggleCheck('meetsGoal')}
          >
            <span
              className={`${styles.checkBox} ${practice.reviewChecks.meetsGoal ? styles.checked : ''}`}
            >
              {practice.reviewChecks.meetsGoal ? '✓' : ''}
            </span>
            <span className={styles.checkLabel}>{t('culminating.checkMeetsGoal')}</span>
          </button>
        </div>

        <div className={styles.culminatingActions}>
          <button
            type="button"
            className={styles.btnCopy}
            onClick={handleCopyFinalText}
          >
            {t('culminating.copyButton')}
          </button>
          <button
            type="button"
            className={styles.btnWhatsapp}
            onClick={handleSendWhatsApp}
          >
            <span className={styles.whatsappIcon}>💬</span>
            {t('culminating.sendWhatsAppButton')}
          </button>
        </div>
      </div>

      <SuccessCriteria mode="completion" completionText={t('completion')} />

      {/* Navigation */}
      <div className={styles.navButtons}>
        {!hidePrev && (
          <button
            type="button"
            className={`${styles.btnNav} ${styles.btnPrev}`}
            onClick={onPrev}
          >
            ← {tCommon('previous')}
          </button>
        )}
        <button
          type="button"
          className={`${styles.btnNav} ${styles.btnNext}`}
          onClick={handleNext}
        >
          {tCommon('next')} →
        </button>
      </div>
    </div>
  );
}
