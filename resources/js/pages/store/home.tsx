import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowRight, Leaf, Package, ShoppingBag, UserPlus } from 'lucide-react';
import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/store/product-card';
import { useCart } from '@/contexts/cart-context';
import StoreLayout from '@/layouts/store-layout';
import { index as productsIndex } from '@/routes/products';
import { register } from '@/routes';
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
    price: string;
    image: string | null;
    category: { id: number; name: string; slug: string };
};

export default function StoreHome({
    canRegister = true,
    categories = [],
    featuredProducts = [],
}: {
    canRegister?: boolean;
    categories: Category[];
    featuredProducts: Product[];
}) {
    const { auth } = usePage<SharedData>().props;
    const { getQuantity, addToCart, setQuantity, openDrawer, setFromServer } = useCart();

    const handleBuyNow = useCallback(async (productId: number) => {
        const formData = new FormData();
        formData.append('product_id', String(productId));
        formData.append('_token', (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null)?.content ?? '');
        const res = await fetch('/cart/buy-now', {
            method: 'POST',
            body: formData,
            credentials: 'same-origin',
            headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        });
        const data = (await res.json()) as { cart?: { count: number; items: Record<string, { quantity: number }> }; redirect?: string };
        if (data.cart) setFromServer(data.cart.count, data.cart.items);
        if (data.redirect) router.visit(data.redirect);
    }, [setFromServer]);

    return (
        <>
            <Head title="E-Chal — Premium rice, one place. Miniket, Chinigura, Basmati & more.">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700"
                    rel="stylesheet"
                />
            </Head>
            <StoreLayout>
                <main>
                    {/* Hero — strong headline, clear hierarchy, CTA */}
                    <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-primary/8 via-primary/3 to-background px-4 py-14 sm:px-6 sm:py-20 md:py-24">
                        <div
                            className="pointer-events-none absolute inset-0 opacity-[0.03]"
                            aria-hidden
                        >
                            <div
                                className="absolute inset-0"
                                style={{
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                                }}
                            />
                        </div>
                        <div className="relative mx-auto max-w-3xl text-center">
                            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary sm:text-sm">
                                Rice only · Bangladesh
                            </p>
                            <h1 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl md:text-5xl md:leading-tight">
                                Premium chal. Miniket, Chinigura, Basmati — all here.
                            </h1>
                            <p className="mt-5 text-base text-muted-foreground sm:text-lg">
                                Pick your rice, add to cart, order in minutes. Fresh stock, clear prices.
                            </p>
                            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                                <Link href={productsIndex.url()}>
                                    <Button size="lg" className="min-w-[180px] gap-2 shadow-md">
                                        <ShoppingBag className="size-4" aria-hidden />
                                        See all rice
                                        <ArrowRight className="size-4" aria-hidden />
                                    </Button>
                                </Link>
                                {!auth?.user && canRegister && (
                                    <Link href={register()}>
                                        <Button
                                            size="lg"
                                            variant="outline"
                                            className="min-w-[160px] gap-2 border-2"
                                        >
                                            <UserPlus className="size-4" aria-hidden />
                                            Register
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Featured products */}
                    {featuredProducts.length > 0 && (
                        <section className="border-b border-border bg-muted/20 px-4 py-12 sm:px-6 sm:py-16">
                            <div className="mx-auto max-w-6xl">
                                <div className="text-center">
                                    <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                                        Popular rice
                                    </h2>
                                    <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                                        Bestsellers and everyday favourites.
                                    </p>
                                </div>
                                <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                                    {featuredProducts.map((product) => (
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
                                <div className="mt-10 text-center">
                                    <Link href={productsIndex.url()}>
                                        <Button size="lg" variant="outline" className="gap-2">
                                            See all rice
                                            <ArrowRight className="size-4" aria-hidden />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Categories */}
                    {categories.length > 0 && (
                        <section className="border-b border-border px-4 py-12 sm:px-6 sm:py-16">
                            <div className="mx-auto max-w-6xl">
                                <div className="text-center">
                                    <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                                        Shop by rice type
                                    </h2>
                                    <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                                        Miniket, Chinigura, Katari Bhog, Basmati and more.
                                    </p>
                                </div>
                                <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
                                    {categories.map((cat) => {
                                        const firstProduct = featuredProducts.find(
                                            (p) => p.category.id === cat.id
                                        );
                                        return (
                                            <li key={cat.id}>
                                                <Link
                                                    href={productsIndex.url()}
                                                    data={{ category: cat.slug }}
                                                    className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-200 hover:border-primary/40 hover:shadow-md"
                                                >
                                                    <div className="aspect-square w-full overflow-hidden bg-muted">
                                                        {firstProduct?.image ? (
                                                            <img
                                                                src={firstProduct.image}
                                                                alt=""
                                                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                            />
                                                        ) : (
                                                            <div className="flex h-full w-full items-center justify-center text-primary/50">
                                                                <Leaf className="size-14" aria-hidden />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="p-4 text-center">
                                                        <span className="font-semibold text-foreground transition-colors group-hover:text-primary">
                                                            {cat.name}
                                                        </span>
                                                    </div>
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                                <div className="mt-8 text-center">
                                    <Link href={productsIndex.url()}>
                                        <Button variant="outline" size="sm" className="gap-2">
                                            View all categories
                                            <ArrowRight className="size-3.5" aria-hidden />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Final CTA */}
                    <section className="px-4 py-14 sm:px-6 sm:py-20">
                        <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-card px-6 py-10 text-center shadow-sm sm:px-10 sm:py-14">
                            <h2 className="text-xl font-bold text-foreground sm:text-2xl">
                                One place for all your chal
                            </h2>
                            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
                                Miniket, Chinigura, Katari Bhog, Basmati, BR-28 — fresh stock, easy order, fast delivery.
                            </p>
                            <Link href={productsIndex.url()} className="mt-8 inline-block">
                                <Button size="lg" className="gap-2">
                                    Browse rice
                                    <ArrowRight className="size-4" aria-hidden />
                                </Button>
                            </Link>
                        </div>
                    </section>
                </main>
            </StoreLayout>
        </>
    );
}
