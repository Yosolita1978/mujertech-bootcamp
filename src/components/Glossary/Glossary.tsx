'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import styles from './Glossary.module.css';

const TERM_KEYS = [
  'app',
  'boton',
  'chatgpt',
  'canva',
  'copiar',
  'descargar',
  'ia',
  'imagenGenerada',
  'internet',
  'pegar',
  'prompt',
  'redesSociales',
  'tono',
] as const;

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function Glossary({ isOpen, onClose }: Props) {
  const [searchValue, setSearchValue] = useState('');
  const t = useTranslations('glossary');

  const filteredTerms = TERM_KEYS.filter((key) => {
    const term = t(`terms.${key}.term`);
    const definition = t(`terms.${key}.definition`);
    const search = searchValue.toLowerCase();
    return term.toLowerCase().includes(search) || definition.toLowerCase().includes(search);
  });

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <>
      <div
        className={`${styles.overlay} ${isOpen ? styles.active : ''}`}
        onClick={handleOverlayClick}
      />
      <div className={`${styles.panel} ${isOpen ? styles.active : ''}`}>
        <div className={styles.header}>
          <h2>{t('title')}</h2>
          <button className={styles.closeBtn} onClick={onClose} type="button">
            ✕
          </button>
        </div>
        <div className={styles.search}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder={t('searchPlaceholder')}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>
        <div className={styles.content}>
          {filteredTerms.length === 0 ? (
            <p className={styles.empty}>{t('empty')}</p>
          ) : (
            filteredTerms.map((key) => (
              <div key={key} className={styles.item}>
                <h4>{t(`terms.${key}.term`)}</h4>
                <p>{t(`terms.${key}.definition`)}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
