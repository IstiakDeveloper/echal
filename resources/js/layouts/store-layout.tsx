import { Link, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { Leaf, Package, ShoppingCart, User, UserPlus } from 'lucide-react';
import CartDrawer from '@/components/store/cart-drawer';
import { useCart } from '@/contexts/cart-context';
import { dashboard, home as homeRoute, login, register } from '@/routes';
import { index as productsIndex } from '@/routes/products';
import type { SharedData } from '@/types';
import { Button } from '@/components/ui/button';

type StoreLayoutProps = {
    children: React.ReactNode;
};

export default function StoreLayout({ children }: StoreLayoutProps) {
    const { auth, cart: serverCart } = usePage<SharedData>().props as SharedData & {
        cart?: { count: number; items: Record<string, { quantity: number }> };
    };
    const { count: cartCount, setFromServer, drawerOpen, setDrawerOpen } = useCart();

    useEffect(() => {
        if (serverCart != null) {
            setFromServer(serverCart.count, serverCart.items ?? {});
        }
    }, [serverCart?.count, serverCart != null ? JSON.stringify(serverCart.items) : null, setFromServer]);

    const drawerWidth = 'min(90vw, 18rem)';

    return (
        <div
            className="min-h-screen bg-background text-foreground transition-[margin] duration-300 ease-out"
            style={drawerOpen ? { marginRight: drawerWidth } : undefined}
        >
            <header className="sticky top-0 z-50 border-b border-border bg-background/95 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
                <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:h-16 sm:px-6">
                    <Link
                        href={homeRoute()}
                        className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-foreground sm:text-xl"
                    >
                        <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground sm:size-10">
                            <Leaf className="size-5 sm:size-5" aria-hidden />
                        </span>
                        <span className="hidden sm:inline">E-Chal</span>
                    </Link>
                    <nav className="flex items-center gap-0.5 text-sm sm:gap-1">
                        <Link
                            href={productsIndex.url()}
                            className="flex items-center gap-2 rounded-lg px-3 py-2.5 font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:px-4"
                        >
                            <Package className="size-4" aria-hidden />
                            <span className="hidden sm:inline">All rice</span>
                        </Link>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="relative gap-2 rounded-lg px-3 py-2.5 text-muted-foreground hover:text-foreground sm:px-4"
                            onClick={() => setDrawerOpen(true)}
                        >
                            <ShoppingCart className="size-4" aria-hidden />
                            <span className="hidden sm:inline">Cart</span>
                            {cartCount > 0 && (
                                <span className="absolute -right-0.5 -top-0.5 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-bold text-primary-foreground">
                                    {cartCount}
                                </span>
                            )}
                        </Button>
                        <CartDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
                        {auth?.user ? (
                            <Link
                                href={dashboard.url()}
                                className="flex items-center gap-2 rounded-lg px-3 py-2.5 font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:px-4"
                            >
                                <User className="size-4" aria-hidden />
                                <span className="hidden sm:inline">Account</span>
                            </Link>
                        ) : (
                            <Link href="/login">
                                <Button variant="ghost" size="sm" className="gap-2 rounded-lg px-3 py-2.5 sm:px-4">
                                    <User className="size-4" aria-hidden />
                                    Log in
                                </Button>
                            </Link>
                        )}
                    </nav>
                </div>
            </header>
            <main className="pb-20 sm:pb-8">{children}</main>
            {/* Mobile bottom navigation — large touch targets, safe area */}
            <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] pt-2 text-xs backdrop-blur-md supports-[backdrop-filter]:bg-background/90 sm:hidden">
                <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-2">
                    <Link
                        href={homeRoute()}
                        className="flex min-h-14 flex-1 flex-col items-center justify-center gap-1 rounded-lg py-2 text-muted-foreground transition-colors active:bg-muted"
                    >
                        <Leaf className="size-6" aria-hidden />
                        <span>Home</span>
                    </Link>
                    <Link
                        href={productsIndex.url()}
                        className="flex min-h-14 flex-1 flex-col items-center justify-center gap-1 rounded-lg py-2 text-muted-foreground transition-colors active:bg-muted"
                    >
                        <Package className="size-6" aria-hidden />
                        <span>Rice</span>
                    </Link>
                    <button
                        type="button"
                        onClick={() => setDrawerOpen(true)}
                        className="relative flex min-h-14 flex-1 flex-col items-center justify-center gap-1 rounded-lg py-2 text-muted-foreground transition-colors active:bg-muted"
                    >
                        <ShoppingCart className="size-6" aria-hidden />
                        <span>Cart</span>
                        {cartCount > 0 && (
                            <span className="absolute right-1/4 top-1.5 inline-flex min-h-5 min-w-5 translate-x-2 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                                {cartCount}
                            </span>
                        )}
                    </button>
                    {auth?.user ? (
                        <Link
                            href={dashboard.url()}
                            className="flex min-h-14 flex-1 flex-col items-center justify-center gap-1 rounded-lg py-2 text-muted-foreground transition-colors active:bg-muted"
                        >
                            <User className="size-6" aria-hidden />
                            <span>Account</span>
                        </Link>
                    ) : (
                        <Link
                            href="/login"
                            className="flex min-h-14 flex-1 flex-col items-center justify-center gap-1 rounded-lg py-2 text-muted-foreground transition-colors active:bg-muted"
                        >
                            <User className="size-6" aria-hidden />
                            <span>Login</span>
                        </Link>
                    )}
                </div>
            </nav>
            <footer className="border-t border-border bg-muted/30 px-4 py-10 sm:px-6">
                <div className="mx-auto max-w-6xl">
                    <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left">
                        <Link
                            href={homeRoute()}
                            className="flex items-center gap-2 font-semibold text-foreground"
                        >
                            <Leaf className="size-5 text-primary" aria-hidden />
                            E-Chal
                        </Link>
                        <p className="text-sm text-muted-foreground">
                            © {new Date().getFullYear()} E-Chal. Premium rice, one place. Bangladesh.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

