/**
 * スクリプトを動的に読み込むヘルパー関数
 * 同じスクリプトが複数回読み込まれるのを防ぐ
 */
export function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // すでに読み込まれている場合はスキップ
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}
