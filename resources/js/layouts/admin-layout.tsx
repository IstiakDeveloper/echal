import { Link, useForm, usePage } from '@inertiajs/react';
import {
    Box,
    Calculator,
    ExternalLink,
    FolderTree,
    LayoutDashboard,
    Layers,
    LogOut,
    Moon,
    Package,
    Settings,
    ShoppingBag,
    ShoppingCart,
    Sun,
    Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
    BrandLogoPlate,
    brandLogoImageClass,
} from '@/components/app-logo-icon';
import { PwaInstallButton } from '@/components/pwa/install-button';
import { Button } from '@/components/ui/button';
import { useAppearance } from '@/hooks/use-appearance';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { home } from '@/routes';
import type { SharedData } from '@/types';

type AdminLayoutProps = {
    children: React.ReactNode;
};

type NavItem = {
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    exact?: boolean;
    badge?: number;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
    const {
        auth,
        unreadOrdersCount = 0,
        accountingCashBalance,
        flash,
    } = usePage<
        SharedData & {
            unreadOrdersCount?: number;
            accountingCashBalance?: number | null;
            flash?: { success?: string; error?: string };
        }
    >().props;
    const { currentUrl } = useCurrentUrl();
    const flashKey = `${flash?.success ?? ''}|${flash?.error ?? ''}`;
    const [dismissedFlashKey, setDismissedFlashKey] = useState<string | null>(
        null,
    );
    const showFlash = Boolean(
        (flash?.success || flash?.error) && dismissedFlashKey !== flashKey,
    );
    const { resolvedAppearance, updateAppearance } = useAppearance();

    useEffect(() => {
        if (!showFlash) return;
        const t = setTimeout(() => setDismissedFlashKey(flashKey), 5000);
        return () => clearTimeout(t);
    }, [flashKey, showFlash]);
    const logoutForm = useForm({});

    const handleLogout = () => {
        logoutForm.post('/admin/logout');
    };

    const toggleTheme = () =>
        updateAppearance(resolvedAppearance === 'dark' ? 'light' : 'dark');

    const isAccountingSection = currentUrl.startsWith('/admin/accounting');
    const isPosSection = currentUrl.startsWith('/admin/pos');

    const mainNavItems: NavItem[] = [
        {
            href: '/admin',
            icon: LayoutDashboard,
            label: 'Dashboard',
            exact: true,
        },
        { href: '/admin/products', icon: Package, label: 'Products' },
        { href: '/admin/stock', icon: Layers, label: 'Stock' },
        { href: '/admin/categories', icon: FolderTree, label: 'Categories' },
        {
            href: '/admin/orders',
            icon: ShoppingBag,
            label: 'Orders',
            badge: unreadOrdersCount > 0 ? unreadOrdersCount : undefined,
        },
        { href: '/admin/pos', icon: ShoppingCart, label: 'POS (Offline)' },
        { href: '/admin/customers', icon: Users, label: 'Customers' },
        {
            href: '/admin/delivery-amounts',
            icon: Box,
            label: 'Delivery Amounts',
        },
        { href: '/admin/accounting', icon: Calculator, label: 'Accounting' },
        {
            href: '/admin/settings/storefront',
            icon: Settings,
            label: 'Storefront',
        },
    ];

    const accountingSubNav: { href: string; label: string }[] = [
        { href: '/admin/accounting', label: 'Transactions' },
        { href: '/admin/accounting/bank-report', label: 'Bank Report' },
        {
            href: '/admin/accounting/receipt-payment-report',
            label: 'Receipt & Payment',
        },
        {
            href: '/admin/accounting/income-expenditure-report',
            label: 'Income & Expenditure',
        },
        {
            href: '/admin/accounting/balance-sheet-report',
            label: 'Balance Sheet',
        },
        {
            href: '/admin/accounting/product-analysis-report',
            label: 'Product Analysis Report',
        },
    ];

    const checkIsActive = (href: string, exact?: boolean) => {
        // Normalize URLs - remove trailing slashes for comparison
        const normalizedCurrent = currentUrl.replace(/\/$/, '') || '/';
        const normalizedHref = href.replace(/\/$/, '') || '/';

        if (exact) {
            // For exact match (dashboard), only match exactly /admin
            return normalizedCurrent === normalizedHref;
        }
        // For other routes, match if current URL starts with the href (but not if it's just /admin)
        if (normalizedCurrent === '/admin') {
            return false; // Don't highlight other items when on dashboard
        }
        return (
            normalizedCurrent === normalizedHref ||
            normalizedCurrent.startsWith(normalizedHref + '/')
        );
    };

    return (
        <div className="flex min-h-screen bg-muted/30">
            {/* Flash message (admin) */}
            {showFlash && (
                <div
                    className={`fixed top-0 right-0 left-0 z-50 flex items-center justify-between gap-4 px-4 py-3 text-sm shadow-md sm:right-0 sm:left-64 ${
                        flash?.error
                            ? 'bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-200'
                            : 'bg-green-100 text-green-800 dark:bg-green-950/80 dark:text-green-200'
                    }`}
                >
                    <span>{flash?.error ?? flash?.success}</span>
                    <button
                        type="button"
                        onClick={() => setDismissedFlashKey(flashKey)}
                        className="shrink-0 font-medium underline opacity-80 hover:opacity-100"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {/* Sidebar */}
            <aside className="fixed top-0 left-0 z-10 h-screen w-64 shrink-0 border-r border-border bg-card shadow-sm">
                <div className="flex h-full flex-col">
                    {/* Logo */}
                    <div className="border-b border-border p-4">
                        <Link
                            href="/admin"
                            className="flex items-center gap-2 text-lg font-semibold"
                        >
                            <BrandLogoPlate rounded="lg" className="size-10">
                                <img
                                    src="/logo.png"
                                    alt=""
                                    className={brandLogoImageClass}
                                />
                            </BrandLogoPlate>
                            <span>E-Chal Admin</span>
                        </Link>
                    </div>

                    {/* Home / Store link */}
                    <div className="border-b border-border px-4 py-3">
                        <Link
                            href={home.url()}
                            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                            <ExternalLink className="size-4" />
                            View store (Home)
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-1 overflow-y-auto p-4">
                        {mainNavItems.map((item) => {
                            const Icon = item.icon;
                            const isActive =
                                item.href === '/admin/accounting'
                                    ? currentUrl === '/admin/accounting' ||
                                      currentUrl === '/admin/accounting/'
                                    : checkIsActive(item.href, item.exact);

                            return (
                                <div key={item.href}>
                                    <Link
                                        href={item.href}
                                        className={`relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                            item.href === '/admin/accounting' &&
                                            isAccountingSection
                                                ? 'bg-primary/10 text-primary'
                                                : isActive
                                                  ? 'bg-primary text-primary-foreground'
                                                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                        }`}
                                    >
                                        <Icon className="size-4" />
                                        <span>{item.label}</span>
                                        {item.badge && item.badge > 0 && (
                                            <span className="ml-auto flex size-5 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
                                                {item.badge > 99
                                                    ? '99+'
                                                    : item.badge}
                                            </span>
                                        )}
                                    </Link>
                                    {item.href === '/admin/accounting' &&
                                        isAccountingSection && (
                                            <div className="mt-1 ml-4 space-y-0.5 border-l-2 border-border pl-3">
                                                {accountingSubNav.map((sub) => {
                                                    const path =
                                                        currentUrl
                                                            .replace(
                                                                /\?.*$/,
                                                                '',
                                                            )
                                                            .replace(
                                                                /\/$/,
                                                                '',
                                                            ) || '/';
                                                    const subPath =
                                                        sub.href.replace(
                                                            /\/$/,
                                                            '',
                                                        );
                                                    const isSubActive =
                                                        sub.href ===
                                                        '/admin/accounting'
                                                            ? path ===
                                                              '/admin/accounting'
                                                            : path ===
                                                                  subPath ||
                                                              path.startsWith(
                                                                  subPath + '/',
                                                              );
                                                    return (
                                                        <Link
                                                            key={sub.href}
                                                            href={sub.href}
                                                            className={`block rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
                                                                isSubActive
                                                                    ? 'bg-primary text-primary-foreground'
                                                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                                            }`}
                                                        >
                                                            {sub.label}
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        )}
                                </div>
                            );
                        })}
                    </nav>

                    {/* Bank balance (admin) */}
                    {accountingCashBalance != null && (
                        <div className="border-t border-border px-4 py-3">
                            <div className="rounded-lg bg-muted/50 px-3 py-2 text-sm">
                                <span className="text-muted-foreground">
                                    Bank balance
                                </span>
                                <div className="font-semibold text-foreground">
                                    ৳
                                    {accountingCashBalance.toLocaleString(
                                        'en-BD',
                                        { minimumFractionDigits: 2 },
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* User Info & Logout */}
                    <div className="border-t border-border p-4">
                        <div className="mb-3 text-xs text-muted-foreground">
                            <div className="font-medium text-foreground">
                                {auth?.user?.name}
                            </div>
                            <div>{auth?.user?.email}</div>
                        </div>
                        <PwaInstallButton className="mb-2 w-full" />
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="mb-2 w-full justify-start"
                            onClick={toggleTheme}
                        >
                            {resolvedAppearance === 'dark' ? (
                                <Sun className="mr-2 size-4" />
                            ) : (
                                <Moon className="mr-2 size-4" />
                            )}
                            {resolvedAppearance === 'dark' ? 'Light' : 'Dark'}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={handleLogout}
                            disabled={logoutForm.processing}
                        >
                            <LogOut className="mr-2 size-4" />
                            Logout
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Main Content - Spacer for sidebar */}
            <div className="w-64 shrink-0" aria-hidden="true"></div>

            {/* Main Content */}
            <main className={`min-h-screen flex-1 ${showFlash ? 'pt-12' : ''}`}>
                {/* Header actions */}
                <div className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60">
                    <div className="flex items-center justify-end gap-3 px-6 py-3">
                        <Link href="/admin/pos">
                            <Button
                                className={`cursor-pointer shadow-sm ${
                                    isPosSection
                                        ? 'ring-2 ring-primary/30'
                                        : ''
                                }`}
                                variant={isPosSection ? 'default' : 'secondary'}
                            >
                                <ShoppingCart className="mr-2 size-4" />
                                POS
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="p-6">{children}</div>
            </main>
        </div>
    );
}
