'use client';

import { useTranslations } from 'next-intl';
import styles from './ModuleNavBar.module.css';

const NAV_ITEMS = [
  { id: 'module1', icon: '🤖' },
  { id: 'module2', icon: '💬' },
  { id: 'module3', icon: '📈' },
] as const;

export type NavId = (typeof NAV_ITEMS)[number]['id'];

type ItemState = 'current' | 'completed' | 'upcoming';

type Props = {
  currentModule: NavId;
  onModuleChange: (id: NavId) => void;
  isVisible: boolean;
};

export default function ModuleNavBar({ currentModule, onModuleChange, isVisible }: Props) {
  const t = useTranslations('nav');
  const currentIndex = NAV_ITEMS.findIndex((item) => item.id === currentModule);

  const getItemState = (index: number): ItemState => {
    if (NAV_ITEMS[index].id === currentModule) return 'current';
    if (index < currentIndex) return 'completed';
    return 'upcoming';
  };

  return (
    <nav className={`${styles.navBar} ${isVisible ? styles.visible : ''}`}>
      {NAV_ITEMS.map((item, index) => (
        <button
          key={item.id}
          className={`${styles.navItem} ${styles[getItemState(index)]}`}
          onClick={() => onModuleChange(item.id)}
          type="button"
        >
          <span className={styles.navItemIcon}>{item.icon}</span>
          <span className={styles.navItemLabel}>{t(item.id)}</span>
        </button>
      ))}
    </nav>
  );
}
