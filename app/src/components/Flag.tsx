import Icon from './Icon'
import { flagCode } from '../lib/flags'

/**
 * Round national-team flag for a TxLINE participant name. Renders a circle-flags
 * SVG via Iconify (crisp everywhere, unlike emoji flags on Windows); falls back
 * to a muted globe when the country isn't recognised so the UI never breaks.
 */
export default function Flag({ name, className = 'text-xl' }: { name: string; className?: string }) {
  const code = flagCode(name)
  if (!code) return <Icon icon="lucide:globe" className={`shrink-0 text-slate-300 ${className}`} />
  return <Icon icon={`circle-flags:${code}`} className={`shrink-0 rounded-full ${className}`} />
}
