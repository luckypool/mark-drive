import type { FileHistoryItem } from '../types/fileHistory';

interface RecentFilesListProps {
  /** 履歴アイテムのリスト */
  items: FileHistoryItem[];

  /** ファイルがクリックされた時のハンドラ */
  onFileClick: (item: FileHistoryItem) => void;

  /** 履歴をクリアするハンドラ */
  onClearHistory: () => void;
}

/**
 * 最近使ったファイルのリスト表示コンポーネント
 */
export function RecentFilesList({
  items,
  onFileClick,
  onClearHistory
}: RecentFilesListProps) {
  if (items.length === 0) {
    return null;
  }

  const formatDate = (isoString: string): string => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'たった今';
    if (diffMins < 60) return `${diffMins}分前`;
    if (diffHours < 24) return `${diffHours}時間前`;
    if (diffDays < 7) return `${diffDays}日前`;

    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="recent-files">
      <div className="recent-files-header">
        <h3 className="recent-files-title">最近使ったファイル</h3>
        <button
          className="recent-files-clear-button"
          onClick={onClearHistory}
          title="履歴をクリア"
        >
          クリア
        </button>
      </div>

      <ul className="recent-files-list">
        {items.map((item) => (
          <li key={item.id}>
            <button
              className="recent-file-item"
              onClick={() => onFileClick(item)}
            >
              <div className="recent-file-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>

              <div className="recent-file-content">
                <span className="recent-file-name">{item.name}</span>
                <span className="recent-file-time">{formatDate(item.selectedAt)}</span>
              </div>

              <svg
                className="recent-file-arrow"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
