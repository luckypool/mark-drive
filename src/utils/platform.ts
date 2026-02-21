/**
 * プラットフォーム検出ユーティリティ
 */

/** iOS デバイスかどうかを判定 */
export function isIOS(): boolean {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.userAgent.includes('Mac') && 'ontouchend' in document)
  );
}

/** スタンドアロン（PWA）モードかどうかを判定 */
export function isStandaloneMode(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in navigator &&
      !!(navigator as unknown as { standalone: boolean }).standalone)
  );
}

/** iOS PWA モードかどうかを判定 */
export function isIosPwa(): boolean {
  return isIOS() && isStandaloneMode();
}
