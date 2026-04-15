import { Link, usePage } from '@inertiajs/react';
import { Leaf, Moon, Package, ShoppingCart, Sun, User } from 'lucide-react';
import { Shield } from 'lucide-react';
import { useEffect } from 'react';
import CartDrawer from '@/components/store/cart-drawer';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/cart-context';
import { useAppearance } from '@/hooks/use-appearance';
import { dashboard, home as homeRoute, register } from '@/routes';
import { index as productsIndex } from '@/routes/products';
import type { SharedData } from '@/types';

type StoreLayoutProps = {
    children: React.ReactNode;
};

export default function StoreLayout({ children }: StoreLayoutProps) {
    const { auth, cart: serverCart } = usePage<SharedData>().props as SharedData & {
        cart?: { count: number; items: Record<string, { quantity: number }> };
    };
    const { count: cartCount, setFromServer, drawerOpen, setDrawerOpen } = useCart();
    const isAdmin = Boolean(auth?.user && (auth.user.role === 'admin' || auth.user.role === 'superadmin'));
    const { resolvedAppearance, updateAppearance } = useAppearance();

    useEffect(() => {
        if (serverCart != null) {
            setFromServer(serverCart.count, serverCart.items ?? {});
        }
    }, [serverCart?.count, serverCart != null ? JSON.stringify(serverCart.items) : null, setFromServer]);

    const drawerWidth = 'min(90vw, 22rem)';
    const toggleTheme = () => updateAppearance(resolvedAppearance === 'dark' ? 'light' : 'dark');

    return (
        <div
            className="min-h-screen bg-background text-foreground"
            style={drawerOpen ? { marginRight: drawerWidth } : undefined}
        >
            {/* Top bar — trust line + Admin link (separate from main nav) */}
            <div className="flex items-center justify-between gap-4 border-b border-border/60 bg-primary/8 px-4 py-2 sm:px-6">
                <p className="flex-1 text-center text-xs font-medium text-muted-foreground sm:text-sm">
                    Free delivery on orders over ৳2,000 · Fresh stock · Bangladesh-wide
                </p>
                <Link
                    href={isAdmin ? '/admin' : '/admin/login'}
                    className="shrink-0 rounded px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                    title={isAdmin ? 'Admin dashboard' : 'Admin login'}
                >
                    <span className="flex items-center gap-1.5">
                        <Shield className="size-3.5" aria-hidden />
                        Admin
                    </span>
                </Link>
            </div>

            {/* Header — professional, minimal */}
            <header className="sticky top-0 z-50 border-b border-border bg-background/98 shadow-[0_1px_0_0_var(--color-border)] backdrop-blur-md">
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4 sm:h-[4.5rem] sm:px-6 lg:px-8">
                    <Link
                        href={homeRoute()}
                        className="flex shrink-0 items-center gap-3 text-foreground no-underline outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl transition-opacity hover:opacity-90"
                    >
                        <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm sm:size-11">
                            <Leaf className="size-5 sm:size-6" aria-hidden />
                        </span>
                        <span className="text-lg font-bold tracking-tight text-foreground sm:text-xl">E-Chal</span>
                    </Link>
                    <nav className="flex items-center gap-1 sm:gap-2" aria-label="Main">
                        <Link
                            href={productsIndex.url()}
                            className="rounded-lg px-3.5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                            <span className="flex items-center gap-2">
                                <Package className="size-4 sm:hidden" aria-hidden />
                                <span className="hidden sm:inline">All rice</span>
                            </span>
                        </Link>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={toggleTheme}
                            className="text-muted-foreground hover:text-foreground"
                            title={resolvedAppearance === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                        >
                            {resolvedAppearance === 'dark' ? <Sun aria-hidden /> : <Moon aria-hidden />}
                            <span className="sr-only">{resolvedAppearance === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}</span>
                        </Button>
                        <button
                            type="button"
                            onClick={() => setDrawerOpen(true)}
                            className="relative rounded-lg px-3.5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                            <span className="flex items-center gap-2">
                                <ShoppingCart className="size-4" aria-hidden />
                                <span className="hidden sm:inline">Cart</span>
                                {cartCount > 0 && (
                                    <span className="absolute -right-0.5 -top-0.5 flex size-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                                        {cartCount}
                                    </span>
                                )}
                            </span>
                        </button>
                        <CartDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
                        {auth?.user ? (
                            <Link
                                href={isAdmin ? '/admin' : dashboard.url()}
                                className="rounded-lg px-3.5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            >
                                <span className="flex items-center gap-2">
                                    <User className="size-4 sm:hidden" aria-hidden />
                                    <span className="hidden sm:inline">{isAdmin ? 'Admin' : 'Account'}</span>
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

            {/* Mobile bottom nav */}
            <nav
                className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur-sm sm:hidden"
                aria-label="Main"
            >
                <div className="mx-auto flex max-w-6xl items-stretch justify-around px-2">
                    <Link
                        href={homeRoute()}
                        className="flex min-h-[3.25rem] flex-1 flex-col items-center justify-center gap-0.5 rounded-lg py-2 text-[11px] font-medium text-muted-foreground transition-colors active:bg-muted active:text-foreground"
                    >
                        <Leaf className="size-5" aria-hidden />
                        Home
                    </Link>
                    <Link
                        href={productsIndex.url()}
                        className="flex min-h-[3.25rem] flex-1 flex-col items-center justify-center gap-0.5 rounded-lg py-2 text-[11px] font-medium text-muted-foreground transition-colors active:bg-muted active:text-foreground"
                    >
                        <Package className="size-5" aria-hidden />
                        Rice
                    </Link>
                    <button
                        type="button"
                        onClick={() => setDrawerOpen(true)}
                        className="relative flex min-h-[3.25rem] flex-1 flex-col items-center justify-center gap-0.5 rounded-lg py-2 text-[11px] font-medium text-muted-foreground transition-colors active:bg-muted active:text-foreground"
                    >
                        <ShoppingCart className="size-5" aria-hidden />
                        Cart
                        {cartCount > 0 && (
                            <span className="absolute right-1/4 top-1.5 flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                                {cartCount}
                            </span>
                        )}
                    </button>
                    {auth?.user ? (
                        <Link
                            href={isAdmin ? '/admin' : dashboard.url()}
                            className="flex min-h-[3.25rem] flex-1 flex-col items-center justify-center gap-0.5 rounded-lg py-2 text-[11px] font-medium text-muted-foreground transition-colors active:bg-muted active:text-foreground"
                        >
                            <User className="size-5" aria-hidden />
                            {isAdmin ? 'Admin' : 'Account'}
                        </Link>
                    ) : (
                        <Link
                            href="/login"
                            className="flex min-h-[3.25rem] flex-1 flex-col items-center justify-center gap-0.5 rounded-lg py-2 text-[11px] font-medium text-primary transition-colors active:bg-primary/10"
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
                    <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
                        {/* Brand */}
                        <div className="sm:col-span-2 lg:col-span-1">
                            <Link
                                href={homeRoute()}
                                className="inline-flex items-center gap-2.5 text-foreground no-underline"
                            >
                                <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                                    <Leaf className="size-5" aria-hidden />
                                </span>
                                <span className="text-lg font-bold tracking-tight">E-Chal</span>
                            </Link>
                            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
                                Premium rice, one place. Miniket, Chinigura, Basmati — fresh stock, clear prices, Bangladesh-wide delivery.
                            </p>
                        </div>
                        {/* Quick links */}
                        <div>
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
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
                                        href={homeRoute()}
                                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                                    >
                                        Home
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        {/* Account & support */}
                        <div>
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
                                Account
                            </h3>
                            <ul className="mt-4 space-y-3">
                                {auth?.user ? (
                                    <li>
                                        <Link
                                            href={isAdmin ? '/admin' : dashboard.url()}
                                            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                                        >
                                            {isAdmin ? 'Admin dashboard' : 'My account'}
                                        </Link>
                                    </li>
                                ) : (
                                    <>
                                        <li>
                                            <Link
                                                href="/login"
                                                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                                            >
                                                Log in
                                            </Link>
                                        </li>
                                        <li>
                                            <Link
                                                href={register()}
                                                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                                            >
                                                Register
                                            </Link>
                                        </li>
                                        <li>
                                            <Link
                                                href="/admin/login"
                                                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                                            >
                                                Admin
                                            </Link>
                                        </li>
                                    </>
                                )}
                            </ul>
                        </div>
                    </div>
                    <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
                        <p className="text-xs text-muted-foreground sm:text-sm">
                            © {new Date().getFullYear()} E-Chal. All rights reserved.
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
