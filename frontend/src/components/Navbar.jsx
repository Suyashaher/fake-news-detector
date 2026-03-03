import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Menu, X, Shield, LogOut, History, LayoutDashboard, User } from 'lucide-react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="glass sticky top-0 z-50 border-b border-dark-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg group-hover:shadow-primary-500/25 transition-shadow">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold gradient-text hidden sm:block">
              FakeGuard AI
            </span>
          </Link>

          {/* Desktop nav */}
          {user && (
            <div className="hidden md:flex items-center gap-1">
              <Link to="/" className="flex items-center gap-2 px-4 py-2 rounded-lg text-dark-300 hover:text-white hover:bg-dark-700/50 transition-all text-sm font-medium">
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <Link to="/history" className="flex items-center gap-2 px-4 py-2 rounded-lg text-dark-300 hover:text-white hover:bg-dark-700/50 transition-all text-sm font-medium">
                <History className="w-4 h-4" />
                History
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="flex items-center gap-2 px-4 py-2 rounded-lg text-dark-300 hover:text-white hover:bg-dark-700/50 transition-all text-sm font-medium">
                  <User className="w-4 h-4" />
                  Admin
                </Link>
              )}
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-dark-800 border border-dark-700">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-xs font-bold text-white">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-dark-300">{user.name}</span>
                  {user.role === 'admin' && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary-500/20 text-primary-400 font-medium">
                      ADMIN
                    </span>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-4 py-2 text-sm text-dark-300 hover:text-white transition-colors">
                  Sign In
                </Link>
                <Link to="/register" className="px-4 py-2 text-sm font-medium bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors">
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            {user && (
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-lg text-dark-400 hover:text-white transition-colors"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && user && (
          <div className="md:hidden pb-4 animate-slide-down">
            <div className="flex flex-col gap-1 pt-2 border-t border-dark-700/50">
              <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-4 py-3 rounded-lg text-dark-300 hover:text-white hover:bg-dark-700/50 transition-all">
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <Link to="/history" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-4 py-3 rounded-lg text-dark-300 hover:text-white hover:bg-dark-700/50 transition-all">
                <History className="w-4 h-4" />
                History
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-4 py-3 rounded-lg text-dark-300 hover:text-white hover:bg-dark-700/50 transition-all">
                  <User className="w-4 h-4" />
                  Admin
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
