import { Link } from 'react-router-dom'
import { useAuth } from '../api/auth'

export function Nav() {
  const { authenticated, logout } = useAuth()

  return (
    <nav className="topnav">
      <div className="nav-inner">
        <Link to="/" className="nav-logo">CatalogCanvas</Link>
        <div className="nav-links">
          <Link to="/">Items</Link>
          <Link to="/collections">Collections</Link>
          <Link to="/portfolios">Portfolios</Link>
          <Link to="/upload">Upload</Link>
          <Link to="/settings">Settings</Link>
          {authenticated && <button onClick={() => logout()}>Log out</button>}
        </div>
      </div>
    </nav>
  )
}
