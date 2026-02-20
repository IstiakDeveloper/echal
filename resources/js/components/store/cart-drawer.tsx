import { Minus, Package, Plus, ShoppingCart } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from '@inertiajs/react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
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
        if (open) {
            fetchCart();
        }
    }, [open, fetchCart]);

    const handleSetQuantity = useCallback(
        (productId: number, quantity: number) => {
            setQuantity(productId, quantity);
            setItems((prev) => {
                const next = prev.map((i) =>
                    i.id === productId ? { ...i, quantity, line_total: Number(i.price) * quantity } : i
                ).filter((i) => i.quantity > 0);
                return next;
            });
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
                className="flex h-full w-full flex-col border-l border-border bg-background sm:max-w-md"
            >
                <SheetHeader className="shrink-0 border-b border-border py-4">
                    <SheetTitle className="flex items-center gap-2 text-xl font-semibold">
                        <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <ShoppingCart className="size-5" aria-hidden />
                        </span>
                        Your cart
                    </SheetTitle>
                </SheetHeader>
                <div className="min-h-0 flex-1 overflow-y-auto py-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                            <span className="mt-4 text-sm text-muted-foreground">Loading…</span>
                        </div>
                    ) : items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
                            <div className="flex size-16 items-center justify-center rounded-2xl bg-muted">
                                <Package className="size-8 text-muted-foreground" aria-hidden />
                            </div>
                            <p className="mt-5 text-base font-semibold text-foreground">Cart is empty</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Add rice from the shop to continue.
                            </p>
                            <Button
                                variant="outline"
                                size="lg"
                                className="mt-6 gap-2"
                                onClick={() => onOpenChange(false)}
                                asChild
                            >
                                <Link href={productsIndex.url()}>Browse rice</Link>
                            </Button>
                        </div>
                    ) : (
                        <ul className="space-y-3 px-1">
                            {items.map((item) => (
                                <li
                                    key={item.id}
                                    className="flex gap-3 rounded-xl border border-border bg-card p-3 shadow-sm"
                                >
                                    <div className="size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                                        {item.image ? (
                                            <img
                                                src={item.image}
                                                alt=""
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center">
                                                <Package className="size-6 text-muted-foreground" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-foreground">
                                            {item.name}
                                        </p>
                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                            ৳{Number(item.price).toLocaleString()} × {item.quantity}
                                        </p>
                                        <div className="mt-2 flex items-center gap-1">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="size-8 rounded-full"
                                                onClick={() =>
                                                    handleSetQuantity(
                                                        item.id,
                                                        Math.max(item.quantity - 1, 0)
                                                    )
                                                }
                                            >
                                                <Minus className="size-3.5" aria-hidden />
                                            </Button>
                                            <span className="min-w-[1.5rem] text-center text-sm font-medium">
                                                {item.quantity}
                                            </span>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="size-8 rounded-full"
                                                onClick={() =>
                                                    handleSetQuantity(item.id, item.quantity + 1)
                                                }
                                            >
                                                <Plus className="size-3.5" aria-hidden />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="shrink-0 text-right text-sm font-bold text-foreground">
                                        ৳{item.line_total.toLocaleString()}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                {items.length > 0 && (
                    <div className="shrink-0 border-t border-border bg-card p-4">
                        <div className="mb-4 flex items-center justify-between">
                            <span className="text-sm font-medium text-muted-foreground">Total</span>
                            <span className="text-xl font-bold text-foreground">
                                ৳{total.toLocaleString()}
                            </span>
                        </div>
                        <Button className="w-full gap-2" size="lg" asChild>
                            <Link href="/checkout">Proceed to checkout</Link>
                        </Button>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}
