import { useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, TrendingUp, User } from 'lucide-react'

const tabs = [
  { path: '/picker/dashboard',   label: 'Home',        icon: LayoutDashboard },
  { path: '/picker/performance', label: 'Performance', icon: TrendingUp },
  { path: '/picker/profile',     label: 'Profile',     icon: User },
]

function PickerLayout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()

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
                  isActive ? 'text-orange-500' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-orange-500 rounded-full" />
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

export default PickerLayout
