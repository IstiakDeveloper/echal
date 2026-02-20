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
    const inCartQuantity = quantityInCart;
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
                className="group cursor-pointer overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-200 hover:border-primary/20 hover:shadow-md"
                onClick={() => setOpen(true)}
            >
                <div className="relative aspect-square w-full overflow-hidden bg-muted">
                    {product.image ? (
                        <img
                            src={product.image}
                            alt=""
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                            <Package className="size-16" aria-hidden />
                        </div>
                    )}
                    <span className="absolute left-3 top-3 rounded-full bg-primary/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground backdrop-blur-sm">
                        {product.category.name}
                    </span>
                </div>
                <div className="p-4 sm:p-5">
                    <h2 className="font-semibold leading-snug text-foreground">
                        {product.name}
                    </h2>
                    {product.description != null && product.description !== '' && (
                        <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
                            {product.description}
                        </p>
                    )}
                    <div
                        className="mt-4 flex items-center justify-between gap-2"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <span className="text-lg font-bold text-foreground">
                            ৳{Number(product.price).toLocaleString()}
                        </span>
                        {inCartQuantity > 0 ? (
                            <div className="inline-flex items-center gap-0.5 rounded-full border border-border bg-muted px-1.5 py-1">
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="size-7 rounded-full"
                                    onClick={() =>
                                        onSetQuantity(
                                            product.id,
                                            Math.max(inCartQuantity - 1, 0)
                                        )
                                    }
                                >
                                    <Minus className="size-3.5" aria-hidden />
                                </Button>
                                <span className="min-w-[1.5rem] text-center text-sm font-medium">
                                    {inCartQuantity}
                                </span>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="size-7 rounded-full"
                                    onClick={() =>
                                        onSetQuantity(
                                            product.id,
                                            inCartQuantity + 1
                                        )
                                    }
                                >
                                    <Plus className="size-3.5" aria-hidden />
                                </Button>
                            </div>
                        ) : (
                            <Button
                                size="sm"
                                className="gap-1.5"
                                onClick={handleAddToCart}
                            >
                                <ShoppingCart
                                    className="size-3.5"
                                    aria-hidden
                                />
                                Add to cart
                            </Button>
                        )}
                    </div>
                    {onBuy && (
                        <div onClick={(e) => e.stopPropagation()}>
                            <Button
                                size="sm"
                                variant="secondary"
                                className="mt-2 w-full gap-1.5"
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
                    <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
                        <div className="sm:w-1/2">
                            <div className="aspect-square w-full overflow-hidden rounded-t-lg bg-muted sm:rounded-l-lg sm:rounded-tr-none">
                                {product.images && product.images.length > 0 ? (
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
                                <div className="mt-2 flex gap-2 overflow-x-auto px-3 pb-2 pt-1 sm:px-0">
                                    {product.images.map((src, idx) => (
                                        <div
                                            key={idx}
                                            className="aspect-square w-14 overflow-hidden rounded-md bg-muted"
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
                            <DialogHeader className="space-y-1 text-left">
                                <DialogTitle className="text-base font-semibold sm:text-lg">
                                    {product.name}
                                </DialogTitle>
                                <DialogDescription className="text-xs uppercase tracking-wide text-primary">
                                    {product.category.name}
                                </DialogDescription>
                            </DialogHeader>
                            {product.description && (
                                <p className="text-sm text-muted-foreground">
                                    {product.description}
                                </p>
                            )}
                            <div className="mt-1 text-lg font-semibold text-foreground">
                                ৳{Number(product.price).toLocaleString()}
                            </div>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                {inCartQuantity > 0 ? (
                                    <div className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-1 py-1">
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="size-7"
                                            onClick={() =>
                                                onSetQuantity(
                                                    product.id,
                                                    Math.max(inCartQuantity - 1, 0)
                                                )
                                            }
                                        >
                                            <Minus className="size-3.5" aria-hidden />
                                        </Button>
                                        <span className="min-w-[1.5rem] text-center text-sm font-medium">
                                            {inCartQuantity}
                                        </span>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="size-7"
                                            onClick={() =>
                                                onSetQuantity(
                                                    product.id,
                                                    inCartQuantity + 1
                                                )
                                            }
                                        >
                                            <Plus className="size-3.5" aria-hidden />
                                        </Button>
                                    </div>
                                ) : (
                                    <Button
                                        size="sm"
                                        className="gap-1.5"
                                        onClick={handleAddToCart}
                                    >
                                        <ShoppingCart
                                            className="size-3.5"
                                            aria-hidden
                                        />
                                        Add to cart
                                    </Button>
                                )}
                                {onBuy && (
                                    <Button
                                        size="sm"
                                        variant="secondary"
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
