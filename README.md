# ToDo アプリ

設計書は [docs/DESIGN.md](docs/DESIGN.md) を参照してください。

## 必要な環境

- Node.js 18+
- npm または pnpm

## セットアップ

```bash
npm install
```

## 開発サーバー

```bash
npm run dev
```

ブラウザで http://localhost:5173 を開いてください。

## ビルド

```bash
npm run build
```

`dist/` に出力されます。プレビューは `npm run preview` で確認できます。

## テスト

```bash
npm test
```

監視モードで実行する場合:

```bash
npm run test:watch
```

## 構成

- `src/types.ts` - 型定義
- `src/store.ts` - データ層（追加・一覧・トグル・削除・永続化）
- `src/ui.ts` - UI 描画とイベント
- `src/main.ts` - エントリポイント
