import { Head, Link, usePage } from '@inertiajs/react';
import { Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StoreLayout from '@/layouts/store-layout';
import type { SharedData } from '@/types';

type CartItem = {
    id: number;
    name: string;
    slug: string;
    price: string;
    image: string | null;
    stock: number;
    quantity: number;
    line_total: number;
    category: {
        id: number | null;
        name: string | null;
        slug: string | null;
    };
};

export default function StoreCart({
    items = [],
    total = 0,
}: {
    items: CartItem[];
    total: number;
}) {
    const hasItems = items.length > 0;
    const { name } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Cart — E-Chal" />
            <StoreLayout>
                <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
                    <h1 className="text-2xl font-bold text-foreground">
                        Your cart
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Review your selected rice before checkout.
                    </p>

                    {!hasItems ? (
                        <div className="mt-8 rounded-xl border border-border bg-card p-12 text-center">
                            <div className="mx-auto flex size-14 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                                <Package className="size-7" aria-hidden />
                            </div>
                            <p className="mt-4 font-semibold text-foreground">
                                Your cart is empty
                            </p>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Add Miniket, Chinigura, Basmati or other rice
                                types to continue.
                            </p>
                            <Link
                                href="/products"
                                className="mt-6 inline-block"
                            >
                                <Button>Browse rice</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr,20rem]">
                            <div className="space-y-4">
                                {items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex gap-4 rounded-xl border border-border bg-card p-4"
                                    >
                                        <div className="size-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                                            {item.image ? (
                                                <img
                                                    src={item.image}
                                                    alt=""
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                                    {name}
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-medium text-primary">
                                                {item.category.name}
                                            </p>
                                            <p className="font-semibold text-foreground">
                                                {item.name}
                                            </p>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                Quantity: {item.quantity}
                                            </p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                In stock: {item.stock}
                                            </p>
                                            <p className="mt-2 text-sm font-semibold text-foreground">
                                                ৳
                                                {item.line_total.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <aside className="rounded-xl border border-border bg-card p-5">
                                <h2 className="text-lg font-semibold text-foreground">
                                    Order summary
                                </h2>
                                <div className="mt-4 flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        Items total
                                    </span>
                                    <span className="font-semibold text-foreground">
                                        ৳{total.toLocaleString()}
                                    </span>
                                </div>
                                <Link href="/checkout" className="mt-4 block">
                                    <Button className="w-full" size="lg">
                                        Proceed to checkout
                                    </Button>
                                </Link>
                            </aside>
                        </div>
                    )}
                </main>
            </StoreLayout>
        </>
    );
}
