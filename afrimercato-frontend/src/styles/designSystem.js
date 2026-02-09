/**
 * AFRIMERCATO DESIGN SYSTEM
 * ========================
 * Consistent Tailwind classes for all components
 * Use these instead of ad-hoc styling
 */

export const designSystem = {
  // BUTTONS
  buttons: {
    // Primary action buttons (CTAs)
    primary: {
      base: 'bg-gradient-to-r from-afri-green to-afri-green-dark text-white font-bold rounded-xl transition-all transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
      sm: 'px-4 py-2 text-sm min-h-[36px]',
      md: 'px-6 py-3 text-base min-h-[44px]',
      lg: 'px-8 py-4 text-lg min-h-[52px]',
    },
    // Secondary outline buttons
    secondary: {
      base: 'border-2 border-afri-green text-afri-green bg-white rounded-xl font-semibold hover:bg-afri-green hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed',
      sm: 'px-4 py-2 text-sm min-h-[36px]',
      md: 'px-6 py-3 text-base min-h-[44px]',
      lg: 'px-8 py-4 text-lg min-h-[52px]',
    },
    // Ghost buttons (minimal)
    ghost: {
      base: 'text-afri-green hover:bg-afri-green-light/10 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed',
      sm: 'px-3 py-1.5 text-sm min-h-[36px]',
      md: 'px-4 py-2 text-base min-h-[44px]',
      lg: 'px-6 py-3 text-lg min-h-[52px]',
    },
    // Danger buttons
    danger: {
      base: 'bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed',
      sm: 'px-4 py-2 text-sm min-h-[36px]',
      md: 'px-6 py-3 text-base min-h-[44px]',
      lg: 'px-8 py-4 text-lg min-h-[52px]',
    },
  },

  // INPUTS
  inputs: {
    base: 'w-full px-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-afri-green focus:border-afri-green transition-all disabled:bg-gray-100 disabled:cursor-not-allowed',
    sm: 'py-2 text-sm min-h-[36px]',
    md: 'py-3 text-base min-h-[44px]',
    lg: 'py-4 text-lg min-h-[52px]',
    error: 'border-red-500 focus:ring-red-500 focus:border-red-500',
  },

  // CARDS
  cards: {
    default: 'bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow',
    outlined: 'bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-afri-green transition-colors',
    elevated: 'bg-white rounded-2xl shadow-2xl p-8',
  },

  // TYPOGRAPHY
  typography: {
    h1: 'text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight',
    h2: 'text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight',
    h3: 'text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 leading-snug',
    h4: 'text-xl md:text-2xl font-bold text-gray-900 leading-snug',
    h5: 'text-lg md:text-xl font-semibold text-gray-900',
    h6: 'text-base md:text-lg font-semibold text-gray-900',
    body: 'text-base text-gray-700 leading-relaxed',
    bodyLarge: 'text-lg text-gray-700 leading-relaxed',
    bodySmall: 'text-sm text-gray-600 leading-relaxed',
    caption: 'text-xs text-gray-500',
  },

  // SPACING
  spacing: {
    section: 'py-12 md:py-16 lg:py-20',
    container: 'px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto',
    cardGap: 'space-y-4 md:space-y-6',
    elementGap: 'gap-4 md:gap-6',
  },

  // RESPONSIVE BREAKPOINTS (for reference)
  breakpoints: {
    sm: '640px',   // Mobile landscape
    md: '768px',   // Tablet
    lg: '1024px',  // Desktop
    xl: '1280px',  // Large desktop
    '2xl': '1536px', // Extra large
  },

  // COLORS (for reference)
  colors: {
    primary: '#00B207',      // afri-green
    primaryDark: '#2C742F', // afri-green-dark
    primaryLight: '#84D187', // afri-green-light
    accent: '#FFD480',       // afri-yellow
    danger: '#EF4444',       // red-500
    success: '#10B981',      // green-500
    warning: '#F59E0B',      // yellow-500
    info: '#3B82F6',         // blue-500
  },

  // ANIMATIONS
  animations: {
    fadeIn: 'animate-fadeIn',
    slideUp: 'animate-slideUp',
    scaleIn: 'animate-scaleIn',
    pulse: 'animate-pulse',
  },
}

// Helper function to combine button classes
export function getButtonClasses(variant = 'primary', size = 'md') {
  const variantClasses = designSystem.buttons[variant] || designSystem.buttons.primary
  return `${variantClasses.base} ${variantClasses[size]}`
}

// Helper function to combine input classes
export function getInputClasses(size = 'md', hasError = false) {
  const baseClass = designSystem.inputs.base
  const sizeClass = designSystem.inputs[size]
  const errorClass = hasError ? designSystem.inputs.error : ''
  return `${baseClass} ${sizeClass} ${errorClass}`.trim()
}

export default designSystem
