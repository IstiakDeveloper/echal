import { Head, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import StoreLayout from '@/layouts/store-layout';

type OrderItem = {
    id: number;
    name: string;
    price: string;
    quantity: number;
    line_total: string;
};

type Order = {
    id: number;
    status: string;
    subtotal: string;
    delivery_amount: string;
    total: string;
    created_at: string;
    items: OrderItem[];
};

export default function OrderTracking({
    filters,
    order,
}: {
    filters: { order_id?: string | number | null };
    order: Order | null;
}) {
    const [orderId, setOrderId] = useState(
        (filters.order_id ?? '').toString(),
    );

    const statusLabel = useMemo(() => {
        const s = (order?.status ?? '').toLowerCase();
        if (s === 'pending') return 'Pending';
        if (s === 'processing') return 'Processing';
        if (s === 'shipped') return 'Shipped';
        if (s === 'delivered') return 'Delivered';
        if (s === 'cancelled') return 'Cancelled';
        return order?.status ?? '';
    }, [order?.status]);

    const statusTone = useMemo(() => {
        const s = (order?.status ?? '').toLowerCase();
        if (s === 'delivered') return 'bg-emerald-600 text-white';
        if (s === 'cancelled') return 'bg-red-600 text-white';
        if (s === 'shipped') return 'bg-indigo-600 text-white';
        if (s === 'processing') return 'bg-blue-600 text-white';
        return 'bg-muted text-foreground';
    }, [order?.status]);

    return (
        <>
            <Head title="Order tracking — E-Chal" />
            <StoreLayout>
                <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                            Track your order
                        </h1>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Enter your order ID to see the latest status.
                        </p>
                    </div>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            router.get(
                                '/order-tracking',
                                { order_id: orderId.trim() },
                                { preserveScroll: true, preserveState: true },
                            );
                        }}
                        className="grid gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-[1fr_auto] sm:items-end"
                    >
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Order ID
                            </label>
                            <input
                                value={orderId}
                                onChange={(e) =>
                                    setOrderId(
                                        e.target.value.replace(/\D+/g, ''),
                                    )
                                }
                                inputMode="numeric"
                                pattern="[0-9]*"
                                placeholder="e.g. 1234"
                                className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                        <Button type="submit" className="h-11">
                            Track
                        </Button>
                    </form>

                    {filters.order_id && !order && (
                        <div className="mt-6 rounded-2xl border border-border bg-card p-6">
                            <p className="text-sm font-medium text-foreground">
                                No order found
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Please check the order ID and try again.
                            </p>
                        </div>
                    )}

                    {order && (
                        <div className="mt-6 space-y-4">
                            <div className="rounded-2xl border border-border bg-card p-6">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Order #{order.id}
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Placed{' '}
                                            {new Date(
                                                order.created_at,
                                            ).toLocaleString()}
                                        </p>
                                    </div>
                                    <span
                                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusTone}`}
                                    >
                                        {statusLabel}
                                    </span>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-border bg-card p-6">
                                <h2 className="text-sm font-semibold text-foreground">
                                    Items
                                </h2>
                                <ul className="mt-4 space-y-3">
                                    {order.items.map((item) => (
                                        <li
                                            key={item.id}
                                            className="flex items-center justify-between gap-3 rounded-xl border border-border p-3"
                                        >
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium text-foreground">
                                                    {item.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Qty {item.quantity} × ৳
                                                    {Number(
                                                        item.price,
                                                    ).toLocaleString()}
                                                </p>
                                            </div>
                                            <p className="shrink-0 text-sm font-semibold text-foreground">
                                                ৳
                                                {Number(
                                                    item.line_total,
                                                ).toLocaleString()}
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="rounded-2xl border border-border bg-card p-6">
                                <h2 className="text-sm font-semibold text-foreground">
                                    Summary
                                </h2>
                                <div className="mt-3 space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Subtotal
                                        </span>
                                        <span className="font-medium">
                                            ৳
                                            {Number(
                                                order.subtotal,
                                            ).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Delivery
                                        </span>
                                        <span className="font-medium">
                                            ৳
                                            {Number(
                                                order.delivery_amount,
                                            ).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="border-t border-border pt-2">
                                        <div className="flex justify-between">
                                            <span className="font-semibold">
                                                Total
                                            </span>
                                            <span className="text-base font-bold">
                                                ৳
                                                {Number(
                                                    order.total,
                                                ).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </StoreLayout>
        </>
    );
}

