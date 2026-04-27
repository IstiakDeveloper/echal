import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowRight, ShoppingBag, UserPlus } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import {
    BrandLogoPlate,
    brandLogoImageClass,
} from '@/components/app-logo-icon';
import ProductCard from '@/components/store/product-card';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/cart-context';
import StoreLayout from '@/layouts/store-layout';
import { register } from '@/routes';
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
    price: string;
    image: string | null;
    stock: number;
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
    const { getQuantity, addToCart, setQuantity, setFromServer } = useCart();

    const sortedFeaturedProducts = useMemo(() => {
        return [...featuredProducts].sort((a, b) => {
            const aInStock = a.stock > 0;
            const bInStock = b.stock > 0;

            if (aInStock === bInStock) return 0;
            return aInStock ? -1 : 1;
        });
    }, [featuredProducts]);

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
                    {/* Hero — premium, impactful with fixed background */}
                    <section className="relative overflow-hidden border-b border-border">
                        {/* Fixed background image */}
                        <div
                            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                            style={{
                                backgroundImage: `url('/cover.jpg')`,
                                backgroundAttachment: 'fixed',
                            }}
                            aria-hidden
                        />
                        {/* Overlay for readability */}
                        <div
                            className="absolute inset-0 bg-background/85 backdrop-blur-[2px]"
                            aria-hidden
                        />
                        <div
                            className="absolute inset-0 bg-linear-to-b from-primary/8 via-transparent to-background/90"
                            aria-hidden
                        />

                        <div className="relative mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 md:py-20">
                            <div className="text-center">
                                <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase sm:text-sm">
                                    Rice only · Bangladesh
                                </p>
                                <h1 className="mt-5 text-3xl leading-[1.15] font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-6xl">
                                    Premium chal.
                                    <br />
                                    <span className="text-primary">
                                        Miniket, Chinigura, Basmati
                                    </span>
                                    <br />— all here.
                                </h1>
                                <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                                    Pick your rice, add to cart, order in
                                    minutes. Fresh stock, clear prices, delivery
                                    across Bangladesh.
                                </p>
                                <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                                    <Link href={productsIndex.url()}>
                                        <Button
                                            size="lg"
                                            className="gap-2 shadow-md transition-shadow hover:shadow-lg"
                                        >
                                            <ShoppingBag
                                                className="size-4"
                                                aria-hidden
                                            />
                                            See all rice
                                            <ArrowRight
                                                className="size-4"
                                                aria-hidden
                                            />
                                        </Button>
                                    </Link>
                                    {!auth?.user && canRegister && (
                                        <Link href={register()}>
                                            <Button
                                                size="lg"
                                                variant="outline"
                                                className="gap-2 border-2 bg-background/95 backdrop-blur-sm"
                                            >
                                                <UserPlus
                                                    className="size-4"
                                                    aria-hidden
                                                />
                                                Register
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Categories — right after hero */}
                    {categories.length > 0 && (
                        <section className="border-b border-border bg-background px-4 py-12 sm:px-6 sm:py-16">
                            <div className="mx-auto max-w-6xl">
                                <h2 className="text-center text-xl font-bold text-foreground sm:text-2xl">
                                    Shop by rice type
                                </h2>
                                <p className="mt-2 text-center text-sm text-muted-foreground">
                                    Miniket, Chinigura, Katari Bhog, Basmati and
                                    more.
                                </p>
                                <ul className="mt-8 flex flex-wrap items-center justify-center gap-3">
                                    {categories.map((cat) => {
                                        const firstProduct =
                                            sortedFeaturedProducts.find(
                                                (p) => p.category.id === cat.id,
                                            );
                                        return (
                                            <li key={cat.id}>
                                                <Link
                                                    href={productsIndex.url()}
                                                    data={{
                                                        category: cat.slug,
                                                    }}
                                                    className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary/50 hover:bg-primary/5"
                                                >
                                                    {firstProduct?.image ? (
                                                        <img
                                                            src={
                                                                firstProduct.image
                                                            }
                                                            alt=""
                                                            className="size-6 rounded object-cover"
                                                        />
                                                    ) : (
                                                        <BrandLogoPlate
                                                            rounded="lg"
                                                            className="size-7"
                                                        >
                                                            <img
                                                                src="/logo.png"
                                                                alt=""
                                                                className={
                                                                    brandLogoImageClass
                                                                }
                                                            />
                                                        </BrandLogoPlate>
                                                    )}
                                                    <span>{cat.name}</span>
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                                <p className="mt-6 text-center">
                                    <Link href={productsIndex.url()}>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="gap-2"
                                        >
                                            View all categories
                                            <ArrowRight
                                                className="size-3.5"
                                                aria-hidden
                                            />
                                        </Button>
                                    </Link>
                                </p>
                            </div>
                        </section>
                    )}

                    {/* Featured products */}
                    {featuredProducts.length > 0 && (
                        <section className="border-b border-border bg-muted/20 px-4 py-12 sm:px-6 sm:py-16">
                            <div className="mx-auto max-w-6xl">
                                <h2 className="text-center text-xl font-bold text-foreground sm:text-2xl">
                                    Popular rice
                                </h2>
                                <p className="mt-2 text-center text-sm text-muted-foreground">
                                    Bestsellers and everyday favourites.
                                </p>
                                <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                                    {sortedFeaturedProducts.map((product) => (
                                        <ProductCard
                                            key={product.id}
                                            product={product}
                                            quantityInCart={getQuantity(
                                                product.id,
                                            )}
                                            onAddToCart={addToCart}
                                            onSetQuantity={setQuantity}
                                            onBuy={handleBuyNow}
                                        />
                                    ))}
                                </ul>
                                <p className="mt-8 text-center">
                                    <Link href={productsIndex.url()}>
                                        <Button
                                            variant="outline"
                                            size="lg"
                                            className="gap-2"
                                        >
                                            See all rice
                                            <ArrowRight
                                                className="size-4"
                                                aria-hidden
                                            />
                                        </Button>
                                    </Link>
                                </p>
                            </div>
                        </section>
                    )}

                    {/* CTA */}
                    <section className="px-4 py-12 sm:px-6 sm:py-16">
                        <div className="mx-auto max-w-xl text-center">
                            <h2 className="text-lg font-bold text-foreground sm:text-xl">
                                One place for all your chal
                            </h2>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Miniket, Chinigura, Katari Bhog, Basmati, BR-28
                                — fresh stock, easy order, fast delivery.
                            </p>
                            <Link
                                href={productsIndex.url()}
                                className="mt-6 inline-block"
                            >
                                <Button size="lg" className="gap-2">
                                    Browse rice
                                    <ArrowRight
                                        className="size-4"
                                        aria-hidden
                                    />
                                </Button>
                            </Link>
                        </div>
                    </section>
                </main>
            </StoreLayout>
        </>
    );
}
