/**
 * MarkDrive - Search Page (Google Picker)
 */

import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  IoClose,
  IoFolderOpenOutline,
} from 'react-icons/io5';
import { GoogleLogo } from '../components/ui';
import { useGoogleAuth, useLanguage } from '../hooks';
import styles from './SearchPage.module.css';

export default function SearchPage() {
  const { t } = useLanguage();
  const {
    isAuthenticated,
    authenticate,
    openDrivePicker,
  } = useGoogleAuth();

  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handlePickFile = useCallback(async () => {
    const result = await openDrivePicker();
    if (result) {
      const params = new URLSearchParams({
        id: result.id,
        name: result.name,
        source: 'google-drive',
      });
      navigate(`/viewer?${params.toString()}`, { replace: true });
    }
  }, [openDrivePicker, navigate]);

  const handleClose = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.searchInputWrapper}>
          <IoFolderOpenOutline size={20} />
          <span className={styles.headerTitle}>{t.search.pickFile}</span>
        </div>
        <button className={styles.closeButton} onClick={handleClose}>
          <IoClose size={22} />
        </button>
      </div>

      {/* Body */}
      <div className={styles.body} onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}>
        {!isAuthenticated ? (
          <div className={styles.authPrompt}>
            <p className={styles.authText}>{t.search.signInPrompt}</p>
            <button className={styles.authButton} onClick={authenticate}>
              <GoogleLogo size={20} />
              <span>{t.search.signIn}</span>
            </button>
          </div>
        ) : (
          <div className={styles.pickerPrompt}>
            <div className={styles.pickerIcon}>
              <IoFolderOpenOutline size={48} />
            </div>
            <p className={styles.pickerHint}>{t.search.pickFileHint}</p>
            <button className={styles.pickerButton} onClick={handlePickFile}>
              <GoogleLogo size={20} />
              <span>{t.search.pickFile}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
