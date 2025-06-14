# 救急資器材在庫管理システム (RescueStockTracker)

総社市消防本部向けの救急資器材在庫管理システムです。

## 機能

- **ダッシュボード**: 在庫状況の概要表示
- **在庫管理**: 資器材の追加・編集・削除
- **使用履歴**: 資器材の使用記録管理
- **期限通知**: 有効期限切れ間近の資器材アラート
- **レポート**: 在庫統計とカテゴリ別分析

## 技術スタック

- **フロントエンド**: React 18, TypeScript, Tailwind CSS
- **バックエンド**: Express.js, Node.js
- **データベース**: PostgreSQL (本番環境)
- **開発環境**: Vite, Replit

## セットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# 本番ビルド
npm run build

# 本番サーバー起動
npm start
```

## ディレクトリ構造

```
├── client/          # Reactフロントエンド
├── server/          # Express.jsバックエンド
├── shared/          # 共通スキーマとタイプ
├── package.json     # 依存関係設定
└── README.md        # このファイル
```

## 開発者向け

このシステムは総社市消防本部の実際の業務に基づいて設計されています。

### 主要コンポーネント

- `client/src/pages/dashboard.tsx` - ダッシュボード画面
- `client/src/pages/inventory.tsx` - 在庫管理画面
- `client/src/pages/usage-history.tsx` - 使用履歴画面
- `client/src/pages/expiration-alerts.tsx` - 期限通知画面
- `server/storage.ts` - データストレージ層
- `shared/schema.ts` - データベーススキーマ

## ライセンス

MIT License