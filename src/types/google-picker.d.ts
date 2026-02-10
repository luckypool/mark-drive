/**
 * Google Picker API 型定義
 */

declare namespace google.picker {
  class PickerBuilder {
    constructor();
    addView(view: DocsView): PickerBuilder;
    setOAuthToken(token: string): PickerBuilder;
    setDeveloperKey(key: string): PickerBuilder;
    setAppId(appId: string): PickerBuilder;
    setCallback(callback: (data: CallbackData) => void): PickerBuilder;
    setTitle(title: string): PickerBuilder;
    setLocale(locale: string): PickerBuilder;
    enableFeature(feature: Feature): PickerBuilder;
    setOrigin(origin: string): PickerBuilder;
    setSize(width: number, height: number): PickerBuilder;
    build(): Picker;
  }

  class DocsView {
    constructor(viewId?: ViewId);
    setMimeTypes(mimeTypes: string): DocsView;
    setQuery(query: string): DocsView;
    setIncludeFolders(include: boolean): DocsView;
    setSelectFolderEnabled(enabled: boolean): DocsView;
    setMode(mode: DocsViewMode): DocsView;
    setOwnedByMe(ownedByMe: boolean): DocsView;
    setStarred(starred: boolean): DocsView;
    setParent(parentId: string): DocsView;
    setEnableDrives(enable: boolean): DocsView;
  }

  interface Picker {
    setVisible(visible: boolean): void;
    dispose(): void;
  }

  interface CallbackData {
    action: string;
    docs?: PickerDocument[];
  }

  interface PickerDocument {
    id: string;
    name: string;
    mimeType: string;
    url: string;
    sizeBytes?: number;
    lastEditedUtc?: number;
  }

  enum Action {
    CANCEL = 'cancel',
    PICKED = 'picked',
  }

  enum ViewId {
    DOCS = 'all',
    DOCS_IMAGES = 'docs-images',
    DOCUMENTS = 'documents',
    SPREADSHEETS = 'spreadsheets',
    FORMS = 'forms',
  }

  enum DocsViewMode {
    GRID = 'grid',
    LIST = 'list',
  }

  enum Feature {
    MULTISELECT_ENABLED = 'multiselectEnabled',
    NAV_HIDDEN = 'navHidden',
    SIMPLE_UPLOAD_ENABLED = 'simpleUploadEnabled',
    SUPPORT_DRIVES = 'supportDrives',
  }
}
