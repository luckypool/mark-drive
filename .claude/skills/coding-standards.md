# コーディング規約

## 基本原則

### KISS (Keep It Simple, Stupid)
- シンプルな実装を優先
- 過度な抽象化を避ける
- 理解しやすいコードを書く

### DRY (Don't Repeat Yourself)
- 重複コードを排除
- 共通ロジックは関数・フックに抽出
- ただし、過度な共通化は避ける

### YAGNI (You Aren't Gonna Need It)
- 今必要な機能のみ実装
- 将来の要件を予測して作り込まない
- シンプルに始めて、必要に応じて拡張

## TypeScript 規約

### 型定義

```typescript
// ✅ Good: 明確な型定義
interface MarkdownViewerProps {
  content: string
  className?: string
}

// ❌ Bad: any の使用
const handleData = (data: any) => {}

// ✅ Good: unknown を使用して型ガード
const handleData = (data: unknown) => {
  if (typeof data === 'string') {
    // data は string として扱える
  }
}
```

### 型推論の活用

```typescript
// ✅ Good: 推論可能な場合は省略
const count = 0 // number と推論される
const items = ['a', 'b'] // string[] と推論される

// ✅ Good: 推論できない場合は明示
const [data, setData] = useState<MarkdownData | null>(null)
```

## React 規約

### コンポーネント設計

```typescript
// ✅ Good: 関数コンポーネント + 型定義
interface ButtonProps {
  label: string
  onClick: () => void
  disabled?: boolean
}

export const Button = ({ label, onClick, disabled = false }: ButtonProps) => {
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  )
}
```

### Hooks の使用

```typescript
// ✅ Good: カスタムフックでロジック分離
const useFileContent = (fileId: string) => {
  const [content, setContent] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    // ファイル取得ロジック
  }, [fileId])

  return { content, loading, error }
}
```

### 条件付きレンダリング

```typescript
// ✅ Good: 早期リターン
if (loading) return <Spinner />
if (error) return <ErrorMessage error={error} />
return <Content data={data} />

// ❌ Bad: ネストした三項演算子
return loading ? <Spinner /> : error ? <ErrorMessage /> : <Content />
```

## ファイル構成

### コンポーネントファイル

```
components/
├── MarkdownViewer.tsx          # コンポーネント本体
├── MarkdownViewer.module.css   # スタイル（CSS Modules）
└── MarkdownViewer.test.tsx     # テスト（必要な場合）
```

### インポート順序

```typescript
// 1. React
import { useState, useEffect } from 'react'

// 2. 外部ライブラリ
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// 3. 内部コンポーネント
import { Button } from './Button'

// 4. フック
import { useGoogleAuth } from '../hooks/useGoogleAuth'

// 5. 型定義
import type { MarkdownData } from '../types'

// 6. スタイル
import styles from './MarkdownViewer.module.css'
```

## エラーハンドリング

```typescript
// ✅ Good: 適切なエラーハンドリング
try {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`)
  }
  const data = await response.json()
  return data
} catch (error) {
  console.error('Failed to fetch:', error)
  throw error // または適切なエラー処理
}
```

## パフォーマンス

### メモ化

```typescript
// ✅ Good: 重い計算はメモ化
const processedContent = useMemo(() => {
  return heavyProcessing(content)
}, [content])

// ✅ Good: コールバックのメモ化
const handleClick = useCallback(() => {
  doSomething(id)
}, [id])

// ⚠️ 注意: 不要なメモ化は避ける
// 軽い処理にはメモ化不要
```
