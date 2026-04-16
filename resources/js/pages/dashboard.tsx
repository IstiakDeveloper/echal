import { Head, Link } from '@inertiajs/react';
import {
    Package,
    ShoppingBag,
    Clock,
    CheckCircle2,
    Truck,
    XCircle,
    ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import CustomerLayout from '@/layouts/customer-layout';
import { home as homeRoute } from '@/routes';
import { index as productsIndex } from '@/routes/products';

type OrderItem = {
    id: number;
    name: string;
    price: string;
    quantity: number;
    line_total: string;
};

type Order = {
    id: number;
    phone: string;
    address: {
        division: string;
        district: string;
        upazila: string;
        full: string;
    };
    items: OrderItem[];
    subtotal: string;
    delivery_amount: string;
    total: string;
    status: string;
    created_at: string;
    updated_at: string;
};

type DashboardProps = {
    orders: Order[];
    stats: {
        total_orders: number;
        total_spent: string;
        pending_orders: number;
    };
};

const statusConfig: Record<
    string,
    { label: string; icon: React.ReactNode; color: string; bgColor: string }
> = {
    pending: {
        label: 'Pending',
        icon: <Clock className="size-4" />,
        color: 'text-amber-700 dark:text-amber-400',
        bgColor: 'bg-amber-50 dark:bg-amber-950',
    },
    processing: {
        label: 'Processing',
        icon: <Package className="size-4" />,
        color: 'text-blue-700 dark:text-blue-400',
        bgColor: 'bg-blue-50 dark:bg-blue-950',
    },
    shipped: {
        label: 'Shipped',
        icon: <Truck className="size-4" />,
        color: 'text-purple-700 dark:text-purple-400',
        bgColor: 'bg-purple-50 dark:bg-purple-950',
    },
    delivered: {
        label: 'Delivered',
        icon: <CheckCircle2 className="size-4" />,
        color: 'text-emerald-700 dark:text-emerald-400',
        bgColor: 'bg-emerald-50 dark:bg-emerald-950',
    },
    cancelled: {
        label: 'Cancelled',
        icon: <XCircle className="size-4" />,
        color: 'text-red-700 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-950',
    },
};

export default function Dashboard({ orders = [], stats }: DashboardProps) {
    const formatCurrency = (value: string | number) =>
        `৳${Number(value).toLocaleString()}`;
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-BD', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusConfig = (status: string) => {
        return (
            statusConfig[status] ?? {
                label: status.charAt(0).toUpperCase() + status.slice(1),
                icon: <Package className="size-4" />,
                color: 'text-muted-foreground',
                bgColor: 'bg-muted',
            }
        );
    };

    return (
        <>
            <Head title="My Orders — E-Chal" />
            <CustomerLayout>
                <div className="mx-auto max-w-6xl px-4 py-6 pb-20 sm:px-6 sm:py-8 sm:pb-8">
                    {/* Header */}
                    <div className="mb-6 sm:mb-8">
                        <div className="mb-4 flex items-center gap-3">
                            <Link
                                href={homeRoute.url()}
                                className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                            >
                                <ArrowLeft className="size-4" aria-hidden />
                                Back to home
                            </Link>
                        </div>
                        <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
                            My Orders
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Track your rice orders and delivery status
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="mb-6 grid gap-4 sm:mb-8 sm:grid-cols-3">
                        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-primary/10 p-2">
                                    <ShoppingBag className="size-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Total Orders
                                    </p>
                                    <p className="text-xl font-semibold text-foreground">
                                        {stats.total_orders}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-emerald-500/10 p-2">
                                    <CheckCircle2 className="size-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Total Spent
                                    </p>
                                    <p className="text-xl font-semibold text-foreground">
                                        {formatCurrency(stats.total_spent)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-amber-500/10 p-2">
                                    <Clock className="size-5 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Pending
                                    </p>
                                    <p className="text-xl font-semibold text-foreground">
                                        {stats.pending_orders}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Orders List */}
                    {orders.length === 0 ? (
                        <div className="rounded-xl border border-border bg-card p-12 text-center">
                            <Package className="mx-auto size-12 text-muted-foreground" />
                            <h2 className="mt-4 text-lg font-semibold text-foreground">
                                No orders yet
                            </h2>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Start shopping to see your orders here
                            </p>
                            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                                <Link href={productsIndex.url()}>
                                    <Button>Browse rice</Button>
                                </Link>
                                <Link href={homeRoute.url()}>
                                    <Button variant="outline">
                                        Go to home
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.map((order) => {
                                const statusInfo = getStatusConfig(
                                    order.status,
                                );

                                return (
                                    <div
                                        key={order.id}
                                        className="overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
                                    >
                                        {/* Order Header */}
                                        <div className="border-b border-border bg-muted/30 px-4 py-3 sm:px-6">
                                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-foreground">
                                                            Order #{order.id}
                                                        </span>
                                                        <span
                                                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}
                                                        >
                                                            {statusInfo.icon}
                                                            {statusInfo.label}
                                                        </span>
                                                    </div>
                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        Placed on{' '}
                                                        {formatDate(
                                                            order.created_at,
                                                        )}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-lg font-semibold text-foreground">
                                                        {formatCurrency(
                                                            order.total,
                                                        )}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {order.items.length}{' '}
                                                        item
                                                        {order.items.length !==
                                                        1
                                                            ? 's'
                                                            : ''}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Order Items */}
                                        <div className="px-4 py-4 sm:px-6">
                                            <ul className="space-y-2">
                                                {order.items.map((item) => (
                                                    <li
                                                        key={item.id}
                                                        className="flex items-start justify-between gap-3 text-sm"
                                                    >
                                                        <div className="flex-1">
                                                            <p className="font-medium text-foreground">
                                                                {item.name}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                Qty:{' '}
                                                                {item.quantity}{' '}
                                                                ×{' '}
                                                                {formatCurrency(
                                                                    item.price,
                                                                )}
                                                            </p>
                                                        </div>
                                                        <p className="font-medium text-foreground">
                                                            {formatCurrency(
                                                                item.line_total,
                                                            )}
                                                        </p>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* Order Footer */}
                                        <div className="border-t border-border bg-muted/20 px-4 py-3 sm:px-6">
                                            <div className="flex flex-col gap-2 text-xs sm:flex-row sm:items-center sm:justify-between">
                                                <div className="text-muted-foreground">
                                                    <p>
                                                        <span className="font-medium">
                                                            Delivery to:
                                                        </span>{' '}
                                                        {order.address.full},{' '}
                                                        {order.address.upazila},{' '}
                                                        {order.address.district}
                                                        ,{' '}
                                                        {order.address.division}
                                                    </p>
                                                    <p className="mt-1">
                                                        <span className="font-medium">
                                                            Phone:
                                                        </span>{' '}
                                                        {order.phone}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-4 text-right sm:flex-col sm:items-end sm:gap-1">
                                                    <div>
                                                        <span className="text-muted-foreground">
                                                            Subtotal:{' '}
                                                        </span>
                                                        <span className="font-medium">
                                                            {formatCurrency(
                                                                order.subtotal,
                                                            )}
                                                        </span>
                                                    </div>
                                                    {Number(
                                                        order.delivery_amount,
                                                    ) > 0 && (
                                                        <div>
                                                            <span className="text-muted-foreground">
                                                                Delivery:{' '}
                                                            </span>
                                                            <span className="font-medium">
                                                                {formatCurrency(
                                                                    order.delivery_amount,
                                                                )}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </CustomerLayout>
        </>
    );
}
