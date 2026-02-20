import { Head, Link, usePage } from '@inertiajs/react';
import type { SharedData } from '@/types';
import StoreLayout from '@/layouts/store-layout';
import { Button } from '@/components/ui/button';

type CartItem = {
    id: number;
    name: string;
    slug: string;
    price: string;
    image: string | null;
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
                <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
                    <h1 className="text-2xl font-semibold text-foreground">Your cart</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Review your selected rice before checkout.
                    </p>

                    {!hasItems ? (
                        <div className="mt-8 rounded-xl border border-border bg-card p-10 text-center">
                            <p className="text-lg font-semibold text-foreground">
                                Your cart is empty
                            </p>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Add Miniket, Chinigura, Basmati or other rice types to continue.
                            </p>
                            <Link href="/products" className="mt-6 inline-block">
                                <Button>Browse rice</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="mt-8 grid gap-8 lg:grid-cols-[2fr,1fr]">
                            <div className="space-y-4">
                                {items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex gap-4 rounded-xl border border-border bg-card p-4"
                                    >
                                        <div className="h-20 w-20 overflow-hidden rounded-lg bg-muted">
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
                                        <div className="flex flex-1 flex-col justify-between">
                                            <div>
                                                <p className="text-xs font-medium text-primary">
                                                    {item.category.name}
                                                </p>
                                                <p className="font-semibold text-foreground">
                                                    {item.name}
                                                </p>
                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    Quantity: {item.quantity}
                                                </p>
                                            </div>
                                            <div className="text-sm font-semibold text-foreground">
                                                ৳{item.line_total.toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <aside className="space-y-4 rounded-xl border border-border bg-card p-6">
                                <h2 className="text-lg font-semibold text-foreground">
                                    Order summary
                                </h2>
                                <div className="flex items-center justify-between text-sm text-muted-foreground">
                                    <span>Items total</span>
                                    <span className="font-medium text-foreground">
                                        ৳{total.toLocaleString()}
                                    </span>
                                </div>
                                <Link href="/checkout">
                                    <Button className="mt-4 w-full">
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
