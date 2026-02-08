import { Link } from 'react-router';
import styles from './NotFoundPage.module.css';

export default function NotFoundPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Page Not Found</h1>
      <Link to="/" className={styles.link}>
        Go to Home
      </Link>
    </div>
  );
}
