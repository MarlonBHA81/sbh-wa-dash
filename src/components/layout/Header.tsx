import { useAuth } from '../../context/AuthContext'
import { Button } from '../ui/Button'

export function Header() {
  const { signOut, role } = useAuth()

  return (
    <header className="bg-charcoal-dark h-16 flex items-center px-6 justify-between shrink-0">
      <img
        src="/brand-assets/SBH_Secondary_logo_white.png"
        alt="Small Business Helpdesk"
        className="h-8 w-auto object-contain"
        onError={(e) => {
          const t = e.currentTarget
          t.style.display = 'none'
          t.nextElementSibling?.classList.remove('hidden')
        }}
      />
      <span className="hidden font-heading font-semibold text-white text-sm">SBH Analytics</span>
      <div className="flex items-center gap-4">
        {role && (
          <span className="font-body text-xs text-white/50 capitalize tracking-wide">
            {role === 'team' ? 'Team view' : 'Stakeholder view'}
          </span>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => void signOut()}
          className="!border-white/30 !text-white hover:!bg-white/10 hover:!text-white"
        >
          Sign out
        </Button>
      </div>
    </header>
  )
}
