# React パターン

## コンポーネント設計

### 単一責任の原則

各コンポーネントは1つの責務のみを持つ。

```typescript
// ✅ Good: 責務が明確
// MarkdownRenderer.tsx - Markdown の表示のみ
// Button.tsx - UI ボタンのみ
// useGoogleAuth.ts - Google 認証ロジックのみ

// ❌ Bad: 複数の責務
// AllInOneComponent.tsx - 表示、選択、状態管理を全て含む
```

### Presentational vs Container

```typescript
// Presentational Component: 表示のみ
interface MarkdownContentProps {
  content: string
  className?: string
}

export const MarkdownContent = ({ content, className }: MarkdownContentProps) => (
  <div className={className}>
    <ReactMarkdown remarkPlugins={[remarkGfm]}>
      {content}
    </ReactMarkdown>
  </div>
)

// Container Component: ロジック + 表示
export const MarkdownViewer = () => {
  const { content, loading, error } = useMarkdownFile()
  
  if (loading) return <Spinner />
  if (error) return <ErrorMessage error={error} />
  return <MarkdownContent content={content} />
}
```

## カスタムフック

### 状態とロジックの分離

```typescript
// hooks/useGoogleAuth.ts - Google OAuth + Drive API
export const useGoogleAuth = () => {
  const [isApiLoaded, setIsApiLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const authenticate = useCallback(() => {
    tokenClientRef.current?.requestAccessToken({ prompt: '', state })
  }, [])

  const searchFiles = useCallback(async (query: string) => {
    // Drive API でファイル検索
  }, [])

  return { isApiLoaded, isLoading, error, authenticate, searchFiles, ... }
}

// hooks/useFilePicker.ts - ローカルファイル選択
export const useFilePicker = () => {
  const openFile = useCallback(async () => {
    const [handle] = await window.showOpenFilePicker({ ... })
    const file = await handle.getFile()
    return { content: await file.text(), name: file.name, handle }
  }, [])

  return { openFile }
}
```

### フックの合成

```typescript
// ページコンポーネントで複数のフックを組み合わせる
export const HomePage = () => {
  const { isApiLoaded, authenticate, searchFiles } = useGoogleAuth()
  const { openFile } = useFilePicker()

  // 認証状態に応じて UI を出し分け
  return isApiLoaded ? <SearchView /> : <LandingView />
}
```

## 状態管理

### ローカル状態 vs グローバル状態

```typescript
// ローカル状態: コンポーネント内で完結
const [isOpen, setIsOpen] = useState(false)

// 複数コンポーネントで共有が必要な場合のみ Context を使用
const ThemeContext = createContext<ThemeContextValue | null>(null)

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  
  const value = useMemo(() => ({ theme, setTheme }), [theme])
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}
```

## エラーバウンダリ

```typescript
// ErrorBoundary.tsx
interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? <DefaultErrorFallback error={this.state.error} />
    }
    return this.props.children
  }
}
```

## パフォーマンス最適化

### React.memo

```typescript
// 再レンダリングを避けたい純粋なコンポーネント
export const MarkdownContent = React.memo(({ content }: { content: string }) => (
  <ReactMarkdown>{content}</ReactMarkdown>
))
```

### useMemo / useCallback

```typescript
// 重い計算結果のメモ化
const syntaxHighlightedCode = useMemo(() => {
  return highlightCode(code, language)
}, [code, language])

// 子コンポーネントへのコールバック
const handleFileSelect = useCallback((file: GoogleFile) => {
  setSelectedFile(file)
  onFileSelect?.(file)
}, [onFileSelect])
```

### 遅延ロード

```typescript
// 重いコンポーネントの遅延ロード
const SyntaxHighlighter = lazy(() => import('react-syntax-highlighter'))

export const CodeBlock = ({ code, language }: CodeBlockProps) => (
  <Suspense fallback={<pre>{code}</pre>}>
    <SyntaxHighlighter language={language}>
      {code}
    </SyntaxHighlighter>
  </Suspense>
)
```

## テスト

### コンポーネントテスト

```typescript
// HomePage.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import HomePage from './HomePage'

// モック状態を mutable オブジェクトで管理（テストごとに変更可能）
const mockAuthState = {
  isApiLoaded: false,
  isLoading: false,
  authenticate: vi.fn(),
}

vi.mock('../hooks/useGoogleAuth', () => ({
  useGoogleAuth: () => mockAuthState,
}))

describe('HomePage', () => {
  beforeEach(() => {
    // テストごとにモック状態をリセット
    mockAuthState.isApiLoaded = false
    mockAuthState.isLoading = false
    mockAuthState.authenticate.mockClear()
  })

  it('shows landing when not authenticated', () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>)
    expect(screen.getByText(/sign in/i)).toBeInTheDocument()
  })

  it('shows search when authenticated', () => {
    mockAuthState.isApiLoaded = true
    render(<MemoryRouter><HomePage /></MemoryRouter>)
    expect(screen.getByRole('searchbox')).toBeInTheDocument()
  })
})
```

### フックテスト

```typescript
// useFilePicker.test.ts
import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFilePicker } from './useFilePicker'

describe('useFilePicker', () => {
  it('opens file and returns content', async () => {
    const mockFile = new File(['# Hello'], 'test.md', { type: 'text/markdown' })
    vi.stubGlobal('showOpenFilePicker', vi.fn().mockResolvedValue([{
      getFile: () => Promise.resolve(mockFile),
    }]))

    const { result } = renderHook(() => useFilePicker())

    await act(async () => {
      await result.current.openFile()
    })

    expect(result.current.fileName).toBe('test.md')
  })
})
```
