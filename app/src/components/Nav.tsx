import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import Icon from './Icon'

const NAV: { to: string; label: string; prefix?: string }[] = [
  { to: '/matches', label: 'Matches', prefix: '/match' },
  { to: '/portfolio', label: 'Portfolio' },
  { to: '/leaderboard', label: 'Leaderboard' },
]

const ring = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B35] focus-visible:ring-offset-2'

export default function Nav() {
  const loc = useLocation()
  const [open, setOpen] = useState(false)
  useEffect(() => { setOpen(false) }, [loc.pathname])

  const isActive = (to: string, prefix?: string) => (prefix ? loc.pathname.startsWith(prefix) : loc.pathname === to)

  return (
    <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md shadow-sm">
      <div className="h-[3px] accent-gradient" />
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-[72px] flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Link to="/" className={`flex items-center gap-2.5 group rounded-lg ${ring}`}>
            <div className="w-8 h-8 rounded-lg bg-[#1E3A5F] flex items-center justify-center">
              <Icon icon="lucide:line-chart" className="text-white text-lg" />
            </div>
            <span className="font-display font-extrabold text-xl text-[#1E3A5F]">Sharpe</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className={`text-sm transition-colors rounded ${ring} ${
                  isActive(n.to, n.prefix)
                    ? 'text-[#1E3A5F] font-bold underline decoration-2 decoration-[#FF6B35] underline-offset-8'
                    : 'text-slate-400 font-medium hover:text-[#1E3A5F]'
                }`}
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <WalletMultiButton />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            className={`md:hidden w-10 h-10 flex items-center justify-center rounded-xl text-[#1E3A5F] hover:bg-slate-100 transition-colors ${ring}`}
          >
            <Icon icon={open ? 'lucide:x' : 'lucide:menu'} className="text-xl" aria-hidden />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="md:hidden border-t border-slate-100 bg-white/95 backdrop-blur-md px-4 py-2">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className={`block rounded-xl px-4 py-3 text-base font-semibold transition-colors ${ring} ${
                isActive(n.to, n.prefix) ? 'bg-[#FF6B35]/10 text-[#FF6B35]' : 'text-[#1E3A5F] hover:bg-slate-50'
              }`}
            >
              {n.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  )
}
