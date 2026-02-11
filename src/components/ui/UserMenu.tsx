/**
 * User Menu - Avatar dropdown for account info and sign out,
 * or plain sign-in button when not authenticated.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { IoPersonOutline, IoLogOutOutline, IoLogInOutline } from 'react-icons/io5';
import { useLanguage } from '../../hooks/useLanguage';
import type { UserInfo } from '../../types/user';
import styles from './UserMenu.module.css';

interface UserMenuProps {
  isAuthenticated: boolean;
  userInfo: UserInfo | null;
  onSignIn: () => void;
  onSignOut: () => void;
}

export function UserMenu({ isAuthenticated, userInfo, onSignIn, onSignOut }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  const close = useCallback(() => setIsOpen(false), []);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        close();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen, close]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, close]);

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <button
        className={styles.trigger}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isAuthenticated ? (userInfo?.displayName ?? 'Account') : t.home.signIn}
        type="button"
      >
        {isAuthenticated && userInfo?.photoUrl ? (
          <img
            src={userInfo.photoUrl}
            alt={userInfo.displayName}
            className={styles.avatarImage}
          />
        ) : (
          <div className={styles.avatarPlaceholder}>
            <IoPersonOutline size={16} />
          </div>
        )}
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          {isAuthenticated ? (
            <>
              {userInfo && (
                <div className={styles.userSection}>
                  <span className={styles.userName}>{userInfo.displayName}</span>
                  <span className={styles.userEmail}>{userInfo.email}</span>
                </div>
              )}
              <button
                className={`${styles.menuItem} ${styles.menuItemDanger}`}
                onClick={() => {
                  close();
                  onSignOut();
                }}
                type="button"
              >
                <IoLogOutOutline size={18} />
                {t.home.signOut}
              </button>
            </>
          ) : (
            <button
              className={styles.menuItem}
              onClick={() => {
                close();
                onSignIn();
              }}
              type="button"
            >
              <IoLogInOutline size={18} />
              {t.home.signIn}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
