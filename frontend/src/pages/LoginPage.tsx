import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AxiosError } from 'axios';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { loginUser } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('メールアドレスとパスワードを入力してください。');
      return;
    }

    setLoading(true);
    try {
      await loginUser(email.trim(), password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const axiosErr = err as AxiosError<{ error: { message: string } }>;
      const message =
        axiosErr.response?.data?.error?.message ||
        'ログインに失敗しました。メールアドレスとパスワードを確認してください。';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0c0c0d] flex">

      {/* ── Left panel (brand) ── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col p-16 border-r border-white/[0.06]">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-[#f4f4f5] rounded-sm flex items-center justify-center">
            <span className="text-[#0c0c0d] text-xs font-bold tracking-tight">K</span>
          </div>
          <span className="text-sm font-semibold tracking-wide text-[#f4f4f5]">KANRI</span>
        </Link>

        {/* Brand copy — centered */}
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <blockquote
            className="text-3xl leading-snug tracking-[-0.02em] text-[#f4f4f5] mb-6"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
          >
            "組織のガバナンスを、<br />
            シンプルに。"
          </blockquote>
          <p className="text-sm text-[#52525b] leading-relaxed max-w-xs">
            ユーザー管理、承認フロー、監査ログ。
            エンタープライズに必要なすべてを一つのプラットフォームで。
          </p>
        </div>

        {/* Footer */}
        <p className="text-xs text-[#3f3f46]">
          &copy; {new Date().getFullYear()} Kanri Management System
        </p>
      </div>

      {/* ── Right panel (form) ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        {/* Mobile logo */}
        <div className="lg:hidden mb-10">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-[#f4f4f5] rounded-sm flex items-center justify-center">
              <span className="text-[#0c0c0d] text-xs font-bold">K</span>
            </div>
            <span className="text-sm font-semibold tracking-wide text-[#f4f4f5]">KANRI</span>
          </Link>
        </div>

        <div className="w-full max-w-sm">
          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-[#f4f4f5] mb-2 tracking-[-0.02em]">
              ログイン
            </h1>
            <p className="text-sm text-[#71717a]">
              アカウントにログインしてください
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-[#a1a1aa] mb-2">
                メールアドレス
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@kanri.dev"
                required
                autoComplete="email"
                autoFocus
                className="w-full bg-[#111113] border border-white/[0.08] text-[#f4f4f5] placeholder-[#3f3f46] rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-white/20 transition-colors duration-150"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-[#a1a1aa] mb-2">
                パスワード
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full bg-[#111113] border border-white/[0.08] text-[#f4f4f5] placeholder-[#3f3f46] rounded-sm px-4 py-3 pr-10 text-sm focus:outline-none focus:border-white/20 transition-colors duration-150"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#52525b] hover:text-[#a1a1aa] transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-xs text-red-400 py-2">{error}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#f4f4f5] text-[#0c0c0d] rounded-sm py-3 text-sm font-medium hover:bg-white transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'ログイン中...' : 'ログイン'}
            </button>
          </form>

          {/* Register link */}
          <div className="mt-6 pt-6 border-t border-white/[0.06]">
            <p className="text-sm text-[#71717a] text-center">
              アカウントをお持ちでない方は{' '}
              <Link
                to="/register"
                className="text-[#f4f4f5] hover:text-white underline underline-offset-4 decoration-white/30 hover:decoration-white/60 transition-all duration-150"
              >
                新規登録
              </Link>
            </p>
          </div>

          {/* Demo credentials */}
          <div className="mt-6 p-4 border border-white/[0.06] rounded-sm">
            <p className="text-xs text-[#52525b] mb-2 font-medium">デモアカウント</p>
            <div className="space-y-1.5">
              <p className="text-xs text-[#3f3f46]">
                <span className="text-[#52525b]">管理者</span>　admin@kanri.dev / Admin123!
              </p>
              <p className="text-xs text-[#3f3f46]">
                <span className="text-[#52525b]">マネージャー</span>　manager@kanri.dev / Manager123!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
