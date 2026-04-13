import { Minus, Package, Plus, ShoppingCart, Zap } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

export type ProductCardProduct = {
    id: number;
    name: string;
    slug: string;
    description?: string | null;
    price: string;
    image: string | null;
    images?: string[] | null;
    category: { id: number; name: string; slug: string };
};

type ProductCardProps = {
    product: ProductCardProduct;
    quantityInCart: number;
    onAddToCart: (productId: number) => void;
    onSetQuantity: (productId: number, quantity: number) => void;
    onOpenDrawer?: () => void;
    onBuy?: (productId: number) => void;
};

export default function ProductCard({
    product,
    quantityInCart,
    onAddToCart,
    onSetQuantity,
    onOpenDrawer,
    onBuy,
}: ProductCardProps) {
    const [open, setOpen] = useState(false);

    const handleAddToCart = () => {
        onAddToCart(product.id);
        onOpenDrawer?.();
    };

    const handleBuyNow = () => {
        onBuy?.(product.id);
    };

    return (
        <>
            <li
                className="cursor-pointer overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/25"
                onClick={() => setOpen(true)}
            >
                <div className="aspect-square w-full overflow-hidden bg-muted">
                    {product.image ? (
                        <img
                            src={product.image}
                            alt=""
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                            <Package className="size-14" aria-hidden />
                        </div>
                    )}
                </div>
                <div className="p-4">
                    <p className="text-xs font-medium uppercase tracking-wider text-primary">
                        {product.category.name}
                    </p>
                    <h2 className="mt-1 font-semibold text-foreground">{product.name}</h2>
                    {product.description != null && product.description !== '' && (
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                            {product.description}
                        </p>
                    )}
                    <div
                        className="mt-4 flex items-center justify-between gap-2"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <span className="text-lg font-bold text-primary">
                            ৳{Number(product.price).toLocaleString()}
                        </span>
                        {quantityInCart > 0 ? (
                            <div className="inline-flex items-center gap-0.5 rounded-lg border border-border bg-muted px-2 py-1">
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="size-7"
                                    onClick={() =>
                                        onSetQuantity(
                                            product.id,
                                            Math.max(quantityInCart - 1, 0)
                                        )
                                    }
                                >
                                    <Minus className="size-3.5" aria-hidden />
                                </Button>
                                <span className="min-w-[1.25rem] text-center text-sm font-medium">
                                    {quantityInCart}
                                </span>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="size-7"
                                    onClick={() =>
                                        onSetQuantity(product.id, quantityInCart + 1)
                                    }
                                >
                                    <Plus className="size-3.5" aria-hidden />
                                </Button>
                            </div>
                        ) : (
                            <Button size="sm" className="gap-1.5" onClick={handleAddToCart}>
                                <ShoppingCart className="size-3.5" aria-hidden />
                                Add
                            </Button>
                        )}
                    </div>
                    {onBuy && (
                        <div onClick={(e) => e.stopPropagation()} className="mt-2">
                            <Button
                                size="sm"
                                variant="outline"
                                className="w-full gap-1.5"
                                onClick={handleBuyNow}
                            >
                                <Zap className="size-3.5" aria-hidden />
                                Buy now
                            </Button>
                        </div>
                    )}
                </div>
            </li>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto p-0 sm:max-w-xl">
                    <div className="flex flex-col sm:flex-row sm:gap-6">
                        <div className="sm:w-1/2">
                            <div className="aspect-square w-full overflow-hidden rounded-t-xl bg-muted sm:rounded-l-xl sm:rounded-tr-none">
                                {product.images?.length ? (
                                    <img
                                        src={product.images[0] ?? product.image ?? ''}
                                        alt={product.name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : product.image ? (
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                        <Package className="size-16" aria-hidden />
                                    </div>
                                )}
                            </div>
                            {product.images && product.images.length > 1 && (
                                <div className="flex gap-2 overflow-x-auto p-3">
                                    {product.images.map((src, idx) => (
                                        <div
                                            key={idx}
                                            className="aspect-square w-12 shrink-0 overflow-hidden rounded-lg bg-muted"
                                        >
                                            <img
                                                src={src}
                                                alt=""
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
                            <DialogHeader className="text-left">
                                <DialogDescription className="text-xs font-medium uppercase tracking-wider text-primary">
                                    {product.category.name}
                                </DialogDescription>
                                <DialogTitle className="text-lg font-semibold">
                                    {product.name}
                                </DialogTitle>
                            </DialogHeader>
                            {product.description && (
                                <p className="text-sm text-muted-foreground">
                                    {product.description}
                                </p>
                            )}
                            <p className="text-lg font-semibold text-foreground">
                                ৳{Number(product.price).toLocaleString()}
                            </p>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                {quantityInCart > 0 ? (
                                    <div className="inline-flex items-center gap-1 rounded-lg border border-border bg-muted px-2 py-1">
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="size-7"
                                            onClick={() =>
                                                onSetQuantity(
                                                    product.id,
                                                    Math.max(quantityInCart - 1, 0)
                                                )
                                            }
                                        >
                                            <Minus className="size-3.5" aria-hidden />
                                        </Button>
                                        <span className="min-w-[1.5rem] text-center text-sm font-medium">
                                            {quantityInCart}
                                        </span>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="size-7"
                                            onClick={() =>
                                                onSetQuantity(
                                                    product.id,
                                                    quantityInCart + 1
                                                )
                                            }
                                        >
                                            <Plus className="size-3.5" aria-hidden />
                                        </Button>
                                    </div>
                                ) : (
                                    <Button size="sm" className="gap-1.5" onClick={handleAddToCart}>
                                        <ShoppingCart className="size-3.5" aria-hidden />
                                        Add to cart
                                    </Button>
                                )}
                                {onBuy && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="gap-1.5"
                                        onClick={handleBuyNow}
                                    >
                                        <Zap className="size-3.5" aria-hidden />
                                        Buy now
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
