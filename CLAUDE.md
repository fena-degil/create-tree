# VE機能系統図ツール — CLAUDE.md

## プロジェクト概要
バリューエンジニアリング（VE）の機能系統図をブラウザ上でインタラクティブに作成・編集できるWebアプリ。

---

## 技術スタック

| 役割 | ライブラリ/ツール | バージョン目安 |
|------|----------------|-------------|
| フレームワーク | React + TypeScript | React 18+ |
| ビルドツール | Vite | 5+ |
| 図ライブラリ | React Flow (@xyflow/react) | 12+ |
| スタイリング | Tailwind CSS | 3+ |
| 状態管理 | Zustand | 4+ |
| Excelインポート | SheetJS (xlsx) | 0.18+ |
| 画像エクスポート | html-to-image | 1.11+ |
| データ保存 | localStorage (ブラウザ内) | — |

---

## ディレクトリ構成

```
/
├── public/
├── src/
│   ├── App.tsx                     # ルートレイアウト（サイドバー + キャンバス）
│   ├── main.tsx
│   ├── index.css                   # Tailwind directives
│   ├── components/
│   │   ├── Sidebar/
│   │   │   ├── Sidebar.tsx         # 折りたたみコンテナ
│   │   │   ├── ComponentTable.tsx  # 構成要素×機能テーブル
│   │   │   ├── TableRow.tsx        # 行コンポーネント（カラーピッカー付き）
│   │   │   └── ColorPicker.tsx     # <input type="color"> ラッパー
│   │   ├── Diagram/
│   │   │   ├── DiagramCanvas.tsx   # React Flow ラッパー
│   │   │   ├── FunctionNode.tsx    # カスタムノード（番号 + 機能名）
│   │   │   ├── OrthoEdge.tsx       # 折線エッジ（SmoothStepEdge拡張）
│   │   │   └── DiagramToolbar.tsx  # エクスポート・操作ボタン
│   │   └── Upload/
│   │       └── ExcelUploader.tsx   # Excelファイルアップロード
│   ├── store/
│   │   └── diagramStore.ts         # Zustand ストア
│   ├── hooks/
│   │   └── useExcelImport.ts       # SheetJS解析フック
│   └── types/
│       └── index.ts                # 型定義（ComponentRow, FunctionNodeData等）
├── CLAUDE.md
├── SPEC.md
├── TASKS.md
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

---

## 開発コマンド

```bash
# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev

# ビルド
npm run build

# プレビュー（ビルド後）
npm run preview

# 型チェック
npx tsc --noEmit

# リント
npm run lint
```

---

## 開発ルール

### コーディング規約
- TypeScript strict モードを有効にする
- コンポーネントは関数コンポーネント + `React.FC` を使わず直接型付け
- Props型は各ファイル内でインターフェース定義（`types/index.ts`はドメイン型のみ）
- `any` 禁止。型が不明な場合は `unknown` を使い、型ガードで絞り込む

### React Flow 規則
- `nodeTypes` と `edgeTypes` は `useMemo` でメモ化（再レンダリング時の再定義を防ぐ）
- React Flow のノード更新は必ず `useReactFlow().setNodes()` または `onNodesChange` 経由
- ノードデータ変更は `updateNodeData` アクション経由（直接mutationしない）

### 状態管理
- UI状態（サイドバー開閉等）はコンポーネントのローカルstate
- ビジネスデータ（ノード/エッジ/テーブル行）はZustandストア
- localStorage への保存は `zustand/middleware` の `persist` を使用（debounce 500ms）

### スタイリング
- 色はTailwindのデフォルトカラーパレット + CSS変数（ノードカスタム色）を組み合わせる
- レスポンシブ対応は不要（デスクトップ専用）
- ダークモードは初期スコープ外

---

## 環境変数（将来拡張用）
現時点では不要。将来バックエンドを追加する場合は `.env.local` に記述:
```
VITE_API_BASE_URL=https://...
```

---

## 注意事項
- **Excelインポート**: SheetJS の`read()`は同期処理。大きいファイルはWebWorkerを検討
- **PNG/SVGエクスポート**: `html-to-image` はCORSポリシーの影響を受けることがある。ローカルリソースのみ使用すること
- **localStorage容量**: 通常5MB上限。大きな図の場合は圧縮（LZ-string等）を検討
- **コンサル機能**: バックエンドが必要なため現フェーズでは対象外
