/**
 * MarkDrive - License Page
 */

import { useNavigate } from 'react-router';
import { IoArrowBack } from 'react-icons/io5';
import { useLanguage } from '../hooks';
import { ThemeToggle, LanguageToggle } from '../components/ui';
import styles from './LicensePage.module.css';

const LICENSE_TEXT = `MIT License

Copyright (c) 2025 luckypool

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`;

export default function LicensePage() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate(-1)}>
          <IoArrowBack size={24} />
        </button>
        <span className={styles.headerTitle}>{t.about.license}</span>
        <div className={styles.headerActions}>
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.contentContainer}>
          <div className={styles.licenseCard}>
            <p className={styles.licenseText}>
              {LICENSE_TEXT}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
