import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { CartProvider } from '@/contexts/cart-context';
import '../css/app.css';
import { initializeTheme } from './hooks/use-appearance';
import { initFirebase } from './lib/firebase';
import { registerServiceWorker } from './lib/pwa';

const appName = import.meta.env.VITE_APP_NAME ?? 'E-Chal';

initFirebase();
registerServiceWorker();

createInertiaApp({
    title: (title) => (title ? `${title} — ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <StrictMode>
                <CartProvider>
                    <App {...props} />
                </CartProvider>
            </StrictMode>,
        );
    },
    progress: {
        delay: 150,
        color: '#15803d',
        showSpinner: false,
    },
});

// This will set light / dark mode on load...
initializeTheme();
