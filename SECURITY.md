# Security Policy

## サポート対象バージョン

| バージョン | サポート状況 |
|---|---|
| 1.x (最新) | ✅ サポート中 |

## セキュリティ実装

### 認証・認可
- **JWT** アクセストークン (有効期限: 15分) + リフレッシュトークン (7日)
- **トークンローテーション**: リフレッシュ時に古いトークンを自動無効化
- **RBAC**: `admin` / `manager` / `employee` の3段階ロール

### パスワード
- **bcrypt** によるハッシュ化 (cost factor: 12)
- 平文パスワードはログ・DBに一切保存しない

### 入力バリデーション
- **Zod** による全リクエストボディのスキーマバリデーション
- Prisma ORM による SQL インジェクション防止

### HTTP セキュリティ
- **Helmet** による HTTP ヘッダー強化
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Strict-Transport-Security`
  - `Content-Security-Policy`
- **CORS** ホワイトリスト制御 (環境変数で管理)

### レート制限
- API 全体: 100 req / 15min
- 認証エンドポイント: 10 req / 15min (ブルートフォース対策)
- CSV エクスポート: 5 req / 1min

### 監査・可観測性
- 全 CRUD 操作を監査ログに自動記録 (誰が・何を・いつ・どのIPから)
- ログイン成功/失敗を `login_history` テーブルに全件記録
- 本番環境でのスタックトレース非公開

### データ保護
- **ソフトデリート**: `deletedAt` フラグによる論理削除 (完全削除防止)
- 機密フィールド (`passwordHash`, `token`) はAPIレスポンスから除外

## 脆弱性の報告

セキュリティ上の問題を発見した場合は、**Issue ではなく** 以下の方法でご報告ください。

1. GitHub の [Security Advisories](https://github.com/zitnei/Kanri-api-shisutemuManagementAPISystem/security/advisories) から報告
2. または、リポジトリ管理者に直接ご連絡ください

報告いただいた内容は 72 時間以内に確認し、対応状況をお伝えします。

## 本番環境のチェックリスト

- [ ] `JWT_SECRET` を 32 文字以上のランダム文字列に設定
- [ ] `JWT_REFRESH_SECRET` を別のランダム文字列に設定
- [ ] `NODE_ENV=production` を設定
- [ ] `CORS_ORIGIN` を実際のフロントエンド URL のみに制限
- [ ] データベースのパスワードを強力なものに変更
- [ ] HTTPS を強制 (リバースプロキシまたはロードバランサー側で設定)
- [ ] Redis に認証パスワードを設定
