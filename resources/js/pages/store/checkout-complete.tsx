import { Head, Link, usePage } from '@inertiajs/react';
import StoreLayout from '@/layouts/store-layout';
import { Button } from '@/components/ui/button';
import type { SharedData } from '@/types';

export default function StoreCheckoutComplete({
    orderId,
    phone,
}: {
    orderId?: number | null;
    phone?: string | null;
}) {
    const { name } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Order placed — E-Chal" />
            <StoreLayout>
                <main className="mx-auto flex max-w-2xl flex-1 flex-col items-center px-4 py-10 text-center sm:py-14">
                    <div className="inline-flex size-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50">
                        <span className="text-3xl">✓</span>
                    </div>
                    <h1 className="mt-6 text-2xl font-semibold text-foreground sm:text-3xl">
                        Order placed successfully
                    </h1>
                    <p className="mt-3 text-sm text-muted-foreground sm:text-base">
                        Thank you for ordering with {name}. We&apos;ll call or SMS you soon to
                        confirm your delivery.
                    </p>
                    {orderId && (
                        <p className="mt-2 text-xs text-muted-foreground">
                            Order ID: <span className="font-mono font-medium">#{orderId}</span>
                        </p>
                    )}
                    {phone && (
                        <p className="mt-2 text-xs text-muted-foreground">
                            We created an account for{' '}
                            <span className="font-mono font-medium">{phone}</span>. In future
                            you&apos;ll log in with OTP on this number.
                        </p>
                    )}

                    <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
                        <Link href="/products" className="w-full sm:w-auto">
                            <Button className="w-full">Browse more rice</Button>
                        </Link>
                        <Link href="/" className="w-full sm:w-auto">
                            <Button variant="outline" className="w-full">
                                Back to home
                            </Button>
                        </Link>
                    </div>
                </main>
            </StoreLayout>
        </>
    );
}

