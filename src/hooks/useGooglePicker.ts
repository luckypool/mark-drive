import { useState, useCallback, useEffect, useRef } from 'react';
import { loadScript } from '../utils/loadScript';

// 環境変数から設定を取得
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || '';
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const APP_ID = import.meta.env.VITE_GOOGLE_APP_ID || '';

// Google API のスコープ
const SCOPES = 'https://www.googleapis.com/auth/drive.readonly';

interface UseGooglePickerReturn {
  isLoading: boolean;
  isApiLoaded: boolean;
  error: string | null;
  openPicker: () => void;
  selectedFile: google.picker.PickerDocument | null;
  fileContent: string | null;
  isLoadingContent: boolean;
  fetchFileById: (fileId: string, fileName: string) => Promise<void>;
}

export function useGooglePicker(): UseGooglePickerReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [isApiLoaded, setIsApiLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<google.picker.PickerDocument | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(false);

  const accessTokenRef = useRef<string | null>(null);
  const tokenClientRef = useRef<google.accounts.oauth2.TokenClient | null>(null);
  const pickerInited = useRef(false);
  const gisInited = useRef(false);

  // Google API スクリプトを動的に読み込む
  useEffect(() => {
    const loadGoogleApi = async () => {
      try {
        // Google API クライアントライブラリを読み込み
        await loadScript('https://apis.google.com/js/api.js');
        // Google Identity Services を読み込み
        await loadScript('https://accounts.google.com/gsi/client');

        // gapi.client を初期化
        window.gapi.load('client:picker', async () => {
          await window.gapi.client.init({
            apiKey: API_KEY,
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
          });
          pickerInited.current = true;
          checkApisLoaded();
        });

        // Token Client を初期化
        tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          callback: () => {}, // 後で設定
        });
        gisInited.current = true;
        checkApisLoaded();
      } catch (err) {
        setError('Failed to load Google APIs');
        console.error('Error loading Google APIs:', err);
      }
    };

    const checkApisLoaded = () => {
      if (pickerInited.current && gisInited.current) {
        setIsApiLoaded(true);
      }
    };

    if (!API_KEY || !CLIENT_ID) {
      setError('Google API credentials not configured. Please set VITE_GOOGLE_API_KEY and VITE_GOOGLE_CLIENT_ID in your .env file.');
      return;
    }

    loadGoogleApi();
  }, []);

  // ファイル内容を取得
  const fetchFileContent = useCallback(async (fileId: string) => {
    if (!accessTokenRef.current) {
      setError('No access token available');
      return;
    }

    setIsLoadingContent(true);
    setError(null);

    try {
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
        {
          headers: {
            Authorization: `Bearer ${accessTokenRef.current}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
      }

      const content = await response.text();
      setFileContent(content);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch file content');
      console.error('Error fetching file content:', err);
    } finally {
      setIsLoadingContent(false);
    }
  }, []);

  // Picker のコールバック
  const pickerCallback = useCallback(
    (data: google.picker.PickerResponse) => {
      if (data.action === google.picker.Action.PICKED && data.docs && data.docs.length > 0) {
        const file = data.docs[0];
        setSelectedFile(file);
        fetchFileContent(file.id);
      }
    },
    [fetchFileContent]
  );

  // Picker を作成して表示
  const createPicker = useCallback(() => {
    if (!accessTokenRef.current) return;

    const view = new google.picker.DocsView()
      .setMimeTypes('text/markdown,text/plain,text/x-markdown')
      .setIncludeFolders(true);

    const picker = new google.picker.PickerBuilder()
      .addView(view)
      .addView(new google.picker.DocsView().setIncludeFolders(true))
      .setOAuthToken(accessTokenRef.current)
      .setDeveloperKey(API_KEY)
      .setCallback(pickerCallback)
      .setTitle('Select a Markdown file')
      .enableFeature(google.picker.Feature.SUPPORT_DRIVES)
      .build();

    if (APP_ID) {
      // APP_ID が設定されている場合のみ使用
    }

    picker.setVisible(true);
    setIsLoading(false);
  }, [pickerCallback]);

  // Picker を開く
  const openPicker = useCallback(() => {
    if (!isApiLoaded) {
      setError('Google APIs not loaded yet');
      return;
    }

    setIsLoading(true);
    setError(null);

    // すでにトークンがある場合はそのまま Picker を表示
    if (accessTokenRef.current) {
      createPicker();
      return;
    }

    // トークンをリクエスト
    if (tokenClientRef.current) {
      tokenClientRef.current.callback = (response: google.accounts.oauth2.TokenResponse) => {
        if (response.error) {
          setError(`Authentication error: ${response.error}`);
          setIsLoading(false);
          return;
        }
        accessTokenRef.current = response.access_token;
        createPicker();
      };
      tokenClientRef.current.requestAccessToken({ prompt: '' });
    }
  }, [isApiLoaded, createPicker]);

  // ファイルIDから直接ファイルを読み込む（履歴用）
  const fetchFileById = useCallback(async (fileId: string, fileName: string) => {
    // 模擬的な PickerDocument を作成
    const mockFile: google.picker.PickerDocument = {
      id: fileId,
      name: fileName,
    } as google.picker.PickerDocument;

    setSelectedFile(mockFile);
    await fetchFileContent(fileId);
  }, [fetchFileContent]);

  return {
    isLoading,
    isApiLoaded,
    error,
    openPicker,
    selectedFile,
    fileContent,
    isLoadingContent,
    fetchFileById,
  };
}
