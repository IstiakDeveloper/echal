import { Link } from '@inertiajs/react';
import { Minus, Package, Plus, ShoppingCart } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useCart } from '@/contexts/cart-context';
import { index as productsIndex } from '@/routes/products';

type CartItem = {
    id: number;
    name: string;
    slug: string;
    price: string;
    image: string | null;
    quantity: number;
    line_total: number;
    category: { id: number | null; name: string | null; slug: string | null };
};

type CartDrawerProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export default function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
    const { setQuantity } = useCart();
    const [items, setItems] = useState<CartItem[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);

    const fetchCart = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/cart', {
                credentials: 'same-origin',
                headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            });
            if (res.ok) {
                const data = (await res.json()) as { items: CartItem[]; total: number };
                setItems(data.items ?? []);
                setTotal(data.total ?? 0);
            }
        } catch {
            setItems([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (open) fetchCart();
    }, [open, fetchCart]);

    const handleSetQuantity = useCallback(
        (productId: number, quantity: number) => {
            setQuantity(productId, quantity);
            setItems((prev) =>
                prev
                    .map((i) =>
                        i.id === productId
                            ? { ...i, quantity, line_total: Number(i.price) * quantity }
                            : i
                    )
                    .filter((i) => i.quantity > 0)
            );
            setTotal((prevTotal) => {
                const item = items.find((i) => i.id === productId);
                if (!item) return prevTotal;
                const diff = (quantity - item.quantity) * Number(item.price);
                return Math.max(0, prevTotal + diff);
            });
        },
        [setQuantity, items]
    );

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                showOverlay={false}
                className="flex h-full w-full flex-col border-l border-border bg-background sm:max-w-sm"
            >
                <SheetHeader className="shrink-0 border-b border-border py-4">
                    <SheetTitle className="text-lg font-semibold">Your cart</SheetTitle>
                </SheetHeader>
                <div className="min-h-0 flex-1 overflow-y-auto py-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                            <p className="mt-3 text-sm text-muted-foreground">Loading…</p>
                        </div>
                    ) : items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
                            <div className="flex size-14 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                                <Package className="size-7" aria-hidden />
                            </div>
                            <p className="mt-4 font-medium text-foreground">Cart is empty</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Add rice from the shop to continue.
                            </p>
                            <Button
                                variant="outline"
                                className="mt-6"
                                onClick={() => onOpenChange(false)}
                                asChild
                            >
                                <Link href={productsIndex.url()}>Browse rice</Link>
                            </Button>
                        </div>
                    ) : (
                        <ul className="space-y-3">
                            {items.map((item) => (
                                <li
                                    key={item.id}
                                    className="flex gap-3 rounded-xl border border-border bg-card p-3"
                                >
                                    <div className="size-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                                        {item.image ? (
                                            <img
                                                src={item.image}
                                                alt=""
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center">
                                                <Package className="size-5 text-muted-foreground" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium text-foreground">
                                            {item.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            ৳{Number(item.price).toLocaleString()} × {item.quantity}
                                        </p>
                                        <div className="mt-2 flex items-center gap-1">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="size-7"
                                                onClick={() =>
                                                    handleSetQuantity(
                                                        item.id,
                                                        Math.max(item.quantity - 1, 0)
                                                    )
                                                }
                                            >
                                                <Minus className="size-3" aria-hidden />
                                            </Button>
                                            <span className="min-w-[1.25rem] text-center text-sm font-medium">
                                                {item.quantity}
                                            </span>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="size-7"
                                                onClick={() =>
                                                    handleSetQuantity(item.id, item.quantity + 1)
                                                }
                                            >
                                                <Plus className="size-3" aria-hidden />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="shrink-0 text-right text-sm font-semibold text-foreground">
                                        ৳{item.line_total.toLocaleString()}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                {items.length > 0 && (
                    <div className="shrink-0 border-t border-border bg-card p-4">
                        <div className="mb-3 flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Total</span>
                            <span className="font-semibold text-foreground">
                                ৳{total.toLocaleString()}
                            </span>
                        </div>
                        <Button className="w-full" size="lg" asChild>
                            <Link href="/checkout">Proceed to checkout</Link>
                        </Button>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}
