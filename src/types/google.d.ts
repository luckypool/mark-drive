// Google API Types for Picker and Drive

declare namespace google {
  namespace accounts {
    namespace oauth2 {
      interface TokenClient {
        requestAccessToken: (options?: { prompt?: string }) => void;
        callback: (response: TokenResponse) => void;
      }

      interface TokenResponse {
        access_token: string;
        error?: string;
        expires_in: number;
        scope: string;
        token_type: string;
      }

      interface TokenClientConfig {
        client_id: string;
        scope: string;
        callback: (response: TokenResponse) => void;
      }

      function initTokenClient(config: TokenClientConfig): TokenClient;
      function revoke(token: string, callback?: () => void): void;
    }
  }

  namespace picker {
    class PickerBuilder {
      addView(view: View | ViewId): PickerBuilder;
      setOAuthToken(token: string): PickerBuilder;
      setDeveloperKey(key: string): PickerBuilder;
      setCallback(callback: (data: PickerResponse) => void): PickerBuilder;
      setAppId(appId: string): PickerBuilder;
      setTitle(title: string): PickerBuilder;
      enableFeature(feature: Feature): PickerBuilder;
      disableFeature(feature: Feature): PickerBuilder;
      build(): Picker;
    }

    interface Picker {
      setVisible(visible: boolean): void;
      dispose(): void;
    }

    interface PickerResponse {
      action: Action;
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
      DOCS = 'docs',
      DOCS_IMAGES = 'docs-images',
      DOCS_IMAGES_AND_VIDEOS = 'docs-images-and-videos',
      DOCS_VIDEOS = 'docs-videos',
      DOCUMENTS = 'documents',
      DRAWINGS = 'drawings',
      FOLDERS = 'folders',
      FORMS = 'forms',
      PDFS = 'pdfs',
      PRESENTATIONS = 'presentations',
      SPREADSHEETS = 'spreadsheets',
    }

    enum Feature {
      MINE_ONLY = 'mineOnly',
      MULTISELECT_ENABLED = 'multiselectEnabled',
      NAV_HIDDEN = 'navHidden',
      SIMPLE_UPLOAD_ENABLED = 'simpleUploadEnabled',
      SUPPORT_DRIVES = 'supportDrives',
    }

    class View {
      constructor(viewId?: ViewId);
      setMimeTypes(mimeTypes: string): this;
      setQuery(query: string): this;
      setIncludeFolders?(include: boolean): this;
    }

    class DocsView extends View {
      constructor(viewId?: ViewId);
      setMimeTypes(mimeTypes: string): DocsView;
      setIncludeFolders(include: boolean): DocsView;
      setSelectFolderEnabled(enabled: boolean): DocsView;
      setParent(parentId: string): DocsView;
      setStarred(starred: boolean): DocsView;
      setOwnedByMe(ownedByMe: boolean): DocsView;
    }

    class DocsUploadView extends View {
      constructor();
      setIncludeFolders(include: boolean): DocsUploadView;
      setParent(parentId: string): DocsUploadView;
    }
  }
}

// Google Drive API ファイル検索結果の型
interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  size?: string;
  iconLink?: string;
  webViewLink?: string;
  owners?: Array<{
    displayName: string;
    emailAddress: string;
  }>;
}

interface DriveFileListResponse {
  files: DriveFile[];
  nextPageToken?: string;
}

interface Window {
  google: typeof google;
  gapi: {
    load: (api: string, callback: () => void) => void;
    client: {
      init: (config: { apiKey: string; discoveryDocs: string[] }) => Promise<void>;
      drive: {
        files: {
          get: (params: { fileId: string; alt?: string }) => {
            then: (callback: (response: { body: string }) => void) => void;
          };
          list: (params: {
            q: string;
            fields?: string;
            pageSize?: number;
            pageToken?: string;
            orderBy?: string;
          }) => Promise<{ result: DriveFileListResponse }>;
        };
      };
    };
  };
}
