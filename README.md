# KANRI - 管理APIシステム

実務レベルのフルスタック社員管理システム。認証・認可・監査ログ・承認フローなどを網羅したプロダクショングレードなAPI。

## 機能一覧

| カテゴリ | 機能 |
|---|---|
| **認証** | JWT (アクセストークン15分 + リフレッシュトークン7日)、トークンローテーション |
| **認可** | ロールベースアクセス制御 (RBAC) - admin / manager / employee |
| **バリデーション** | Zodによるスキーマバリデーション (入力・環境変数) |
| **エラーハンドリング** | 統一エラーレスポンス、本番環境でのスタックトレース非公開 |
| **ページネーション** | カーソルベース + オフセット両対応、検索・絞り込み |
| **監査ログ** | 全CRUD操作を自動記録 (誰が・何を・いつ・どこから) |
| **ログイン履歴** | 成功/失敗を含む全ログイン試行を記録 |
| **承認フロー** | 申請・承認・却下ワークフロー |
| **CSV** | ユーザー一覧エクスポート / インポート |
| **レート制限** | APIエンドポイント別のリクエスト制限 |
| **ソフトデリート** | 論理削除による安全なデータ管理 |
| **リトライ設計** | 指数バックオフ付きリトライユーティリティ |
| **OpenAPI** | Swagger UI (`/api-docs`) |
| **Docker** | docker-compose で全サービス起動 |

## クイックスタート

### 前提条件
- Docker Desktop
- Node.js 20+

### 1. 環境変数設定
```bash
cp .env.example .env
# .env を編集して JWT_SECRET などを設定
```

### 2. Docker で起動
```bash
docker compose up -d
```

### 3. DB マイグレーション & シード
```bash
docker compose exec backend npm run db:migrate
docker compose exec backend npm run db:seed
```

### 4. アクセス

| サービス | URL |
|---|---|
| フロントエンド | http://localhost:3000 |
| バックエンドAPI | http://localhost:3001 |
| Swagger UI | http://localhost:3001/api-docs |

### デフォルト管理者アカウント
- Email: `admin@kanri.dev`
- Password: `Admin123!`

---

## ローカル開発

### バックエンド
```bash
cd backend
npm install
cp .env.example .env
# PostgreSQL と Redis が必要 (docker compose up postgres redis -d)
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

### フロントエンド
```bash
cd frontend
npm install
npm run dev
```

## テスト
```bash
cd backend
npm test
npm run test:coverage
```

---

## API エンドポイント概要

### 認証
| Method | Path | 説明 |
|---|---|---|
| POST | `/api/auth/login` | ログイン |
| POST | `/api/auth/refresh` | トークン更新 |
| POST | `/api/auth/logout` | ログアウト |
| GET | `/api/auth/me` | 現在のユーザー情報 |

### ユーザー管理
| Method | Path | 説明 |
|---|---|---|
| GET | `/api/users` | 一覧 (検索・フィルター・ページネーション) |
| POST | `/api/users` | 新規作成 |
| GET | `/api/users/:id` | 詳細取得 |
| PATCH | `/api/users/:id` | 更新 |
| DELETE | `/api/users/:id` | ソフトデリート |

### その他
- `GET /api/departments` - 部署管理
- `GET /api/approvals` - 承認フロー
- `GET /api/audit-logs` - 監査ログ
- `GET /api/csv/users/export` - CSV エクスポート
- `POST /api/csv/users/import` - CSV インポート

---

## アーキテクチャ

```
frontend/          React + Vite + Tailwind CSS (ダークテーマ管理画面)
backend/
  src/
    config/        環境変数バリデーション (Zod), Swagger設定
    lib/           Prisma, Redis, Winston ロガー
    middleware/    認証, 認可, レート制限, 監査ログ, エラーハンドラ
    modules/       機能モジュール (auth, users, departments, approvals, ...)
    utils/         共通ユーティリティ (response, pagination, retry)
  prisma/          スキーマ & シードデータ
docker-compose.yml  PostgreSQL + Redis + Backend + Frontend
```

## 技術スタック

**Backend**: Node.js, Express, TypeScript, Prisma ORM, PostgreSQL, Redis, Zod, JWT, Winston, Swagger
**Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Axios, Zustand, React Router v6
**Infrastructure**: Docker, docker-compose, Nginx
