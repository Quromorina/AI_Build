# ToDo アプリ

設計書は `docs/DESIGN.md` を参照してください。

## 必要な環境

- Node.js 18+（CI では Node.js 20 を使用）
- npm

## セットアップ

```bash
npm install
```

## 開発サーバー

```bash
npm run dev
```

ブラウザで `http://localhost:5173` を開いてください。

## スクリプト一覧

- `npm run dev` : 開発サーバー起動（Vite）
- `npm run build` : 本番ビルド（TypeScript ビルド + Vite ビルド）
- `npm run preview` : ビルド成果物のプレビュー
- `npm run lint` : TypeScript の型チェック（`tsc --noEmit`）
- `npm test` : Vitest によるテスト実行
- `npm run test:watch` : テスト監視実行

## UI / スタイル

- Tailwind CSS v3 を使用
- 中央寄せレイアウト + カードUI
- ボタン・リスト行に hover / focus スタイル
- 実務向けのシンプルな見た目を意識

## CI（GitHub Actions）

`.github/workflows/ci.yml` で以下を自動実行します。

- トリガー: `push`, `pull_request`（対象ブランチ: `main`, `master`）
- `npm ci`
- `npm run lint`
- `npm test`
- `npm run build`

## 構成

- `src/types.ts` : 型定義
- `src/store.ts` : データ層（追加・一覧・トグル・削除・永続化）
- `src/ui.ts` : UI 描画とイベント（Tailwind クラスを付与）
- `src/main.ts` : エントリポイント
