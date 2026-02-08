import { useRouteError, Link } from 'react-router';
import styles from './ErrorPage.module.css';

export default function ErrorPage() {
  const error = useRouteError();

  const message =
    error instanceof Error
      ? error.message
      : 'An unexpected error occurred.';

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Something went wrong</h1>
      <p className={styles.message}>{message}</p>
      <Link to="/" className={styles.link}>
        Go to Home
      </Link>
    </div>
  );
}
