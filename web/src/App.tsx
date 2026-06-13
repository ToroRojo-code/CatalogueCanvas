import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './api/auth'
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
      <Nav />
      {children}
    </ProtectedRoute>
  )
}

function App() {
  return (
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
  )
}

export default App
