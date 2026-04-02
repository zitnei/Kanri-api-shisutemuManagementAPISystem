# KANRI — Enterprise Management API System

<div align="center">

![CI](https://github.com/zitnei/Kanri-api-shisutemuManagementAPISystem/actions/workflows/ci.yml/badge.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)

**ユーザー管理・承認フロー・監査ログを統合した、プロダクションレディな企業向けAPIシステム**

[ライブデモ](https://kanri-api-shisutemu-management-api.vercel.app) · [API ドキュメント](https://kanri-api-shisutemumanagementapisystem-production.up.railway.app/api-docs) · [不具合報告](https://github.com/zitnei/Kanri-api-shisutemuManagementAPISystem/issues)

</div>

---

## なぜ KANRI か

企業のバックオフィス業務に必要な**認証・権限管理・申請承認・操作監査**を、単一の堅牢なAPIで提供します。セキュリティ・可観測性・スケーラビリティを設計段階から組み込んだ、エンタープライズグレードのシステムです。

```
導入即日から稼働。拡張は API 一本で。
```

---

## 主な機能

| カテゴリ | 機能 | 詳細 |
|---|---|---|
| **認証** | JWT + リフレッシュトークン | アクセス 15分 / リフレッシュ 7日、トークンローテーション |
| **認可** | RBAC (ロールベースアクセス制御) | admin / manager / employee の3階層 |
| **ユーザー管理** | フルCRUD + ソフトデリート | 検索・フィルター・ページネーション対応 |
| **部署管理** | 階層型組織構造 | 親子関係、部署マネージャー設定 |
| **承認フロー** | 申請・承認・却下ワークフロー | ステータス追跡・担当者アサイン |
| **監査ログ** | 全操作の自動記録 | 誰が・何を・いつ・どのIPから |
| **ログイン履歴** | 成功/失敗の全記録 | セキュリティインシデント追跡 |
| **CSV** | エクスポート / インポート | ユーザー一括管理 |
| **レート制限** | エンドポイント別制限 | 認証API: 10req/15min |
| **OpenAPI** | Swagger UI 自動生成 | `/api-docs` で即時確認可能 |

---

## セキュリティ設計

```
✅ OWASP Top 10 対応
✅ Helmet による HTTP ヘッダー強化
✅ bcrypt によるパスワードハッシュ化 (rounds=12)
✅ JWT Secret の環境変数分離
✅ SQLインジェクション対策 (Prisma ORM)
✅ 入力バリデーション (Zod スキーマ)
✅ レート制限 (express-rate-limit)
✅ CORS ホワイトリスト制御
✅ 本番環境でのスタックトレース非公開
✅ ソフトデリート (データ完全削除防止)
```

---

## アーキテクチャ

```
┌─────────────────────────────────────────────────────┐
│                    Client Layer                      │
│          React + Vite + TypeScript (Vercel)          │
└──────────────────────┬──────────────────────────────┘
                       │ HTTPS / REST API
┌──────────────────────▼──────────────────────────────┐
│                   API Gateway Layer                  │
│     Helmet │ CORS │ Rate Limiter │ Morgan Logger     │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│                 Application Layer                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │   Auth   │ │  Users   │ │Approvals │ │  CSV   │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────┘ │
│  ┌─────────────────┐  ┌──────────────────────────┐  │
│  │   Departments   │  │       Audit Logs         │  │
│  └─────────────────┘  └──────────────────────────┘  │
│                                                      │
│  Middleware: authenticate │ authorize │ audit        │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│                  Data Layer                          │
│   PostgreSQL (Prisma ORM)  │  Redis (Session Cache) │
└─────────────────────────────────────────────────────┘
```

---

## 技術スタック

**Backend**
- **Runtime**: Node.js 20 LTS + TypeScript 5.4
- **Framework**: Express 4
- **ORM**: Prisma 5 (PostgreSQL)
- **Cache**: Redis 4
- **Auth**: JWT (jsonwebtoken) + bcryptjs
- **Validation**: Zod
- **Logging**: Winston
- **API Docs**: Swagger (swagger-jsdoc + swagger-ui-express)
- **Testing**: Vitest + Supertest

**Frontend**
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS
- **State**: Zustand
- **HTTP**: Axios
- **Router**: React Router v6

**Infrastructure**
- **Container**: Docker + docker-compose
- **CI/CD**: GitHub Actions
- **Deploy**: Railway (Backend) + Vercel (Frontend)
- **DB**: PostgreSQL 16

---

## クイックスタート

### 前提条件
- Docker Desktop
- Node.js 20+

### 1. リポジトリをクローン
```bash
git clone https://github.com/zitnei/Kanri-api-shisutemuManagementAPISystem.git
cd Kanri-api-shisutemuManagementAPISystem
```

### 2. 環境変数を設定
```bash
cd backend
cp .env.example .env
# .env を開き JWT_SECRET などを設定
```

### 3. Docker で全サービスを起動
```bash
docker compose up -d
```

### 4. データベースを初期化
```bash
docker compose exec backend npm run db:migrate
docker compose exec backend npm run db:seed
```

### 5. アクセス確認

| サービス | URL |
|---|---|
| フロントエンド | http://localhost:3000 |
| API | http://localhost:3001 |
| Swagger UI | http://localhost:3001/api-docs |
| ヘルスチェック | http://localhost:3001/health |

**デモアカウント**

| ロール | メール | パスワード |
|---|---|---|
| 管理者 | admin@kanri.dev | Admin123! |
| マネージャー | manager@kanri.dev | Manager123! |
| 一般社員 | employee@kanri.dev | Employee123! |

---

## ローカル開発

### バックエンド
```bash
cd backend
npm install
cp .env.example .env
docker compose up postgres redis -d   # DB のみ起動
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev                           # http://localhost:3001
```

### フロントエンド
```bash
cd frontend
npm install
npm run dev                           # http://localhost:3000
```

---

## API エンドポイント

### 認証 `/api/v1/auth`
| Method | Path | 認証 | 説明 |
|---|---|---|---|
| POST | `/login` | — | ログイン |
| POST | `/refresh` | — | トークン更新 |
| POST | `/logout` | ✅ | ログアウト |
| POST | `/logout-all` | ✅ | 全デバイスからログアウト |
| GET | `/profile` | ✅ | 自分のプロフィール |

### ユーザー管理 `/api/v1/users`
| Method | Path | 権限 | 説明 |
|---|---|---|---|
| GET | `/` | admin, manager | 一覧 (検索・ページネーション) |
| POST | `/` | admin | 新規作成 |
| GET | `/:id` | admin, manager | 詳細取得 |
| PATCH | `/:id` | admin | 更新 |
| DELETE | `/:id` | admin | ソフトデリート |
| GET | `/stats/dashboard` | admin, manager | ダッシュボード統計 |

### 部署管理 `/api/v1/departments`
| Method | Path | 権限 | 説明 |
|---|---|---|---|
| GET | `/` | all | 一覧 |
| POST | `/` | admin | 新規作成 |
| GET | `/:id` | all | 詳細 |
| PATCH | `/:id` | admin | 更新 |
| DELETE | `/:id` | admin | 削除 |

### 承認フロー `/api/v1/approvals`
| Method | Path | 説明 |
|---|---|---|
| GET | `/` | 一覧 (ステータス絞り込み) |
| POST | `/` | 申請作成 |
| PATCH | `/:id/approve` | 承認 |
| PATCH | `/:id/reject` | 却下 |
| GET | `/status/summary` | ステータスサマリー |

### 監査ログ `/api/v1/audit-logs`
| Method | Path | 権限 | 説明 |
|---|---|---|---|
| GET | `/` | admin | 一覧 (フィルター・ページネーション) |
| GET | `/recent` | admin, manager | 直近アクティビティ |

### CSV `/api/v1/csv`
| Method | Path | 説明 |
|---|---|---|
| GET | `/users/export` | ユーザー一覧をCSVエクスポート |
| POST | `/users/import` | CSVからユーザー一括インポート |

---

## テスト

```bash
cd backend
npm test                 # 全テスト実行
npm run test:coverage    # カバレッジレポート生成
npm run typecheck        # 型チェック
```

---

## レスポンス形式

全エンドポイントで統一されたレスポンス構造を使用します。

**成功時**
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

**エラー時**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "入力値が正しくありません",
    "details": [
      { "field": "email", "message": "有効なメールアドレスを入力してください" }
    ]
  }
}
```

---

## ディレクトリ構成

```
backend/
├── prisma/
│   ├── schema.prisma          # データモデル定義
│   └── seed.ts                # 初期データ投入
├── src/
│   ├── config/
│   │   ├── env.ts             # 環境変数バリデーション (Zod)
│   │   └── swagger.ts         # OpenAPI 設定
│   ├── lib/
│   │   ├── prisma.ts          # Prisma クライアント (シングルトン)
│   │   ├── redis.ts           # Redis クライアント
│   │   └── logger.ts          # Winston ロガー
│   ├── middleware/
│   │   ├── authenticate.ts    # JWT 検証
│   │   ├── authorize.ts       # 権限チェック
│   │   ├── audit.ts           # 操作ログ自動記録
│   │   ├── rateLimiter.ts     # レート制限
│   │   └── errorHandler.ts    # 統一エラーハンドリング
│   ├── modules/               # 機能モジュール (ドメイン駆動)
│   │   ├── auth/
│   │   ├── users/
│   │   ├── departments/
│   │   ├── approvals/
│   │   ├── audit-logs/
│   │   └── csv/
│   ├── utils/
│   │   ├── response.ts        # レスポンスヘルパー
│   │   ├── pagination.ts      # ページネーションユーティリティ
│   │   └── retry.ts           # 指数バックオフ付きリトライ
│   ├── app.ts                 # Express アプリ設定
│   └── server.ts              # エントリーポイント
└── tests/
    ├── auth.test.ts
    └── users.test.ts
```

---

## 環境変数

| 変数名 | 必須 | 説明 | 例 |
|---|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL 接続URL | `postgresql://user:pass@localhost:5432/db` |
| `REDIS_URL` | ✅ | Redis 接続URL | `redis://localhost:6379` |
| `JWT_SECRET` | ✅ | JWTシークレット (32文字以上) | `your-secret-key-here...` |
| `JWT_REFRESH_SECRET` | ✅ | リフレッシュトークン用シークレット | `your-refresh-secret...` |
| `JWT_EXPIRES_IN` | — | アクセストークン有効期限 | `15m` (デフォルト) |
| `JWT_REFRESH_EXPIRES_IN` | — | リフレッシュトークン有効期限 | `7d` (デフォルト) |
| `PORT` | — | サーバーポート | `3001` (デフォルト) |
| `NODE_ENV` | — | 実行環境 | `production` |
| `CORS_ORIGIN` | — | 許可するオリジン (カンマ区切り) | `https://your-app.vercel.app` |

---

## コントリビューション

1. `feature/your-feature` ブランチを作成
2. 変更を実装・テストを追加
3. `npm run typecheck && npm test` が通ることを確認
4. プルリクエストを作成

---

## ライセンス

MIT License — 詳細は [LICENSE](./LICENSE) を参照
