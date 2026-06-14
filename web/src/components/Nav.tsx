import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../api/auth'
import { useAppearance } from '../api/appearance'
import { useSelection } from '../api/selection'

function NavItem({ to, end, label }: { to: string; end?: boolean; label: string }) {
  return (
    <NavLink to={to} end={end} className="cc-nav-link">
      {({ isActive }) => (
        <span aria-current={isActive ? 'true' : undefined}>
          {label}
          {isActive && <span className="cc-nav-dot" />}
        </span>
      )}
    </NavLink>
  )
}

export function Nav() {
  const { authenticated, logout } = useAuth()
  const { appearance, setAppearance } = useAppearance()
  const { batchMode, toggleBatchMode } = useSelection()
  const isDark = appearance.theme === 'dark'

  return (
    <nav className="cc-nav">
      <Link to="/" className="cc-logo">
        <span className="cc-mark" />
        CatalogCanvas
      </Link>
      <div className="cc-nav-links">
        <NavItem to="/" end label="Items" />
        <NavItem to="/collections" label="Collections" />
        <NavItem to="/portfolios" label="Portfolios" />
        <NavItem to="/upload" label="Upload" />
        <NavItem to="/settings" label="Settings" />
      </div>
      <div className="cc-nav-spacer" />
      {authenticated && (
        <div className="cc-nav__foot">
          <button
            className="cc-mode-btn"
            type="button"
            data-active={batchMode || undefined}
            onClick={toggleBatchMode}
          >
            Batch edit
          </button>
          <button
            className="cc-mode-btn"
            type="button"
            onClick={() => setAppearance({ theme: isDark ? 'light' : 'dark' })}
          >
            <span className="cc-mode-ind" />
            {isDark ? 'Dark' : 'Light'}
          </button>
          <button className="cc-btn cc-btn--ghost cc-btn--sm" onClick={() => logout()}>Log out</button>
        </div>
      )}
    </nav>
  )
}
