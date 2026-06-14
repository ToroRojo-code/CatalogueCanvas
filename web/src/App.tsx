import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './api/auth'
import { ACCENT_PRESETS, useAppearance } from './api/appearance'
import { Nav } from './components/Nav'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { ItemEdit } from './pages/ItemEdit'
import { Collections } from './pages/Collections'
import { CollectionEdit } from './pages/CollectionEdit'
import { Portfolios } from './pages/Portfolios'
import { PortfolioEdit } from './pages/PortfolioEdit'
import { Settings } from './pages/Settings'
import { Upload } from './pages/Upload'
import { Deck } from './portfolio/Deck'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { authenticated, loading } = useAuth()
  if (loading) return null
  if (!authenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="cc-shell">
        <Nav />
        <main className="cc-main">{children}</main>
      </div>
    </ProtectedRoute>
  )
}

function App() {
  const { appearance } = useAppearance()
  const preset = ACCENT_PRESETS[appearance.accent]
  const accentStyle = preset.accent
    ? { '--accent': preset.accent, '--accent-dim': preset.dim, '--accent-contrast': preset.contrast } as React.CSSProperties
    : undefined

  return (
    <div
      className="cc-app"
      data-direction="grid"
      data-theme={appearance.theme}
      data-nav={appearance.nav}
      data-density={appearance.density}
      style={accentStyle}
    >
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/p/:slug" element={<Deck />} />
        <Route path="/" element={<AdminLayout><Dashboard /></AdminLayout>} />
        <Route path="/items/:id" element={<AdminLayout><ItemEdit /></AdminLayout>} />
        <Route path="/collections" element={<AdminLayout><Collections /></AdminLayout>} />
        <Route path="/collections/:id" element={<AdminLayout><CollectionEdit /></AdminLayout>} />
        <Route path="/portfolios" element={<AdminLayout><Portfolios /></AdminLayout>} />
        <Route path="/portfolios/:id" element={<AdminLayout><PortfolioEdit /></AdminLayout>} />
        <Route path="/upload" element={<AdminLayout><Upload /></AdminLayout>} />
        <Route path="/settings" element={<AdminLayout><Settings /></AdminLayout>} />
      </Routes>
    </div>
  )
}

export default App
