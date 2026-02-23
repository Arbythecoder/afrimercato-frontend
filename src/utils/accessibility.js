/**
 * AFRIMERCATO - ACCESSIBILITY CONFIGURATION
 * WCAG AA Compliance Guidelines for Components
 * 
 * This configuration ensures:
 * - Alt text for all images
 * - Adequate color contrast (4.5:1 for normal text)
 * - Keyboard navigation support
 * - Screen reader compatibility
 * - Reduced motion support
 */

// ==============================================================
// COLOR CONTRAST RATIOS (WCAG AA Compliant)
// ==============================================================

export const ACCESSIBLE_COLORS = {
  primary: {
    text: '#00695C', // Dark teal - sufficient contrast on white
    background: '#00897B', // Medium teal
    hover: '#00695C', // Darker teal for hover states
  },
  
  secondary: {
    text: '#424242', // Dark gray - 11:1 contrast
    background: '#757575', // Medium gray
  },
  
  success: {
    text: '#1B5E20', // Dark green - sufficient contrast
    background: '#4CAF50',
  },
  
  warning: {
    text: '#E65100', // Dark orange
    background: '#FF9800',
  },
  
  error: {
    text: '#B71C1C', // Dark red
    background: '#F44336',
  },
  
  // Text colors with guaranteed contrast
  textPrimary: '#212121', // 16:1 contrast on white
  textSecondary: '#757575', // 4.6:1 contrast on white
  textDisabled: '#9E9E9E', // 3:1 minimum
};

// ==============================================================
// ALT TEXT TEMPLATES
// ==============================================================

export const ALT_TEXT_TEMPLATES = {
  store: (storeName) => `${storeName} storefront - African and Caribbean groceries`,
  product: (productName, category) => `${productName} - ${category} product image`,
  avatar: (userName) => `${userName}'s profile picture`,
  logo: (businessName) => `${businessName} business logo`,
  hero: 'Fresh African vegetables and groceries - colorful produce display',
  empty: {
    cart: 'Empty shopping cart illustration',
    orders: 'No orders found illustration',
    stores: 'No stores available illustration',
  },
  icon: {
    search: 'Search icon',
    cart: 'Shopping cart icon',
    menu: 'Menu icon',
    close: 'Close icon',
    filter: 'Filter icon',
    location: 'Location pin icon',
  },
};

// ==============================================================
// ARIA LABELS FOR INTERACTIVE ELEMENTS
// ==============================================================

export const ARIA_LABELS = {
  navigation: {
    main: 'Main navigation',
    breadcrumb: 'Breadcrumb navigation',
    pagination: 'Pagination navigation',
  },
  
  buttons: {
    search: 'Search for stores and products',
    filter: 'Filter search results',
    addToCart: (productName) => `Add ${productName} to cart`,
    removeFromCart: (productName) => `Remove ${productName} from cart`,
    checkout: 'Proceed to checkout',
    menu: 'Open navigation menu',
    closeMenu: 'Close navigation menu',
  },
  
  forms: {
    search: 'Search for location, store name, or postcode',
    email: 'Email address',
    password: 'Password',
    quantity: (productName) => `Quantity for ${productName}`,
  },
  
  status: {
    loading: 'Loading content, please wait',
    error: 'Error message',
    success: 'Success message',
  },
};

// ==============================================================
// KEYBOARD NAVIGATION SUPPORT
// ==============================================================

export const KEYBOARD_SHORTCUTS = {
  ENTER: 13,
  SPACE: 32,
  ESCAPE: 27,
  ARROW_UP: 38,
  ARROW_DOWN: 40,
  TAB: 9,
};

/**
 * Handle keyboard navigation for interactive elements
 */
export function handleKeyboardNav(event, callback) {
  const { keyCode, key } = event;
  
  if (keyCode === KEYBOARD_SHORTCUTS.ENTER || keyCode === KEYBOARD_SHORTCUTS.SPACE) {
    event.preventDefault();
    callback(event);
  }
}

// ==============================================================
// SCREEN READER TEXT (Visually Hidden)
// ==============================================================

export const SCREEN_READER_ONLY = 'sr-only absolute -left-[10000px] w-[1px] h-[1px] overflow-hidden';

/**
 * Component for screen reader only text
 */
export function ScreenReaderText({ children }) {
  return (
    <span className={SCREEN_READER_ONLY}>
      {children}
    </span>
  );
}

// ==============================================================
// REDUCED MOTION SUPPORT
// ==============================================================

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get animation config based on user preference
 */
export function getAnimationConfig(defaultConfig) {
  if (prefersReducedMotion()) {
    return {
      ...defaultConfig,
      duration: 0,
      transition: { duration: 0 },
    };
  }
  return defaultConfig;
}

// ==============================================================
// FOCUS MANAGEMENT
// ==============================================================

/**
 * Add visible focus styles for keyboard navigation
 */
export const FOCUS_STYLES = 'focus:outline-none focus:ring-2 focus:ring-[#00897B] focus:ring-offset-2';

/**
 * Trap focus within a modal or dialog
 */
export function trapFocus(element) {
  const focusableElements = element.querySelectorAll(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled])'
  );
  
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  
  function handleTabKey(e) {
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  }
  
  element.addEventListener('keydown', handleTabKey);
  return () => element.removeEventListener('keydown', handleTabKey);
}

// ==============================================================
// ACCESSIBLE IMAGE COMPONENT
// ==============================================================

/**
 * Returns proper alt text based on image type and context
 */
export function getAccessibleAltText(type, name, category) {
  const templates = ALT_TEXT_TEMPLATES;
  
  switch (type) {
    case 'store':
      return templates.store(name);
    case 'product':
      return templates.product(name, category);
    case 'avatar':
      return templates.avatar(name);
    case 'logo':
      return templates.logo(name);
    case 'hero':
      return templates.hero;
    default:
      return name || 'Image';
  }
}

// ==============================================================
// EXPORT ALL UTILITIES
// ==============================================================

export default {
  ACCESSIBLE_COLORS,
  ALT_TEXT_TEMPLATES,
  ARIA_LABELS,
  KEYBOARD_SHORTCUTS,
  SCREEN_READER_ONLY,
  FOCUS_STYLES,
  handleKeyboardNav,
  prefersReducedMotion,
  getAnimationConfig,
  trapFocus,
  getAccessibleAltText,
  ScreenReaderText,
};
