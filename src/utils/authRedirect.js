const REDIRECT_KEYS = ['post_login_redirect', 'redirect_after_login', 'checkout_redirect']

export const setPendingAuthRedirect = (target, storage = window.localStorage) => {
    if (!target || typeof window === 'undefined') return null

    storage.setItem('post_login_redirect', target)

    if (target === '/checkout' || target.startsWith('/checkout?') || target.startsWith('/checkout#')) {
        storage.setItem('checkout_redirect', 'true')
    } else {
        storage.removeItem('checkout_redirect')
    }

    return target
}

export const getPendingAuthRedirect = (storage = window.localStorage) => {
    if (typeof window === 'undefined') return null

    const directRedirect = storage.getItem('post_login_redirect')
    if (directRedirect) return directRedirect

    const legacyRedirect = storage.getItem('redirect_after_login')
    if (legacyRedirect) return legacyRedirect

    if (storage.getItem('checkout_redirect') === 'true') return '/checkout'

    return null
}

export const clearPendingAuthRedirect = (storage = window.localStorage) => {
    if (typeof window === 'undefined') return

    REDIRECT_KEYS.forEach((key) => storage.removeItem(key))
}

export const shouldResumeCheckout = (target) => {
    if (!target) return false
    return target === '/checkout' || target.startsWith('/checkout?') || target.startsWith('/checkout#')
}
