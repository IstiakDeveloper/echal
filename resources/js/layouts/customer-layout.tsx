import { Link, useForm, usePage } from '@inertiajs/react';
import { Home, Package, ShoppingBag, User, LogOut } from 'lucide-react';
import { BrandLogoPlate, brandLogoImageClass } from '@/components/app-logo-icon';
import { Button } from '@/components/ui/button';
import { home as homeRoute } from '@/routes';
import { dashboard } from '@/routes';
import { index as productsIndex } from '@/routes/products';
import type { SharedData } from '@/types';

type CustomerLayoutProps = {
    children: React.ReactNode;
};

export default function CustomerLayout({ children }: CustomerLayoutProps) {
    const { auth } = usePage<SharedData>().props;
    const logoutForm = useForm({});

    const handleLogout = () => {
        logoutForm.post('/logout');
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70">
                <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
                    <Link
                        href={homeRoute()}
                        className="flex items-center gap-2 text-lg font-semibold tracking-tight"
                    >
                        <BrandLogoPlate rounded="lg" className="size-10">
                            <img src="/logo.png" alt="" className={brandLogoImageClass} />
                        </BrandLogoPlate>
                        E-Chal
                    </Link>
                    <nav className="hidden items-center gap-1 text-sm sm:flex sm:gap-2">
                        <Link
                            href={homeRoute()}
                            className="flex items-center gap-2 rounded-md px-3 py-2 font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                            <Home className="size-4" aria-hidden />
                            <span className="hidden sm:inline">Home</span>
                        </Link>
                        <Link
                            href={productsIndex.url()}
                            className="flex items-center gap-2 rounded-md px-3 py-2 font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                            <ShoppingBag className="size-4" aria-hidden />
                            <span className="hidden sm:inline">Shop</span>
                        </Link>
                        <Link
                            href={dashboard.url()}
                            className="flex items-center gap-2 rounded-md px-3 py-2 font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                            <Package className="size-4" aria-hidden />
                            <span className="hidden sm:inline">Orders</span>
                        </Link>
                        {auth?.user && (
                            <Link href="/profile">
                                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                                    <User className="size-4" aria-hidden />
                                    <span className="hidden sm:inline">Profile</span>
                                </Button>
                            </Link>
                        )}
                        {auth?.user && (
                            <form onSubmit={(e) => { e.preventDefault(); handleLogout(); }}>
                                <Button
                                    type="submit"
                                    variant="ghost"
                                    size="sm"
                                    disabled={logoutForm.processing}
                                    className="gap-2 text-muted-foreground hover:text-foreground"
                                >
                                    <LogOut className="size-4" aria-hidden />
                                    <span className="hidden sm:inline">Logout</span>
                                </Button>
                            </form>
                        )}
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <main>{children}</main>

            {/* Mobile Bottom Navigation */}
            <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-4 py-1.5 text-xs text-muted-foreground backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:hidden">
                <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
                    <Link
                        href={homeRoute()}
                        className="flex flex-1 flex-col items-center gap-0.5"
                    >
                        <Home className="size-5" aria-hidden />
                        <span>Home</span>
                    </Link>
                    <Link
                        href={productsIndex.url()}
                        className="flex flex-1 flex-col items-center gap-0.5"
                    >
                        <ShoppingBag className="size-5" aria-hidden />
                        <span>Shop</span>
                    </Link>
                    <Link
                        href={dashboard.url()}
                        className="flex flex-1 flex-col items-center gap-0.5"
                    >
                        <Package className="size-5" aria-hidden />
                        <span>Orders</span>
                    </Link>
                    {auth?.user && (
                        <Link
                            href="/profile"
                            className="flex flex-1 flex-col items-center gap-0.5"
                        >
                            <User className="size-5" aria-hidden />
                            <span>Profile</span>
                        </Link>
                    )}
                </div>
            </nav>
        </div>
    );
}
