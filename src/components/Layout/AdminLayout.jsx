import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, Store, Bike, ClipboardList, Users,
  ShieldCheck, BarChart2, ShoppingBag, LogOut
} from 'lucide-react'

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard',  path: '/admin/dashboard' },
  { icon: Store,           label: 'Vendors',    path: '/admin/vendors' },
  { icon: Bike,            label: 'Riders',     path: '/admin/riders' },
  { icon: ClipboardList,   label: 'Pickers',    path: '/admin/pickers' },
  { icon: Users,           label: 'Customers',  path: '/admin/customers' },
  { icon: ShoppingBag,     label: 'Orders',     path: '/admin/orders' },
  { icon: ShieldCheck,     label: 'Audit Logs', path: '/admin/audit-logs' },
  { icon: BarChart2,       label: 'Analytics',  path: '/admin/analytics' },
]

function Sidebar({ location, user, logout, onNavClick }) {
  return (
    <aside className="w-64 bg-afri-gray-900 flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-afri-green to-afri-green-dark rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-black text-sm">A</span>
          </div>
          <div>
            <p className="text-white font-bold text-sm">Afrimercato</p>
            <p className="text-gray-400 text-xs">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ icon: Icon, label, path }) => {
          const active = location.pathname === path
          return (
            <Link
              key={path}
              to={path}
              onClick={onNavClick}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? 'bg-afri-green/15 text-afri-green border border-afri-green/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/8'
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User + logout */}
      <div className="px-3 py-4 border-t border-white/10 flex-shrink-0">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl">
          <div className="w-8 h-8 bg-gradient-to-br from-afri-yellow-dark to-[#E07000] rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user?.name?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold truncate">{user?.name || 'Admin'}</p>
            <p className="text-gray-400 text-xs truncate">{user?.email || ''}</p>
          </div>
          <button onClick={logout} className="text-gray-500 hover:text-red-400 transition-colors" title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  )
}

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-afri-gray-50 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-col flex-shrink-0 shadow-xl">
        <Sidebar location={location} user={user} logout={logout} onNavClick={() => {}} />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative w-64 flex flex-col shadow-2xl">
            <Sidebar
              location={location}
              user={user}
              logout={logout}
              onNavClick={() => setSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile-only top bar with hamburger */}
        <div className="lg:hidden bg-afri-gray-900 px-4 py-3 flex items-center gap-3 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            aria-label="Open menu"
          >
            <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
              <rect width="18" height="2" rx="1" fill="currentColor"/>
              <rect y="6" width="13" height="2" rx="1" fill="currentColor"/>
              <rect y="12" width="18" height="2" rx="1" fill="currentColor"/>
            </svg>
          </button>
          <span className="text-white font-semibold text-sm">Afrimercato Admin</span>
        </div>

        {/* Page content — scrolls independently */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  )
}
