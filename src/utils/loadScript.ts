/**
 * スクリプトを動的に読み込むヘルパー関数
 * 同じスクリプトが複数回読み込まれるのを防ぐ
 * React Strict Mode での二重実行にも対応
 */

// ロード中/ロード済みのスクリプトを追跡するMap
const scriptPromises = new Map<string, Promise<void>>();

/**
 * Google API スクリプトがロード済みかどうかをグローバル変数で確認
 */
function isScriptLoaded(src: string): boolean {
  if (src.includes('apis.google.com/js/api.js')) {
    return typeof window.gapi !== 'undefined';
  }
  if (src.includes('accounts.google.com/gsi/client')) {
    return typeof window.google !== 'undefined' && typeof window.google.accounts !== 'undefined';
  }
  return false;
}

export function loadScript(src: string): Promise<void> {
  // 既にロード完了している場合（グローバル変数で確認）
  if (isScriptLoaded(src)) {
    return Promise.resolve();
  }

  // 既にロード中の場合は同じPromiseを返す
  const existingPromise = scriptPromises.get(src);
  if (existingPromise) {
    return existingPromise;
  }

  // 新しくロードを開始
  const promise = new Promise<void>((resolve, reject) => {
    // 既にDOMに存在するスクリプトタグを確認
    const existingScript = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement | null;
    
    if (existingScript) {
      // スクリプトが既にロード済みかチェック（グローバル変数で確認）
      if (isScriptLoaded(src)) {
        resolve();
        return;
      }
      
      // まだロード中の場合、ポーリングで完了を待つ
      const checkLoaded = () => {
        if (isScriptLoaded(src)) {
          resolve();
        } else {
          setTimeout(checkLoaded, 50);
        }
      };
      checkLoaded();
      return;
    }

    // 新しくスクリプトを追加
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });

  scriptPromises.set(src, promise);
  return promise;
}
