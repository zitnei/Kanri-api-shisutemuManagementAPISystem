import { Link } from 'react-router-dom';

const NAV_LINKS = [
  { label: '機能', href: '#features' },
  { label: 'セキュリティ', href: '#security' },
  { label: 'ドキュメント', href: '#docs' },
];

const FEATURES = [
  {
    number: '01',
    title: 'ユーザー管理',
    description:
      '組織のメンバーを一元管理。ロールベースのアクセス制御で、適切な権限を適切な人に付与します。',
  },
  {
    number: '02',
    title: '承認フロー',
    description:
      '申請から承認まで、組織固有のワークフローを構築。承認待ちの可視化で、滞留ゼロを実現します。',
  },
  {
    number: '03',
    title: '監査ログ',
    description:
      'すべての操作を記録・追跡。コンプライアンス対応と内部統制を、導入即日から実現します。',
  },
  {
    number: '04',
    title: '部署管理',
    description:
      '組織階層をそのままシステムへ。部署ごとのアクセス権限と承認者を、直感的に設定できます。',
  },
  {
    number: '05',
    title: 'API統合',
    description:
      '既存のシステムとシームレスに連携。REST APIで、あらゆる業務アプリケーションと接続できます。',
  },
  {
    number: '06',
    title: 'リアルタイム通知',
    description:
      '承認依頼や重要な変更を即時通知。情報の見落としをなくし、チーム全体の動きを加速します。',
  },
];

const STATS = [
  { value: '99.9%', label: '稼働率SLA' },
  { value: '<50ms', label: 'API応答時間' },
  { value: 'SOC2', label: 'セキュリティ認証' },
];

export function HomePage() {
  return (
    <div className="min-h-screen bg-[#0c0c0d] text-[#f4f4f5]">

      {/* ── Navigation ── */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-[#0c0c0d]/90 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Wordmark */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-[#f4f4f5] rounded-sm flex items-center justify-center">
              <span className="text-[#0c0c0d] text-xs font-bold tracking-tight">K</span>
            </div>
            <span className="text-sm font-semibold tracking-wide text-[#f4f4f5]">KANRI</span>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-[#a1a1aa] hover:text-[#f4f4f5] transition-colors duration-150"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Auth CTAs */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm text-[#a1a1aa] hover:text-[#f4f4f5] transition-colors duration-150"
            >
              ログイン
            </Link>
            <Link
              to="/register"
              className="text-sm bg-[#f4f4f5] text-[#0c0c0d] px-4 py-2 rounded-sm font-medium hover:bg-white transition-colors duration-150"
            >
              無料で始める
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="pt-40 pb-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl">
            {/* Eyebrow */}
            <p className="text-xs font-medium tracking-[0.2em] text-[#71717a] uppercase mb-8">
              エンタープライズ向け管理プラットフォーム
            </p>

            {/* Headline */}
            <h1
              className="font-display text-5xl md:text-6xl lg:text-7xl leading-[1.08] tracking-[-0.02em] text-[#f4f4f5] mb-8"
              style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
            >
              組織のAPIを、<br />
              <em className="not-italic text-[#a1a1aa]">一元管理する。</em>
            </h1>

            {/* Sub */}
            <p className="text-lg text-[#71717a] leading-relaxed max-w-xl mb-12">
              Kanriは、ユーザー管理・承認フロー・監査ログを統合した
              エンタープライズ向けAPIシステムです。
              導入即日から、組織のガバナンスを強化します。
            </p>

            {/* CTAs */}
            <div className="flex items-center gap-4">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-[#f4f4f5] text-[#0c0c0d] px-6 py-3 rounded-sm text-sm font-medium hover:bg-white transition-colors duration-150"
              >
                無料で始める
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm text-[#a1a1aa] hover:text-[#f4f4f5] transition-colors duration-150"
              >
                ログインして続ける
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Divider + Stats ── */}
      <section className="border-y border-white/[0.06] py-12 px-6" id="security">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-3 divide-x divide-white/[0.06]">
            {STATS.map((stat) => (
              <div key={stat.label} className="px-8 first:pl-0 last:pr-0 text-center">
                <p
                  className="text-3xl font-light text-[#f4f4f5] mb-1"
                  style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                >
                  {stat.value}
                </p>
                <p className="text-xs text-[#71717a] tracking-wide">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-32 px-6" id="features">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <div className="mb-20">
            <p className="text-xs font-medium tracking-[0.2em] text-[#71717a] uppercase mb-4">
              機能
            </p>
            <h2
              className="text-4xl md:text-5xl leading-tight tracking-[-0.02em] text-[#f4f4f5]"
              style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
            >
              必要なすべてが、<br />
              はじめから揃っている。
            </h2>
          </div>

          {/* Feature grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.06]">
            {FEATURES.map((feature) => (
              <div
                key={feature.number}
                className="bg-[#0c0c0d] p-8 hover:bg-[#111113] transition-colors duration-200 group"
              >
                <span className="text-xs font-mono text-[#3f3f46] mb-6 block">
                  {feature.number}
                </span>
                <h3 className="text-base font-medium text-[#f4f4f5] mb-3">
                  {feature.title}
                </h3>
                <p className="text-sm text-[#71717a] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Band ── */}
      <section className="border-t border-white/[0.06] py-32 px-6" id="docs">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
            <div className="max-w-xl">
              <h2
                className="text-4xl md:text-5xl leading-tight tracking-[-0.02em] text-[#f4f4f5] mb-6"
                style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
              >
                今日から、<br />
                チームのガバナンスを強化する。
              </h2>
              <p className="text-[#71717a] text-base leading-relaxed">
                30日間の無料トライアル。クレジットカード不要。
                いつでもキャンセル可能です。
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 bg-[#f4f4f5] text-[#0c0c0d] px-8 py-3.5 rounded-sm text-sm font-medium hover:bg-white transition-colors duration-150 whitespace-nowrap"
              >
                無料トライアルを開始
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 border border-white/[0.12] text-[#a1a1aa] hover:text-[#f4f4f5] hover:border-white/20 px-8 py-3.5 rounded-sm text-sm transition-all duration-150 whitespace-nowrap"
              >
                ログイン
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/[0.06] py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 bg-[#f4f4f5] rounded-sm flex items-center justify-center">
              <span className="text-[#0c0c0d] text-[9px] font-bold">K</span>
            </div>
            <span className="text-xs font-medium tracking-wide text-[#52525b]">KANRI</span>
          </div>
          <p className="text-xs text-[#3f3f46]">
            &copy; {new Date().getFullYear()} Kanri Management System. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-xs text-[#52525b] hover:text-[#a1a1aa] transition-colors">プライバシー</a>
            <a href="#" className="text-xs text-[#52525b] hover:text-[#a1a1aa] transition-colors">利用規約</a>
            <a href="#" className="text-xs text-[#52525b] hover:text-[#a1a1aa] transition-colors">お問い合わせ</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
