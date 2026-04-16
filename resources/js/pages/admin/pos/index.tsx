import { Head, router } from '@inertiajs/react';
import { Minus, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AdminLayout from '@/layouts/admin-layout';

type Product = {
    id: number;
    name: string;
    price: string;
    image: string | null;
    is_active: boolean;
    stock: number;
};

type PosIndexProps = {
    products: {
        data: Product[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    filters: { search?: string };
};

type CartLine = {
    product: Product;
    quantity: number;
    lineTotal: number;
};

export default function PosIndex({ products, filters }: PosIndexProps) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [phone, setPhone] = useState('');
    const [discount, setDiscount] = useState<string>('');
    const [cart, setCart] = useState<Record<number, CartLine>>({});
    const cartLines = useMemo(() => Object.values(cart), [cart]);

    const subtotal = useMemo(
        () => cartLines.reduce((sum, l) => sum + l.lineTotal, 0),
        [cartLines],
    );

    const discountAmount = useMemo(() => {
        const parsed = Number.parseFloat(discount);
        if (!Number.isFinite(parsed) || parsed < 0) return 0;
        return parsed;
    }, [discount]);

    const total = useMemo(() => {
        const t = subtotal - discountAmount;
        return t < 0 ? 0 : t;
    }, [subtotal, discountAmount]);

    const updateQuantity = (product: Product, nextQty: number) => {
        setCart((prev) => {
            const stock = Math.max(0, Math.floor(product.stock ?? 0));
            const quantity = Math.min(
                stock,
                Math.max(0, Math.floor(nextQty)),
            );
            if (quantity <= 0) {
                const next = { ...prev };
                delete next[product.id];
                return next;
            }
            const price = Number.parseFloat(product.price) || 0;
            return {
                ...prev,
                [product.id]: {
                    product,
                    quantity,
                    lineTotal: price * quantity,
                },
            };
        });
    };

    const addToCart = (product: Product) => {
        const existingQty = cart[product.id]?.quantity ?? 0;
        updateQuantity(product, existingQty + 1);
    };

    // Live search (debounced). No search button needed.
    useEffect(() => {
        const t = setTimeout(() => {
            router.get(
                '/admin/pos',
                { search: search.trim() || undefined },
                {
                    preserveScroll: true,
                    preserveState: true,
                    replace: true,
                },
            );
        }, 250);

        return () => clearTimeout(t);
    }, [search]);

    const submitSale = () => {
        const items = cartLines.map((l) => ({
            product_id: l.product.id,
            quantity: l.quantity,
        }));

        router.post(
            '/admin/pos',
            {
                phone,
                items,
                discount: discountAmount > 0 ? discountAmount : undefined,
            },
            {
                preserveScroll: true,
            },
        );
    };

    return (
        <>
            <Head title="POS (Offline Sale) — Admin" />
            <AdminLayout>
                <div className="space-y-6">
                    <div className="overflow-hidden rounded-xl border border-border bg-card">
                        <div className="bg-linear-to-r from-primary/10 via-transparent to-transparent p-6">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold tracking-tight">
                                        POS (Offline Sale)
                                    </h1>
                                    <p className="mt-1 text-muted-foreground">
                                        Create a delivered sale instantly (shows
                                        in accounting reports).
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="rounded-lg border border-border bg-background/50 px-3 py-2">
                                        <div className="text-xs text-muted-foreground">
                                            Items
                                        </div>
                                        <div className="font-semibold tabular-nums">
                                            {cartLines.reduce(
                                                (sum, l) =>
                                                    sum + (l.quantity ?? 0),
                                                0,
                                            )}
                                        </div>
                                    </div>
                                    <div className="rounded-lg border border-border bg-background/50 px-3 py-2">
                                        <div className="text-xs text-muted-foreground">
                                            Total
                                        </div>
                                        <div className="font-semibold tabular-nums">
                                            ৳
                                            {subtotal.toLocaleString('en-BD', {
                                                minimumFractionDigits: 2,
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-[7fr_3fr]">
                        {/* Products */}
                        <div className="rounded-lg border border-border bg-card">
                            <div className="border-b border-border p-4">
                                <form
                                    method="get"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                    }}
                                    className="flex"
                                >
                                    <div className="relative flex-1">
                                        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            value={search}
                                            onChange={(e) =>
                                                setSearch(e.target.value)
                                            }
                                            placeholder="Search products..."
                                            className="pl-9"
                                        />
                                    </div>
                                </form>
                            </div>

                            <div className="p-4">
                                {products.data.length === 0 ? (
                                    <div className="p-6 text-center text-sm text-muted-foreground">
                                        No products found.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                                        {products.data.map((p) => {
                                            const stock = p.stock ?? 0;
                                            const currentQty =
                                                cart[p.id]?.quantity ?? 0;
                                            const isOutOfStock = stock <= 0;
                                            const isMaxed =
                                                !isOutOfStock &&
                                                currentQty >= stock;
                                            const isDisabled =
                                                isOutOfStock || isMaxed;

                                            return (
                                                <button
                                                    key={p.id}
                                                    type="button"
                                                    onClick={() =>
                                                        isDisabled
                                                            ? undefined
                                                            : addToCart(p)
                                                    }
                                                    disabled={isDisabled}
                                                    className={`group relative overflow-hidden rounded-xl border border-border bg-background text-left shadow-sm transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                                                        isDisabled
                                                            ? 'cursor-not-allowed opacity-60'
                                                            : 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md'
                                                    }`}
                                                >
                                                <div className="aspect-square bg-muted/40">
                                                    {p.image ? (
                                                        <img
                                                            src={p.image}
                                                            alt=""
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : null}
                                                </div>

                                                <div className="space-y-1 p-2">
                                                    <div className="truncate text-xs font-semibold">
                                                        {p.name}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground tabular-nums">
                                                        ৳
                                                        {Number.parseFloat(
                                                            p.price,
                                                        ).toLocaleString(
                                                            'en-BD',
                                                            {
                                                                minimumFractionDigits: 2,
                                                            },
                                                        )}
                                                    </div>
                                                    <div className="text-[11px] text-muted-foreground">
                                                        Stock: {p.stock ?? 0}
                                                    </div>

                                                    {isOutOfStock ? (
                                                        <div className="pt-1 text-[11px] font-medium text-destructive">
                                                            Out of stock
                                                        </div>
                                                    ) : isMaxed ? (
                                                        <div className="pt-1 text-[11px] font-medium text-amber-700 dark:text-amber-300">
                                                            Max in cart
                                                        </div>
                                                    ) : (
                                                        <div className="pt-1 text-[11px] text-muted-foreground/80">
                                                            Click to add
                                                        </div>
                                                    )}
                                                </div>
                                                {!isDisabled ? (
                                                    <div className="pointer-events-none absolute top-2 right-2 flex size-7 items-center justify-center rounded-full bg-background/80 text-foreground shadow-sm ring-1 ring-border transition group-hover:bg-primary group-hover:text-primary-foreground">
                                                        <Plus className="size-4" />
                                                    </div>
                                                ) : null}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Cart */}
                        <div className="rounded-lg border border-border bg-card">
                            <div className="border-b border-border p-4">
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div>
                                        <div className="mb-1 text-xs font-medium text-muted-foreground">
                                            Customer phone
                                        </div>
                                        <Input
                                            value={phone}
                                            onChange={(e) =>
                                                setPhone(e.target.value)
                                            }
                                            placeholder="01XXXXXXXXX"
                                        />
                                    </div>
                                    <div className="flex items-end justify-end">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setCart({})}
                                            disabled={cartLines.length === 0}
                                        >
                                            <Trash2 className="mr-2 size-4" />
                                            Clear cart
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="divide-y divide-border">
                                {cartLines.length === 0 ? (
                                    <div className="p-10 text-center">
                                        <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-muted" />
                                        <div className="font-medium">
                                            Cart is empty
                                        </div>
                                        <div className="mt-1 text-sm text-muted-foreground">
                                            Add products from the left to start
                                            a sale.
                                        </div>
                                    </div>
                                ) : (
                                    cartLines.map((l) => (
                                        <div
                                            key={l.product.id}
                                            className="flex items-center gap-3 p-4"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <div className="truncate font-medium">
                                                    {l.product.name}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    ৳
                                                    {Number.parseFloat(
                                                        l.product.price,
                                                    ).toLocaleString('en-BD', {
                                                        minimumFractionDigits: 2,
                                                    })}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        updateQuantity(
                                                            l.product,
                                                            l.quantity - 1,
                                                        )
                                                    }
                                                >
                                                    <Minus className="size-4" />
                                                </Button>
                                                <Input
                                                    value={String(l.quantity)}
                                                    onChange={(e) =>
                                                        updateQuantity(
                                                            l.product,
                                                            Number.parseInt(
                                                                e.target.value,
                                                                10,
                                                            ) || 0,
                                                        )
                                                    }
                                                    className="h-9 w-20 text-center"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={
                                                        (l.product.stock ??
                                                            0) <= 0 ||
                                                        l.quantity >=
                                                            (l.product.stock ??
                                                                0)
                                                    }
                                                    onClick={() =>
                                                        updateQuantity(
                                                            l.product,
                                                            l.quantity + 1,
                                                        )
                                                    }
                                                >
                                                    <Plus className="size-4" />
                                                </Button>
                                            </div>

                                            <div className="w-28 text-right text-sm font-medium tabular-nums">
                                                ৳
                                                {l.lineTotal.toLocaleString(
                                                    'en-BD',
                                                    {
                                                        minimumFractionDigits: 2,
                                                    },
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="border-t border-border p-4">
                                <div className="rounded-lg bg-muted/40 p-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            Subtotal
                                        </span>
                                        <span className="font-medium tabular-nums">
                                            ৳
                                            {subtotal.toLocaleString('en-BD', {
                                                minimumFractionDigits: 2,
                                            })}
                                        </span>
                                    </div>
                                    <div className="mt-2 flex items-center justify-between gap-3 text-sm">
                                        <span className="text-muted-foreground">
                                            Discount
                                        </span>
                                        <div className="flex w-44 items-center gap-2">
                                            <span className="text-muted-foreground">
                                                ৳
                                            </span>
                                            <Input
                                                value={discount}
                                                onChange={(e) =>
                                                    setDiscount(e.target.value)
                                                }
                                                inputMode="decimal"
                                                placeholder="0"
                                                className="h-9 text-right tabular-nums"
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-2 flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            Delivery
                                        </span>
                                        <span className="font-medium tabular-nums">
                                            ৳0.00
                                        </span>
                                    </div>
                                    <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3">
                                        <span className="text-sm text-muted-foreground">
                                            Total
                                        </span>
                                        <span className="text-lg font-semibold tabular-nums">
                                            ৳
                                            {total.toLocaleString('en-BD', {
                                                minimumFractionDigits: 2,
                                            })}
                                        </span>
                                    </div>
                                    {discountAmount > subtotal ? (
                                        <div className="mt-2 text-xs text-destructive">
                                            Discount cannot exceed subtotal.
                                        </div>
                                    ) : null}
                                </div>

                                <Button
                                    type="button"
                                    className="mt-4 w-full"
                                    onClick={submitSale}
                                    disabled={
                                        cartLines.length === 0 ||
                                        phone.trim().length === 0 ||
                                        discountAmount > subtotal ||
                                        total <= 0
                                    }
                                >
                                    Complete Sale
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </AdminLayout>
        </>
    );
}

