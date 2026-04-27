import { Head, router } from '@inertiajs/react';
import { Package, Search } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import ProductCard from '@/components/store/product-card';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/cart-context';
import StoreLayout from '@/layouts/store-layout';
import { index as productsIndex } from '@/routes/products';

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
    const { getQuantity, addToCart, setQuantity, setFromServer } = useCart();
    const [searchTerm, setSearchTerm] = useState(search ?? '');

    const sortedProducts = useMemo(() => {
        return [...products].sort((a, b) => {
            const aInStock = a.stock > 0;
            const bInStock = b.stock > 0;

            if (aInStock === bInStock) return 0;
            return aInStock ? -1 : 1;
        });
    }, [products]);

    const handleBuyNow = useCallback(
        async (productId: number) => {
            const formData = new FormData();
            formData.append('product_id', String(productId));
            formData.append(
                '_token',
                (
                    document.querySelector(
                        'meta[name="csrf-token"]',
                    ) as HTMLMetaElement | null
                )?.content ?? '',
            );
            const res = await fetch('/cart/buy-now', {
                method: 'POST',
                body: formData,
                credentials: 'same-origin',
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });
            const data = (await res.json()) as {
                cart?: {
                    count: number;
                    items: Record<string, { quantity: number }>;
                };
                redirect?: string;
            };
            if (data.cart) setFromServer(data.cart.count, data.cart.items);
            if (data.redirect) router.visit(data.redirect);
        },
        [setFromServer],
    );

    const applyFilters = useCallback(
        (categorySlug: string | null, term: string) => {
            router.get(
                productsIndex.url(),
                {
                    category: categorySlug || undefined,
                    search: term || undefined,
                },
                { preserveScroll: true, preserveState: true },
            );
        },
        [],
    );

    const handleSubmitSearch = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            applyFilters(activeCategory || null, searchTerm.trim());
        },
        [activeCategory, searchTerm, applyFilters],
    );

    const handleSelectCategory = useCallback(
        (slug: string | null) => {
            applyFilters(slug, searchTerm.trim());
        },
        [applyFilters, searchTerm],
    );

    return (
        <>
            <Head title="Products — E-Chal" />
            <StoreLayout>
                <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                            Products
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Browse all rice types and pack sizes.
                        </p>
                    </div>

                    <form
                        onSubmit={handleSubmitSearch}
                        className="mb-6 rounded-xl border border-border bg-card p-4 sm:flex sm:items-end sm:gap-4"
                    >
                        <div className="flex-1">
                            <label htmlFor="search" className="sr-only">
                                Search rice
                            </label>
                            <div className="flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                                <Search
                                    className="size-4 text-muted-foreground"
                                    aria-hidden
                                />
                                <input
                                    id="search"
                                    type="search"
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    placeholder="Miniket, Chinigura, Basmati…"
                                    className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                                />
                            </div>
                        </div>
                        <div className="mt-3 flex gap-2 sm:mt-0">
                            <Button type="submit" size="default">
                                Search
                            </Button>
                            {(search || activeCategory) && (
                                <Button
                                    type="button"
                                    variant="outline"
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
                        <div className="mb-6 overflow-x-auto">
                            <div className="flex min-w-max gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleSelectCategory(null)}
                                    className={
                                        !activeCategory
                                            ? 'rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground'
                                            : 'rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground hover:border-primary/40 hover:text-foreground'
                                    }
                                >
                                    All rice
                                </button>
                                {categories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() =>
                                            handleSelectCategory(cat.slug)
                                        }
                                        className={
                                            cat.slug === activeCategory
                                                ? 'rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground'
                                                : 'rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground hover:border-primary/40 hover:text-foreground'
                                        }
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {products.length === 0 ? (
                        <div className="rounded-xl border border-border bg-card p-12 text-center">
                            <Package
                                className="mx-auto size-12 text-muted-foreground"
                                aria-hidden
                            />
                            <p className="mt-4 font-semibold text-foreground">
                                No products yet
                            </p>
                        </div>
                    ) : (
                        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {sortedProducts.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    quantityInCart={getQuantity(product.id)}
                                    onAddToCart={addToCart}
                                    onSetQuantity={setQuantity}
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
