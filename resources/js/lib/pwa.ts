export function registerServiceWorker(): void {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;

    const hostname = window.location.hostname;
    const isLocalHost =
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname === '::1' ||
        hostname.endsWith('.test');

    if (import.meta.env.DEV || isLocalHost) {
        window.addEventListener('load', () => {
            navigator.serviceWorker
                .getRegistrations()
                .then((registrations) =>
                    Promise.all(
                        registrations.map((registration) =>
                            registration.unregister(),
                        ),
                    ),
                )
                .then(async () => {
                    if (!('caches' in window)) return;
                    const keys = await window.caches.keys();
                    await Promise.all(
                        keys
                            .filter((key) => key.startsWith('echal-'))
                            .map((key) => window.caches.delete(key)),
                    );
                })
                .catch(() => {
                    // ignore cleanup failures in local/dev
                });
        });

        return;
    }

    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {
            // ignore registration errors (e.g. http dev without https)
        });
    });
}

export function isStandaloneMode(): boolean {
    if (typeof window === 'undefined') return false;
    // iOS Safari
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nav: any = navigator;
    return (
        window.matchMedia?.('(display-mode: standalone)').matches === true ||
        window.matchMedia?.('(display-mode: fullscreen)').matches === true ||
        nav.standalone === true
    );
}
