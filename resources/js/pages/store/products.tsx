import { Head, router, usePage } from '@inertiajs/react';
import { Package, Search } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/store/product-card';
import { useCart } from '@/contexts/cart-context';
import StoreLayout from '@/layouts/store-layout';
import { index as productsIndex } from '@/routes/products';
import type { SharedData } from '@/types';

type Category = {
    id: number;
    name: string;
    slug: string;
};

type Product = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    price: string;
    image: string | null;
    stock: number;
    category: Category;
};

export default function StoreProducts({
    products = [],
    categories = [],
    activeCategory = '',
    search = '',
}: {
    products: Product[];
    categories: Category[];
    activeCategory?: string;
    search?: string;
}) {
    const { getQuantity, addToCart, setQuantity, openDrawer, setFromServer } = useCart();
    const { url } = usePage<SharedData>();

    const [searchTerm, setSearchTerm] = useState(search ?? '');

    const handleBuyNow = useCallback(
        async (productId: number) => {
            const formData = new FormData();
            formData.append('product_id', String(productId));
            formData.append(
                '_token',
                (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null)?.content ?? ''
            );
            const res = await fetch('/cart/buy-now', {
                method: 'POST',
                body: formData,
                credentials: 'same-origin',
                headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            });
            const data = (await res.json()) as {
                cart?: { count: number; items: Record<string, { quantity: number }> };
                redirect?: string;
            };
            if (data.cart) setFromServer(data.cart.count, data.cart.items);
            if (data.redirect) router.visit(data.redirect);
        },
        [setFromServer]
    );

    const applyFilters = useCallback(
        (categorySlug: string | null, term: string) => {
            router.get(
                productsIndex.url(),
                {
                    category: categorySlug || undefined,
                    search: term || undefined,
                },
                { preserveScroll: true, preserveState: true }
            );
        },
        []
    );

    const handleSubmitSearch = useCallback(
        (event: React.FormEvent) => {
            event.preventDefault();
            applyFilters(activeCategory || null, searchTerm.trim());
        },
        [activeCategory, searchTerm, applyFilters]
    );

    const handleSelectCategory = useCallback(
        (slug: string | null) => {
            applyFilters(slug, searchTerm.trim());
        },
        [applyFilters, searchTerm]
    );

    return (
        <>
            <Head title="Products — E-Chal" />
            <StoreLayout>
                <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
                    <div className="mb-6 space-y-5 sm:mb-8">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                                    <Package className="size-6 text-primary" aria-hidden />
                                    Products
                                </h1>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Browse all rice types and pack sizes.
                                </p>
                            </div>
                        </div>

                        <form
                            onSubmit={handleSubmitSearch}
                            className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-end sm:gap-4 sm:p-5"
                        >
                            <div className="flex-1">
                                <label className="mb-1.5 block text-sm font-medium text-foreground">
                                    Search rice
                                </label>
                                <div className="flex items-center gap-2 rounded-xl border border-input bg-background px-3 py-2.5 transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                                    <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                                    <input
                                        type="search"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Miniket, Chinigura, Basmati…"
                                        className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2 sm:shrink-0">
                                <Button type="submit" size="default" className="w-full sm:w-auto">
                                    Apply
                                </Button>
                                {(search || activeCategory) && (
                                    <Button
                                        type="button"
                                        size="default"
                                        variant="outline"
                                        className="w-full sm:w-auto"
                                        onClick={() => {
                                            setSearchTerm('');
                                            applyFilters(null, '');
                                        }}
                                    >
                                        Clear
                                    </Button>
                                )}
                            </div>
                        </form>

                        {categories.length > 0 && (
                            <div className="overflow-x-auto pb-1">
                                <div className="flex min-w-max items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleSelectCategory(null)}
                                        className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                                            !activeCategory
                                                ? 'border-primary bg-primary text-primary-foreground'
                                                : 'border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground'
                                        }`}
                                    >
                                        All rice
                                    </button>
                                    {categories.map((cat) => (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => handleSelectCategory(cat.slug)}
                                            className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                                                cat.slug === activeCategory
                                                    ? 'border-primary bg-primary text-primary-foreground'
                                                    : 'border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground'
                                            }`}
                                        >
                                            {cat.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {products.length === 0 ? (
                        <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-sm sm:p-16">
                            <Package className="mx-auto size-14 text-muted-foreground" aria-hidden />
                            <p className="mt-5 text-lg font-semibold text-foreground">No products yet</p>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Run the seeder to add demo categories and products.
                            </p>
                            <p className="mt-5 text-xs text-muted-foreground">
                                <code className="rounded-lg bg-muted px-2.5 py-1.5">php artisan db:seed</code>
                            </p>
                        </div>
                    ) : (
                        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                            {products.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    quantityInCart={getQuantity(product.id)}
                                    onAddToCart={addToCart}
                                    onSetQuantity={setQuantity}
                                    onOpenDrawer={openDrawer}
                                    onBuy={handleBuyNow}
                                />
                            ))}
                        </ul>
                    )}
                </main>
            </StoreLayout>
        </>
    );
}
