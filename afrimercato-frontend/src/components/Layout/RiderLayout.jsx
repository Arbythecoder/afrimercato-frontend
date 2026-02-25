import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard,
  Package,
  Banknote,
  UserCircle,
  LogOut
} from 'lucide-react'

const tabs = [
  { path: '/rider/dashboard', label: 'Home', icon: LayoutDashboard },
  { path: '/rider/deliveries', label: 'Deliveries', icon: Package },
  { path: '/rider/earnings', label: 'Earnings', icon: Banknote },
  { path: '/rider/profile', label: 'Profile', icon: UserCircle },
]

function RiderLayout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {children}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-gray-100 safe-area-pb">
        <div className="flex items-stretch justify-around max-w-lg mx-auto">
          {tabs.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-3 text-xs font-semibold transition-all relative ${
                  isActive ? 'text-violet-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-violet-600 rounded-full" />
                )}
                <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
                <span>{label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

export default RiderLayout
