import { Link, usePage } from '@inertiajs/react';
import {
    Mail,
    MessageCircle,
    Moon,
    Package,
    Phone,
    Route,
    ShoppingCart,
    Sun,
    User,
} from 'lucide-react';
import { Shield } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
    BrandLogoPlate,
    brandLogoImageClass,
} from '@/components/app-logo-icon';
import { PwaInstallButton } from '@/components/pwa/install-button';
import CartDrawer from '@/components/store/cart-drawer';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useCart } from '@/contexts/cart-context';
import { useAppearance } from '@/hooks/use-appearance';
import { dashboard, home as homeRoute } from '@/routes';
import { index as productsIndex } from '@/routes/products';
import type { SharedData } from '@/types';

type StoreLayoutProps = {
    children: React.ReactNode;
};

export default function StoreLayout({ children }: StoreLayoutProps) {
    const page = usePage<SharedData>();
    const {
        auth,
        cart: serverCart,
        storefront,
        appUrl,
    } = page.props as SharedData & {
        cart?: { count: number; items: Record<string, { quantity: number }> };
    };
    const {
        count: cartCount,
        setFromServer,
        drawerOpen,
        setDrawerOpen,
    } = useCart();
    const isAdmin = Boolean(
        auth?.user &&
        (auth.user.role === 'admin' || auth.user.role === 'superadmin'),
    );
    const { resolvedAppearance, updateAppearance } = useAppearance();
    const [popupOpen, setPopupOpen] = useState(false);
    const [isDesktop, setIsDesktop] = useState(false);
    const [showWhatsAppHint, setShowWhatsAppHint] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const mql = window.matchMedia('(min-width: 640px)');
        const update = () => setIsDesktop(mql.matches);
        update();
        mql.addEventListener?.('change', update);
        return () => mql.removeEventListener?.('change', update);
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const key = 'echal_whatsapp_hint_dismissed_v1';
        if (localStorage.getItem(key) === '1') return;

        const openT = window.setTimeout(() => setShowWhatsAppHint(true), 2000);
        const closeT = window.setTimeout(() => {
            setShowWhatsAppHint(false);
            try {
                localStorage.setItem(key, '1');
            } catch {
                // ignore
            }
        }, 7000);

        return () => {
            window.clearTimeout(openT);
            window.clearTimeout(closeT);
        };
    }, []);

    useEffect(() => {
        if (serverCart != null) {
            setFromServer(serverCart.count, serverCart.items ?? {});
        }
    }, [
        serverCart?.count,
        serverCart != null ? JSON.stringify(serverCart.items) : null,
        setFromServer,
    ]);

    const drawerWidth = 'min(90vw, 22rem)';
    const toggleTheme = () =>
        updateAppearance(resolvedAppearance === 'dark' ? 'light' : 'dark');
    const topOffer =
        (typeof storefront?.topOffer === 'string' &&
        storefront.topOffer.trim().length > 0
            ? storefront.topOffer.trim()
            : null) ??
        'Free delivery on orders over ৳2,000 · Fresh stock · Bangladesh-wide';
    const supportEmail =
        (typeof storefront?.supportEmail === 'string' &&
        storefront.supportEmail.trim() !== ''
            ? storefront.supportEmail.trim()
            : null) ?? 'help@echal.bd';
    const supportPhoneDisplay =
        (typeof storefront?.supportPhone === 'string' &&
        storefront.supportPhone.trim() !== ''
            ? storefront.supportPhone.trim()
            : null) ?? '+8801717893432';
    const supportPhoneTel = `tel:${supportPhoneDisplay.replace(/\s+/g, '')}`;
    const whatsappNumber =
        (typeof storefront?.whatsappPhone === 'string' &&
        storefront.whatsappPhone.trim() !== ''
            ? storefront.whatsappPhone.trim()
            : null) ?? '8801717893432';
    const whatsappPrefill =
        (typeof storefront?.whatsappPrefill === 'string' &&
        storefront.whatsappPrefill.trim() !== ''
            ? storefront.whatsappPrefill.trim()
            : null) ?? 'Hi! I need help with my order.';
    const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappPrefill)}`;
    const facebookPageUrl =
        (typeof storefront?.facebookPageUrl === 'string' &&
        storefront.facebookPageUrl.trim() !== ''
            ? storefront.facebookPageUrl.trim()
            : null) ?? 'https://www.facebook.com/echal.bd';
    const facebookIframeSrc = `https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(
        facebookPageUrl,
    )}&tabs=timeline&width=340&height=220&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=true`;

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const popup = storefront?.popup;
        if (!popup?.id || !popup.imageUrl) return;

        const dismissedKey = `storefront_popup_dismissed_${popup.id}`;
        const shownKey = `storefront_popup_last_shown_${popup.id}`;
        if (localStorage.getItem(dismissedKey) === '1') return;

        // Don't nag: show at most once per day per popup id.
        const lastShown = Number(localStorage.getItem(shownKey) ?? '0');
        const oneDayMs = 24 * 60 * 60 * 1000;
        if (Number.isFinite(lastShown) && lastShown > 0) {
            if (Date.now() - lastShown < oneDayMs) return;
        }

        const t = window.setTimeout(() => {
            try {
                localStorage.setItem(shownKey, String(Date.now()));
            } catch {
                // ignore
            }
            setPopupOpen(true);
        }, 700);
        return () => window.clearTimeout(t);
    }, [storefront?.popup?.id, storefront?.popup?.imageUrl]);

    const popupLinkTarget = useMemo((): null | {
        mode: 'external' | 'internal';
        href: string;
    } => {
        const raw = storefront?.popup?.linkUrl;
        if (raw == null || raw.trim() === '') {
            return null;
        }

        const trimmed = raw.trim();
        if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
            return { mode: 'internal', href: trimmed };
        }

        const base =
            typeof appUrl === 'string' && appUrl.trim() !== ''
                ? appUrl.trim().replace(/\/+$/, '')
                : '';
        if (base === '') {
            return { mode: 'external', href: trimmed };
        }

        try {
            const target = new URL(trimmed);
            const origin = new URL(
                base.startsWith('http://') || base.startsWith('https://')
                    ? base
                    : `https://${base}`,
            ).origin;
            if (target.origin === origin) {
                return {
                    mode: 'internal',
                    href: `${target.pathname}${target.search}${target.hash}`,
                };
            }
        } catch {
            return { mode: 'external', href: trimmed };
        }

        return { mode: 'external', href: trimmed };
    }, [appUrl, storefront?.popup?.linkUrl]);

    return (
        <div
            className="min-h-screen bg-background text-foreground"
            style={
                drawerOpen && isDesktop
                    ? { marginRight: drawerWidth }
                    : undefined
            }
        >
            {/* Floating cart icon (right-side) */}
            <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="fixed top-1/2 right-4 z-50 inline-flex size-14 -translate-y-1/2 items-center justify-center rounded-2xl border border-border bg-card shadow-lg shadow-black/5 transition hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:right-6"
                aria-label="Open cart"
            >
                <ShoppingCart className="size-6 text-foreground" aria-hidden />
                {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex min-w-6 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[11px] leading-none font-bold text-primary-foreground">
                        {cartCount > 99 ? '99+' : cartCount}
                    </span>
                )}
            </button>

            {/* Popup modal (storefront offer/notice) */}
            {storefront?.popup?.imageUrl && (
                <Dialog
                    open={popupOpen}
                    onOpenChange={(next) => {
                        setPopupOpen(next);
                        if (!next && storefront?.popup?.id) {
                            try {
                                localStorage.setItem(
                                    `storefront_popup_dismissed_${storefront.popup.id}`,
                                    '1',
                                );
                            } catch {
                                // ignore storage errors
                            }
                        }
                    }}
                >
                    <DialogContent className="max-h-[85vh] max-w-[min(92vw,46rem)] overflow-hidden p-0">
                        {popupLinkTarget ? (
                            popupLinkTarget.mode === 'internal' ? (
                                <Link
                                    href={popupLinkTarget.href}
                                    onClick={() => setPopupOpen(false)}
                                    className="block"
                                >
                                    <img
                                        src={storefront.popup.imageUrl}
                                        alt=""
                                        className="max-h-[85vh] w-full bg-muted/30 object-contain"
                                    />
                                </Link>
                            ) : (
                                <a
                                    href={popupLinkTarget.href}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="block"
                                >
                                    <img
                                        src={storefront.popup.imageUrl}
                                        alt=""
                                        className="max-h-[85vh] w-full bg-muted/30 object-contain"
                                    />
                                </a>
                            )
                        ) : (
                            <img
                                src={storefront.popup.imageUrl}
                                alt=""
                                className="max-h-[85vh] w-full bg-muted/30 object-contain"
                            />
                        )}
                    </DialogContent>
                </Dialog>
            )}

            {/* Top bar — trust line + Admin link (separate from main nav) */}
            <div className="border-b border-border/60 bg-primary/8 px-4 py-2 sm:px-6">
                <div className="mx-auto flex max-w-6xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    <div className="flex flex-wrap items-center justify-center gap-2 text-center sm:justify-start">
                        <span className="inline-flex items-center rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground">
                            Offer
                        </span>
                        <p className="text-xs font-medium text-foreground/90 sm:text-sm">
                            {topOffer}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
                        <a
                            href={`mailto:${supportEmail}`}
                            className="inline-flex items-center gap-1.5 rounded-full bg-background/70 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                            title={supportEmail}
                        >
                            <Mail className="size-3.5" aria-hidden />
                            <span className="hidden sm:inline">
                                {supportEmail}
                            </span>
                            <span className="sm:hidden">Email</span>
                        </a>
                        <a
                            href={supportPhoneTel}
                            className="inline-flex items-center gap-1.5 rounded-full bg-background/70 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                            title={`Call ${supportPhoneDisplay}`}
                        >
                            <Phone className="size-3.5" aria-hidden />
                            <span className="hidden sm:inline">
                                {supportPhoneDisplay}
                            </span>
                            <span className="sm:hidden">Call</span>
                        </a>
                        <a
                            href={whatsappHref}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white transition-colors hover:bg-emerald-700"
                            title="WhatsApp"
                        >
                            <MessageCircle className="size-3.5" aria-hidden />
                            <span className="hidden sm:inline">WhatsApp</span>
                            <span className="sm:hidden">WA</span>
                        </a>

                        <Link
                            href={isAdmin ? '/admin' : '/admin/login'}
                            className="inline-flex items-center gap-1.5 rounded-full bg-background/70 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground transition-colors hover:bg-background hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                            title={isAdmin ? 'Admin dashboard' : 'Admin login'}
                        >
                            <Shield className="size-3.5" aria-hidden />
                            Admin
                        </Link>
                    </div>
                </div>
            </div>

            {/* Header — professional, minimal */}
            <header className="sticky top-0 z-50 border-b border-border bg-background/98 shadow-[0_1px_0_0_var(--color-border)] backdrop-blur-md">
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4 sm:h-18 sm:px-6 lg:px-8">
                    <Link
                        href={homeRoute.url()}
                        className="flex shrink-0 items-center gap-3 rounded-xl text-foreground no-underline transition-opacity outline-none hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                        <BrandLogoPlate className="size-11 sm:size-12">
                            <img
                                src="/logo.png"
                                alt=""
                                className={brandLogoImageClass}
                            />
                        </BrandLogoPlate>
                        <span className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
                            E-Chal
                        </span>
                    </Link>
                    <nav
                        className="flex items-center gap-1 sm:gap-2"
                        aria-label="Main"
                    >
                        <Link
                            href={productsIndex.url()}
                            className="rounded-lg px-3.5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                            <span className="flex items-center gap-2">
                                <Package
                                    className="size-4 sm:hidden"
                                    aria-hidden
                                />
                                <span className="hidden sm:inline">
                                    All rice
                                </span>
                            </span>
                        </Link>
                        <Link
                            href="/order-tracking"
                            className="hidden rounded-lg px-3.5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:inline-flex"
                        >
                            <span className="flex items-center gap-2">
                                <Route className="size-4" aria-hidden />
                                Track order
                            </span>
                        </Link>
                        <PwaInstallButton className="hidden sm:inline-flex" />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={toggleTheme}
                            className="text-muted-foreground hover:text-foreground"
                            title={
                                resolvedAppearance === 'dark'
                                    ? 'Switch to light mode'
                                    : 'Switch to dark mode'
                            }
                        >
                            {resolvedAppearance === 'dark' ? (
                                <Sun aria-hidden />
                            ) : (
                                <Moon aria-hidden />
                            )}
                            <span className="sr-only">
                                {resolvedAppearance === 'dark'
                                    ? 'Switch to light mode'
                                    : 'Switch to dark mode'}
                            </span>
                        </Button>
                        {/* Cart is opened from floating cart icon */}
                        <CartDrawer
                            open={drawerOpen}
                            onOpenChange={setDrawerOpen}
                        />
                        {auth?.user ? (
                            <Link
                                href={isAdmin ? '/admin' : dashboard.url()}
                                className="rounded-lg px-3.5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            >
                                <span className="flex items-center gap-2">
                                    <User
                                        className="size-4 sm:hidden"
                                        aria-hidden
                                    />
                                    <span className="hidden sm:inline">
                                        {isAdmin ? 'Admin' : 'Account'}
                                    </span>
                                </span>
                            </Link>
                        ) : (
                            <Link
                                href="/login"
                                className="rounded-lg px-3.5 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            >
                                Log in
                            </Link>
                        )}
                    </nav>
                </div>
            </header>

            <main className="pb-24 sm:pb-12">{children}</main>

            {/* Floating WhatsApp (overlay) */}
            {showWhatsAppHint && (
                <div className="fixed right-4 bottom-25 z-50 sm:right-6 sm:bottom-22">
                    <div className="relative max-w-[16rem] rounded-xl border border-emerald-200 bg-white px-3 py-2 text-xs font-medium text-emerald-950 shadow-lg shadow-black/5 dark:border-emerald-900/40 dark:bg-emerald-950/60 dark:text-emerald-50">
                        <button
                            type="button"
                            onClick={() => {
                                setShowWhatsAppHint(false);
                                try {
                                    localStorage.setItem(
                                        'echal_whatsapp_hint_dismissed_v1',
                                        '1',
                                    );
                                } catch {
                                    // ignore
                                }
                            }}
                            className="absolute top-1 right-1 rounded-md px-1 py-0.5 text-[10px] opacity-70 hover:opacity-100"
                            aria-label="Dismiss"
                        >
                            ✕
                        </button>
                        Need help? Tap{' '}
                        <span className="font-semibold">Message</span> to chat
                        on WhatsApp.
                        <div className="absolute right-6 -bottom-1 size-2 rotate-45 border-r border-b border-emerald-200 bg-white dark:border-emerald-900/40 dark:bg-emerald-950/60" />
                    </div>
                </div>
            )}
            <Tooltip>
                <TooltipTrigger asChild>
                    <a
                        href={whatsappHref}
                        target="_blank"
                        rel="noreferrer"
                        className="fixed right-4 bottom-20 z-50 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:right-6 sm:bottom-6"
                        title="Chat on WhatsApp"
                    >
                        <MessageCircle className="size-5" aria-hidden />
                        <span>Message</span>
                    </a>
                </TooltipTrigger>
                <TooltipContent
                    side="left"
                    sideOffset={10}
                    className="bg-emerald-700 text-white"
                >
                    Need help? Tap to chat on WhatsApp.
                </TooltipContent>
            </Tooltip>

            {/* Mobile bottom nav */}
            <nav
                className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 pt-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm sm:hidden"
                aria-label="Main"
            >
                <div className="mx-auto flex max-w-6xl items-stretch justify-around px-2">
                    <div className="absolute top-2 right-2">
                        <PwaInstallButton size="sm" />
                    </div>
                    <Link
                        href={homeRoute.url()}
                        className="flex min-h-13 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg py-2 text-[11px] font-medium text-muted-foreground transition-colors active:bg-muted active:text-foreground"
                    >
                        <BrandLogoPlate rounded="lg" className="size-6">
                            <img
                                src="/logo.png"
                                alt=""
                                className={brandLogoImageClass}
                            />
                        </BrandLogoPlate>
                        Home
                    </Link>
                    <Link
                        href={productsIndex.url()}
                        className="flex min-h-13 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg py-2 text-[11px] font-medium text-muted-foreground transition-colors active:bg-muted active:text-foreground"
                    >
                        <Package className="size-5" aria-hidden />
                        Rice
                    </Link>
                    <Link
                        href="/order-tracking"
                        className="flex min-h-13 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg py-2 text-[11px] font-medium text-muted-foreground transition-colors active:bg-muted active:text-foreground"
                    >
                        <Route className="size-5" aria-hidden />
                        Track
                    </Link>
                    <button
                        type="button"
                        onClick={() => setDrawerOpen(true)}
                        className="relative flex min-h-13 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg py-2 text-[11px] font-medium text-muted-foreground transition-colors active:bg-muted active:text-foreground"
                    >
                        <ShoppingCart className="size-5" aria-hidden />
                        Cart
                        {cartCount > 0 && (
                            <span className="absolute top-1.5 right-1/4 flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                                {cartCount}
                            </span>
                        )}
                    </button>
                    {auth?.user ? (
                        <Link
                            href={isAdmin ? '/admin' : dashboard.url()}
                            className="flex min-h-13 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg py-2 text-[11px] font-medium text-muted-foreground transition-colors active:bg-muted active:text-foreground"
                        >
                            <User className="size-5" aria-hidden />
                            {isAdmin ? 'Admin' : 'Account'}
                        </Link>
                    ) : (
                        <Link
                            href="/login"
                            className="flex min-h-13 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg py-2 text-[11px] font-medium text-primary transition-colors active:bg-primary/10"
                        >
                            <User className="size-5" aria-hidden />
                            Login
                        </Link>
                    )}
                </div>
            </nav>

            {/* Footer — professional, multi-column */}
            <footer className="border-t border-border bg-muted/40">
                <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-12 lg:gap-6">
                        {/* Brand */}
                        <div className="sm:col-span-2 lg:col-span-4">
                            <Link
                                href={homeRoute.url()}
                                className="inline-flex items-center gap-2.5 text-foreground no-underline"
                            >
                                <BrandLogoPlate className="size-11">
                                    <img
                                        src="/logo.png"
                                        alt=""
                                        className={brandLogoImageClass}
                                    />
                                </BrandLogoPlate>
                                <span className="text-lg font-bold tracking-tight">
                                    E-Chal
                                </span>
                            </Link>
                            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
                                Premium rice, one place. Miniket, Chinigura,
                                Basmati — fresh stock, clear prices,
                                Bangladesh-wide delivery.
                            </p>
                        </div>
                        {/* Quick links */}
                        <div className="lg:col-span-2">
                            <h3 className="text-sm font-semibold tracking-wider text-foreground uppercase">
                                Shop
                            </h3>
                            <ul className="mt-4 space-y-3">
                                <li>
                                    <Link
                                        href={productsIndex.url()}
                                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                                    >
                                        All rice
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href={productsIndex.url()}
                                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                                    >
                                        Categories
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href={homeRoute.url()}
                                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                                    >
                                        Home
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        {/* Contact */}
                        <div className="lg:col-span-2">
                            <h3 className="text-sm font-semibold tracking-wider text-foreground uppercase">
                                Contact
                            </h3>
                            <ul className="mt-4 space-y-3">
                                <li>
                                    <a
                                        href={`mailto:${supportEmail}`}
                                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                                    >
                                        Email: {supportEmail}
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href={supportPhoneTel}
                                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                                    >
                                        Call: {supportPhoneDisplay}
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href={whatsappHref}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                                    >
                                        WhatsApp support
                                    </a>
                                </li>
                            </ul>
                        </div>
                        {/* Facebook page embed (inside grid, no title) */}
                        <div className="overflow-hidden rounded-2xl border border-border bg-card lg:col-span-4">
                            <iframe
                                title="E‑Chal Facebook page"
                                src={facebookIframeSrc}
                                loading="lazy"
                                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                                className="h-[220px] w-full border-0 sm:h-[240px] lg:h-[240px]"
                            />
                        </div>
                    </div>

                    <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
                        <p className="text-xs text-muted-foreground sm:text-sm">
                            © {new Date().getFullYear()} E-Chal. All rights
                            reserved.
                        </p>
                        <p className="text-xs text-muted-foreground sm:text-sm">
                            Premium chal · Bangladesh
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
