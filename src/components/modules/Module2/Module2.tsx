'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import SuccessCriteria from '@/components/SuccessCriteria/SuccessCriteria';
import { rawHtml } from '@/lib/i18n';
import type { NotificationType } from '@/lib/hooks/useNotification';
import styles from './Module2.module.css';

type NeedId = 'social' | 'mensaje' | 'nombre';
type ToneId = 'amigable' | 'profesional' | 'divertido';

type Props = {
  onNext: () => void;
  onPrev: () => void;
  showNotification: (message: string, type?: NotificationType) => void;
  hidePrev: boolean;
  trackEvent?: (eventName: string, eventData?: Record<string, unknown>) => void;
};

export default function Module2({
  onNext,
  onPrev,
  showNotification,
  hidePrev,
  trackEvent,
}: Props) {
  const [business, setBusiness] = useState('');
  const [selectedNeed, setSelectedNeed] = useState<NeedId | null>(null);
  const [selectedTone, setSelectedTone] = useState<ToneId | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [showGenerated, setShowGenerated] = useState(false);

  const t = useTranslations('module2');
  const tCommon = useTranslations('common');
  const tNotifications = useTranslations('notifications');

  const NEED_OPTIONS: ReadonlyArray<{ id: NeedId; icon: string; label: string }> = [
    { id: 'social', icon: '📱', label: t('yourTurn.needs.social') },
    { id: 'mensaje', icon: '📧', label: t('yourTurn.needs.message') },
    { id: 'nombre', icon: '🏷️', label: t('yourTurn.needs.names') },
  ];

  const TONE_OPTIONS: ReadonlyArray<{ id: ToneId; icon: string; label: string }> = [
    { id: 'amigable', icon: '😊', label: t('yourTurn.tones.friendly') },
    { id: 'profesional', icon: '👔', label: t('yourTurn.tones.professional') },
    { id: 'divertido', icon: '🎉', label: t('yourTurn.tones.fun') },
  ];

  const NEED_TEXT_KEYS: Record<NeedId, 'socialText' | 'messageText' | 'namesText'> = {
    social: 'socialText',
    mensaje: 'messageText',
    nombre: 'namesText',
  };

  const TONE_TEXT_KEYS: Record<ToneId, 'friendlyText' | 'professionalText' | 'funText'> = {
    amigable: 'friendlyText',
    profesional: 'professionalText',
    divertido: 'funText',
  };

  const MODULE_OUTCOMES = [t('outcomes.item1'), t('outcomes.item2')];

  const copyToClipboard = async (text: string, source: string) => {
    if (trackEvent) {
      trackEvent('copy_clicked', { module: 'module2', source });
    }
    try {
      await navigator.clipboard.writeText(text);
      showNotification(tNotifications('copied'), 'success');
      if (trackEvent) {
        trackEvent('copy_success', { module: 'module2', source });
      }
    } catch {
      showNotification(tNotifications('copyFailed'), 'error');
      if (trackEvent) {
        trackEvent('copy_failed', { module: 'module2', source });
      }
    }
  };

  const handleGeneratePrompt = () => {
    if (!business.trim()) {
      showNotification(tNotifications('fillBusiness'), 'error');
      return;
    }
    if (!selectedNeed) {
      showNotification(tNotifications('fillNeed'), 'error');
      return;
    }
    if (!selectedTone) {
      showNotification(tNotifications('fillTone'), 'error');
      return;
    }

    const prompt = t('yourTurn.promptTemplate', {
      business: business.trim(),
      need: t(`yourTurn.needs.${NEED_TEXT_KEYS[selectedNeed]}`),
      tone: t(`yourTurn.tones.${TONE_TEXT_KEYS[selectedTone]}`),
    });

    setGeneratedPrompt(prompt);
    setShowGenerated(true);
    showNotification(tNotifications('promptReady'), 'success');

    if (trackEvent) {
      trackEvent('prompt_generated', {
        module: 'module2',
        need: selectedNeed,
        tone: selectedTone,
      });
    }
  };

  const handleWhatsAppShare = () => {
    if (trackEvent) {
      trackEvent('whatsapp_share', { module: 'module2' });
    }
    const message = encodeURIComponent(
      `${t('ethics.shareIntro')}\n\n${t('ethics.shareText')}\n\n${t('ethics.shareOutro')}`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
    showNotification(tNotifications('shareSuccess'), 'success');
  };

  const handleNext = () => {
    if (trackEvent) {
      trackEvent('module2_completed', {
        promptGenerated: showGenerated ? 'yes' : 'no',
        need: selectedNeed || 'none',
        tone: selectedTone || 'none',
      });
    }
    onNext();
  };

  return (
    <div className={styles.moduleContent}>
      {/* Module Header */}
      <header className={styles.moduleHeader}>
        <h1>{t('title')}</h1>
        <p className={styles.moduleSubtitle}>{t('subtitle')}</p>
        <span className={styles.timeBadge}>{t('duration')}</span>
      </header>

      {/* Success Criteria - Intro */}
      <SuccessCriteria mode="intro" outcomes={MODULE_OUTCOMES} />

      {/* What is a Prompt */}
      <div className={`${styles.card} ${styles.explanationCard}`}>
        <div className={styles.bigIcon}>💬</div>
        <h2 className={styles.cardTitle}>{t('whatIsPrompt.title')}</h2>
        <p className={styles.cardText} dangerouslySetInnerHTML={rawHtml(t.raw('whatIsPrompt.text1'))} />
        <p className={styles.cardText}>{t('whatIsPrompt.text2')}</p>
        <div className={styles.exampleBox}>
          <p className={styles.exampleLabel}>{t('whatIsPrompt.exampleLabel')}</p>
          <p className={styles.exampleText}>{t('whatIsPrompt.exampleText')}</p>
        </div>
      </div>

      {/* Golden Rule */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>
          <span className={styles.cardIcon}>🔑</span>
          {t('goldenRule.title')}
        </h2>
        <div className={styles.goldenRule}>
          <p className={styles.ruleText}>{t('goldenRule.text')}</p>
        </div>
        <div className={styles.comparisonBox}>
          <div className={`${styles.comparisonItem} ${styles.bad}`}>
            <span className={styles.comparisonIcon}>❌</span>
            <p>
              <strong>{t('goldenRule.bad')}</strong> {t('goldenRule.badExample')}
            </p>
          </div>
          <div className={`${styles.comparisonItem} ${styles.good}`}>
            <span className={styles.comparisonIcon}>✅</span>
            <p>
              <strong>{t('goldenRule.good')}</strong> {t('goldenRule.goodExample')}
            </p>
          </div>
        </div>
      </div>

      {/* 4-Step Method */}
      <div className={`${styles.card} ${styles.methodCard}`}>
        <h2 className={styles.cardTitle}>
          <span className={styles.cardIcon}>📝</span>
          {t('method.title')}
        </h2>
        <p className={styles.cardText}>{t('method.intro')}</p>
        <div className={styles.methodSteps}>
          <div className={styles.methodStep}>
            <div className={styles.stepHeader}>
              <span className={styles.stepNumber}>1</span>
              <span className={styles.stepTitle}>{t('method.step1.title')}</span>
            </div>
            <p>{t('method.step1.description')}</p>
            <div className={styles.stepExample}>{t('method.step1.example')}</div>
          </div>
          <div className={styles.methodStep}>
            <div className={styles.stepHeader}>
              <span className={styles.stepNumber}>2</span>
              <span className={styles.stepTitle}>{t('method.step2.title')}</span>
            </div>
            <p>{t('method.step2.description')}</p>
            <div className={styles.stepExample}>{t('method.step2.example')}</div>
          </div>
          <div className={styles.methodStep}>
            <div className={styles.stepHeader}>
              <span className={styles.stepNumber}>3</span>
              <span className={styles.stepTitle}>{t('method.step3.title')}</span>
            </div>
            <p>{t('method.step3.description')}</p>
            <div className={styles.stepExample}>{t('method.step3.example')}</div>
          </div>
          <div className={styles.methodStep}>
            <div className={styles.stepHeader}>
              <span className={styles.stepNumber}>4</span>
              <span className={styles.stepTitle}>{t('method.step4.title')}</span>
            </div>
            <p>{t('method.step4.description')}</p>
            <div className={styles.stepExample}>{t('method.step4.example')}</div>
          </div>
        </div>
      </div>

      {/* María Case Study */}
      <div className={styles.caseStudy}>
        <div className={styles.caseHeader}>
          <span className={styles.caseIcon}>👩</span>
          <div>
            <h2>{t('maria.title')}</h2>
            <p>{t('maria.subtitle')}</p>
          </div>
        </div>

        <div className={styles.caseStep}>
          <h3>
            <span className={styles.caseStepNumber}>1</span>
            {t('maria.step1.title')}
          </h3>
          <div className={styles.mariaIntro}>
            <p dangerouslySetInnerHTML={rawHtml(t.raw('maria.step1.text1'))} />
            <p dangerouslySetInnerHTML={rawHtml(t.raw('maria.step1.text2'))} />
            <p>{t('maria.step1.text3')}</p>
            <p
              className={styles.mariaProblem}
              dangerouslySetInnerHTML={rawHtml(t.raw('maria.step1.problem'))}
            />
          </div>
        </div>

        <div className={styles.caseStep}>
          <h3>
            <span className={styles.caseStepNumber}>2</span>
            {t('maria.step2.title')}
          </h3>
          <div className={styles.mariaThinking}>
            <div className={styles.thinkingItem}>
              <span className={styles.check}>✅</span>
              <p dangerouslySetInnerHTML={rawHtml(t.raw('maria.step2.what'))} />
            </div>
            <div className={styles.thinkingItem}>
              <span className={styles.check}>✅</span>
              <p dangerouslySetInnerHTML={rawHtml(t.raw('maria.step2.need'))} />
            </div>
            <div className={styles.thinkingItem}>
              <span className={styles.check}>✅</span>
              <p dangerouslySetInnerHTML={rawHtml(t.raw('maria.step2.how'))} />
            </div>
            <div className={styles.thinkingItem}>
              <span className={styles.check}>✅</span>
              <p dangerouslySetInnerHTML={rawHtml(t.raw('maria.step2.tone'))} />
            </div>
          </div>
        </div>

        <div className={styles.caseStep}>
          <h3>
            <span className={styles.caseStepNumber}>3</span>
            {t('maria.step3.title')}
          </h3>
          <div className={styles.promptDisplay}>
            <p className={styles.promptLabel}>{t('maria.step3.label')}</p>
            <div className={styles.promptBox}>{t('maria.prompt')}</div>
            <button
              className={styles.btnCopy}
              onClick={() => copyToClipboard(t('maria.prompt'), 'maria_example')}
              type="button"
            >
              {t('maria.step3.copyButton')}
            </button>
          </div>
        </div>

        <div className={styles.caseStep}>
          <h3>
            <span className={styles.caseStepNumber}>4</span>
            {t('maria.step4.title')}
          </h3>
          <div className={styles.aiResponse}>
            <p className={styles.responseLabel}>{t('maria.step4.label')}</p>
            <div className={styles.responseOptions}>
              <div className={styles.responseOption}>
                <p dangerouslySetInnerHTML={rawHtml(t.raw('maria.step4.option1Label'))} />
                <p>{t('maria.step4.option1Text')}</p>
              </div>
              <div className={styles.responseOption}>
                <p dangerouslySetInnerHTML={rawHtml(t.raw('maria.step4.option2Label'))} />
                <p>{t('maria.step4.option2Text')}</p>
              </div>
              <div className={styles.responseOption}>
                <p dangerouslySetInnerHTML={rawHtml(t.raw('maria.step4.option3Label'))} />
                <p>{t('maria.step4.option3Text')}</p>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.caseResult}>
          <div className={styles.resultIcon}>🎉</div>
          <h3>{t('maria.result.title')}</h3>
          <div className={styles.resultStats}>
            <div className={styles.stat}>
              <span className={styles.statValue}>{t('maria.result.time')}</span>
              <span className={styles.statLabel}>{t('maria.result.timeLabel')}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>{t('maria.result.alone')}</span>
              <span className={styles.statLabel}>{t('maria.result.aloneLabel')}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>{t('maria.result.options')}</span>
              <span className={styles.statLabel}>{t('maria.result.optionsLabel')}</span>
            </div>
          </div>
          <p className={styles.resultNote}>{t('maria.result.note')}</p>
        </div>
      </div>

      {/* Your Turn: Prompt Builder */}
      <div className={styles.yourTurnCard}>
        <h2 className={styles.cardTitle}>
          <span className={styles.cardIcon}>🎯</span>
          {t('yourTurn.title')}
        </h2>
        <p className={styles.cardText}>{t('yourTurn.intro')}</p>

        <div className={styles.promptBuilder}>
          <div className={styles.builderStep}>
            <label className={styles.builderLabel}>
              <span className={styles.builderNumber}>1</span>
              {t('yourTurn.step1Label')}
            </label>
            <input
              type="text"
              className={styles.builderInput}
              placeholder={t('yourTurn.step1Placeholder')}
              value={business}
              onChange={(e) => setBusiness(e.target.value)}
            />
          </div>

          <div className={styles.builderStep}>
            <label className={styles.builderLabel}>
              <span className={styles.builderNumber}>2</span>
              {t('yourTurn.step2Label')}
            </label>
            <div className={styles.builderOptions}>
              {NEED_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  className={`${styles.builderOption} ${selectedNeed === option.id ? styles.selected : ''}`}
                  onClick={() => setSelectedNeed(option.id)}
                  type="button"
                >
                  {option.icon} {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.builderStep}>
            <label className={styles.builderLabel}>
              <span className={styles.builderNumber}>3</span>
              {t('yourTurn.step3Label')}
            </label>
            <div className={styles.builderOptions}>
              {TONE_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  className={`${styles.builderOption} ${selectedTone === option.id ? styles.selected : ''}`}
                  onClick={() => setSelectedTone(option.id)}
                  type="button"
                >
                  {option.icon} {option.label}
                </button>
              ))}
            </div>
          </div>

          <button className={styles.btnGenerate} onClick={handleGeneratePrompt} type="button">
            {t('yourTurn.generateButton')}
          </button>

          {showGenerated && (
            <div className={styles.generatedPrompt}>
              <p className={styles.generatedLabel}>{t('yourTurn.resultLabel')}</p>
              <div className={styles.generatedText}>{generatedPrompt}</div>
              <button
                className={styles.btnCopy}
                onClick={() => copyToClipboard(generatedPrompt, 'user_prompt')}
                type="button"
              >
                {t('yourTurn.copyButton')}
              </button>
              <div className={styles.nextStepHint}>
                <p dangerouslySetInnerHTML={rawHtml(t.raw('yourTurn.nextStepHint'))} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tools Section Divider */}
      <div className={styles.sectionDivider}>
        <span className={styles.dividerIcon}>🛠️</span>
        <h2>{t('tools.dividerTitle')}</h2>
        <p>{t('tools.dividerSubtitle')}</p>
      </div>

      {/* ChatGPT Tool Card */}
      <div className={`${styles.card} ${styles.toolCard}`}>
        <div className={styles.toolHeader}>
          <span className={styles.toolIcon}>💬</span>
          <div>
            <h2>{t('tools.chatgpt.title')}</h2>
            <span className={styles.toolPrice}>{t('tools.chatgpt.price')}</span>
          </div>
        </div>
        <p dangerouslySetInnerHTML={rawHtml(t.raw('tools.chatgpt.what'))} />
        <p dangerouslySetInnerHTML={rawHtml(t.raw('tools.chatgpt.forWhat'))} />
        <ul className={styles.toolUses}>
          <li>{t('tools.chatgpt.use1')}</li>
          <li>{t('tools.chatgpt.use2')}</li>
          <li>{t('tools.chatgpt.use3')}</li>
          <li>{t('tools.chatgpt.use4')}</li>
        </ul>
        <p dangerouslySetInnerHTML={rawHtml(t.raw('tools.chatgpt.howTo'))} />
        <ol className={styles.toolSteps}>
          <li>
            {t.rich('tools.chatgpt.step1', {
              strong: (chunks) => <strong>{chunks}</strong>,
              link: (chunks) => (
                <a href="https://chatgpt.com/" target="_blank" rel="noopener noreferrer">
                  {chunks}
                </a>
              ),
            })}
          </li>
          <li>{t('tools.chatgpt.step2')}</li>
          <li>{t('tools.chatgpt.step3')}</li>
        </ol>
      </div>

      {/* Canva Tool Card */}
      <div className={`${styles.card} ${styles.toolCard}`}>
        <div className={styles.toolHeader}>
          <span className={styles.toolIcon}>🎨</span>
          <div>
            <h2>{t('tools.canva.title')}</h2>
            <span className={styles.toolPrice}>{t('tools.canva.price')}</span>
          </div>
        </div>
        <p dangerouslySetInnerHTML={rawHtml(t.raw('tools.canva.what'))} />
        <p dangerouslySetInnerHTML={rawHtml(t.raw('tools.canva.forWhat'))} />
        <ul className={styles.toolUses}>
          <li>{t('tools.canva.use1')}</li>
          <li>{t('tools.canva.use2')}</li>
          <li>{t('tools.canva.use3')}</li>
          <li>{t('tools.canva.use4')}</li>
        </ul>
        <p dangerouslySetInnerHTML={rawHtml(t.raw('tools.canva.howTo'))} />
        <ol className={styles.toolSteps}>
          <li>
            {t.rich('tools.canva.step1', {
              strong: (chunks) => <strong>{chunks}</strong>,
              link: (chunks) => (
                <a href="https://www.canva.com/" target="_blank" rel="noopener noreferrer">
                  {chunks}
                </a>
              ),
            })}
          </li>
          <li>{t('tools.canva.step2')}</li>
          <li>{t('tools.canva.step3')}</li>
        </ol>
      </div>

      {/* Tip Card */}
      <div className={styles.tipCard}>
        <span className={styles.tipIcon}>💡</span>
        <div>
          <h3>{t('tools.tip.title')}</h3>
          <p dangerouslySetInnerHTML={rawHtml(t.raw('tools.tip.text'))} />
        </div>
      </div>

      {/* Ethics Reflection Card */}
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
        <button className={styles.btnWhatsapp} onClick={handleWhatsAppShare} type="button">
          <span className={styles.whatsappIcon}>📱</span>
          {t('ethics.shareButton')}
        </button>
      </div>

      {/* Success Criteria - Completion */}
      <SuccessCriteria mode="completion" completionText={t('completion')} />

      {/* Navigation */}
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
