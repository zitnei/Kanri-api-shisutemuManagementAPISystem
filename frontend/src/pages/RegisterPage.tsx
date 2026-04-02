import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AxiosError } from 'axios';
import apiClient from '../api/client';

export function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('すべての項目を入力してください。');
      return;
    }

    if (password !== confirmPassword) {
      setError('パスワードが一致しません。');
      return;
    }

    if (password.length < 8) {
      setError('パスワードは8文字以上で入力してください。');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/auth/register', {
        name: name.trim(),
        email: email.trim(),
        password,
      });
      navigate('/login', { replace: true, state: { registered: true } });
    } catch (err) {
      const axiosErr = err as AxiosError<{ error: { message: string } }>;
      const message =
        axiosErr.response?.data?.error?.message ||
        '登録に失敗しました。しばらく経ってから再度お試しください。';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0c0c0d] flex">

      {/* ── Left panel (brand) ── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-16 border-r border-white/[0.06]">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-[#f4f4f5] rounded-sm flex items-center justify-center">
            <span className="text-[#0c0c0d] text-xs font-bold tracking-tight">K</span>
          </div>
          <span className="text-sm font-semibold tracking-wide text-[#f4f4f5]">KANRI</span>
        </Link>

        <div>
          <blockquote
            className="text-3xl leading-snug tracking-[-0.02em] text-[#f4f4f5] mb-8"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
          >
            "30日間、無料で<br />
            すべての機能を使える。"
          </blockquote>
          <ul className="space-y-3">
            {[
              'ユーザー管理・ロール設定',
              '承認フローの構築',
              '監査ログの自動記録',
              '部署管理・階層設定',
            ].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <div className="w-1 h-1 rounded-full bg-[#52525b]" />
                <span className="text-sm text-[#71717a]">{item}</span>
              </li>
            ))}
          </ul>
        </div>

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
              アカウントを作成
            </h1>
            <p className="text-sm text-[#71717a]">
              30日間無料。クレジットカード不要。
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-medium text-[#a1a1aa] mb-2">
                お名前
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="山田 太郎"
                required
                autoComplete="name"
                autoFocus
                className="w-full bg-[#111113] border border-white/[0.08] text-[#f4f4f5] placeholder-[#3f3f46] rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-white/20 transition-colors duration-150"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-[#a1a1aa] mb-2">
                メールアドレス
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                autoComplete="email"
                className="w-full bg-[#111113] border border-white/[0.08] text-[#f4f4f5] placeholder-[#3f3f46] rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-white/20 transition-colors duration-150"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-[#a1a1aa] mb-2">
                パスワード
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8文字以上"
                required
                autoComplete="new-password"
                className="w-full bg-[#111113] border border-white/[0.08] text-[#f4f4f5] placeholder-[#3f3f46] rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-white/20 transition-colors duration-150"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-medium text-[#a1a1aa] mb-2">
                パスワード（確認）
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="new-password"
                className="w-full bg-[#111113] border border-white/[0.08] text-[#f4f4f5] placeholder-[#3f3f46] rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-white/20 transition-colors duration-150"
              />
            </div>

            {/* Error */}
            {error && (
              <p className="text-xs text-red-400 py-1">{error}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#f4f4f5] text-[#0c0c0d] rounded-sm py-3 text-sm font-medium hover:bg-white transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed mt-2"
            >
              {loading ? '登録中...' : 'アカウントを作成'}
            </button>

            <p className="text-xs text-[#52525b] text-center leading-relaxed">
              登録することで、
              <a href="#" className="underline underline-offset-2">利用規約</a>
              および
              <a href="#" className="underline underline-offset-2">プライバシーポリシー</a>
              に同意したとみなされます。
            </p>
          </form>

          {/* Login link */}
          <div className="mt-6 pt-6 border-t border-white/[0.06]">
            <p className="text-sm text-[#71717a] text-center">
              すでにアカウントをお持ちの方は{' '}
              <Link
                to="/login"
                className="text-[#f4f4f5] hover:text-white underline underline-offset-4 decoration-white/30 hover:decoration-white/60 transition-all duration-150"
              >
                ログイン
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
