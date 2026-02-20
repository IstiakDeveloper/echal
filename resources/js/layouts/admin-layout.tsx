import { Link, useForm, usePage } from '@inertiajs/react';
import {
    BarChart3,
    Box,
    FolderTree,
    LayoutDashboard,
    LogOut,
    Package,
    ShoppingBag,
    Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCurrentUrl } from '@/hooks/use-current-url';
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
    const { auth, unreadOrdersCount = 0 } = usePage<SharedData & { unreadOrdersCount?: number }>().props;
    const { currentUrl } = useCurrentUrl();
    const logoutForm = useForm({});

    const handleLogout = () => {
        logoutForm.post('/admin/logout');
    };

    const navItems: NavItem[] = [
        { href: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
        { href: '/admin/products', icon: Package, label: 'Products' },
        { href: '/admin/categories', icon: FolderTree, label: 'Categories' },
        { href: '/admin/orders', icon: ShoppingBag, label: 'Orders', badge: unreadOrdersCount > 0 ? unreadOrdersCount : undefined },
        { href: '/admin/customers', icon: Users, label: 'Customers' },
        { href: '/admin/delivery-amounts', icon: Box, label: 'Delivery Amounts' },
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
        return normalizedCurrent === normalizedHref || normalizedCurrent.startsWith(normalizedHref + '/');
    };

    return (
        <div className="flex min-h-screen bg-muted/30">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 z-10 h-screen w-64 shrink-0 border-r border-border bg-card shadow-sm">
                <div className="flex h-full flex-col">
                    {/* Logo */}
                    <div className="border-b border-border p-4">
                        <Link href="/admin" className="flex items-center gap-2 text-lg font-semibold">
                            <BarChart3 className="size-5 text-primary" />
                            <span>E-Chal Admin</span>
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-1 overflow-y-auto p-4">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = checkIsActive(item.href, item.exact);

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                        isActive
                                            ? 'bg-primary text-primary-foreground'
                                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                    }`}
                                >
                                    <Icon className="size-4" />
                                    <span>{item.label}</span>
                                    {item.badge && item.badge > 0 && (
                                        <span className="ml-auto flex size-5 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
                                            {item.badge > 99 ? '99+' : item.badge}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Info & Logout */}
                    <div className="border-t border-border p-4">
                        <div className="mb-3 text-xs text-muted-foreground">
                            <div className="font-medium text-foreground">{auth?.user?.name}</div>
                            <div>{auth?.user?.email}</div>
                        </div>
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
            <main className="flex-1 min-h-screen">
                <div className="p-6">{children}</div>
            </main>
        </div>
    );
}
