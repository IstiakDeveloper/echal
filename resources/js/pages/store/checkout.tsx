import { Head, useForm, usePage } from '@inertiajs/react';
import { MapPin, Smartphone, Package } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Switch } from '@/components/ui/switch';
import StoreLayout from '@/layouts/store-layout';
import type { SharedData } from '@/types';

type CartItem = {
    id: number;
    name: string;
    slug: string;
    price: string;
    image: string | null;
    quantity: number;
    line_total: number;
    category: {
        id: number | null;
        name: string | null;
        slug: string | null;
    };
};

type LocationNode = {
    name: string;
    districts: {
        name: string;
        upazilas: { name: string }[];
    }[];
};

type SavedAddress = {
    division: string;
    district: string;
    upazila: string;
    address: string;
    phone: string;
} | null;

export default function StoreCheckout({
    items = [],
    subtotal = 0,
    locations = [],
    savedAddress = null,
}: {
    items: CartItem[];
    subtotal: number;
    locations: LocationNode[];
    savedAddress?: SavedAddress;
}) {
    const page = usePage<SharedData & { errors?: Record<string, string> }>();
    const errors = page.props.errors ?? {};
    const user = page.props.auth?.user;

    const [useSavedAddress, setUseSavedAddress] = useState(false);

    const form = useForm({
        division: '',
        district: '',
        upazila: '',
        address: '',
        phone: '',
    });

    const selectedDivision = locations.find((d) => d.name === form.data.division) ?? null;
    const districts = selectedDivision?.districts ?? [];
    const selectedDistrict = districts.find((d) => d.name === form.data.district) ?? null;
    const upazilas = selectedDistrict?.upazilas ?? [];

    // Auto-populate saved address when switch is turned ON
    useEffect(() => {
        if (useSavedAddress && savedAddress) {
            form.setData({
                division: savedAddress.division,
                district: savedAddress.district,
                upazila: savedAddress.upazila,
                address: savedAddress.address,
                phone: savedAddress.phone,
            });
        } else if (!useSavedAddress) {
            // Clear form when switch is turned OFF
            form.setData({
                division: '',
                district: '',
                upazila: '',
                address: '',
                phone: '',
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [useSavedAddress]);

    // Auto-detect location (optional) - only if user is not logged in and no saved address
    useEffect(() => {
        if (!user && !savedAddress && !form.data.division && !form.data.district && typeof window !== 'undefined') {
            if (!navigator.geolocation) return;

            navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&accept-language=en`;

                fetch(url, {
                    headers: {
                        'User-Agent': 'e-chal-bd-checkout',
                    },
                })
                    .then((res) => res.json())
                    .then((data) => {
                        const address = data?.address as
                            | {
                                  state?: string;
                                  city?: string;
                                  town?: string;
                                  county?: string;
                                  district?: string;
                                  state_district?: string;
                              }
                            | undefined;
                        if (!address) return;

                        const possibleDivision = address.state ?? '';
                        const divisionMatch =
                            locations.find(
                                (d) => d.name.toLowerCase() === possibleDivision.toLowerCase()
                            ) ?? null;

                        const districtCandidates = [
                            address.district,
                            address.city,
                            address.town,
                            address.county,
                            address.state_district,
                        ].filter((v): v is string => !!v);

                        let foundDivision = divisionMatch;
                        let foundDistrict: string | null = null;

                        if (!foundDivision) {
                            outer: for (const d of locations) {
                                for (const dist of d.districts) {
                                    if (
                                        districtCandidates.some(
                                            (candidate) =>
                                                candidate.toLowerCase() === dist.name.toLowerCase()
                                        )
                                    ) {
                                        foundDivision = d;
                                        foundDistrict = dist.name;
                                        break outer;
                                    }
                                }
                            }
                        } else {
                            for (const dist of foundDivision.districts) {
                                if (
                                    districtCandidates.some(
                                        (candidate) =>
                                            candidate.toLowerCase() === dist.name.toLowerCase()
                                    )
                                ) {
                                    foundDistrict = dist.name;
                                    break;
                                }
                            }
                        }

                        if (foundDivision) {
                            form.setData({
                                ...form.data,
                                division: foundDivision.name,
                                district: foundDistrict ?? '',
                                upazila: '',
                            });
                        }
                    })
                    .catch(() => {
                        // ignore
                    });
            },
            () => {
                // ignore
            },
            { enableHighAccuracy: true, timeout: 10000 }
            );
        }
    }, [form, locations, user, savedAddress]);

    const deliveryAmount = 0;
    const total = subtotal + deliveryAmount;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/checkout');
    };

    const formatCurrency = (value: number | string) => `৳${Number(value).toLocaleString()}`;

    return (
        <>
            <Head title="Checkout — E-Chal" />
            <StoreLayout>
                <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Checkout</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Complete your order by providing delivery details
                        </p>
                    </div>

                    <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-8">
                        <section className="min-w-0 flex-1 space-y-6">
                            <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
                                <div className="mb-5 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="size-4 text-primary" aria-hidden />
                                        <h2 className="text-lg font-semibold text-foreground">Delivery location</h2>
                                    </div>
                                    {user && savedAddress && (
                                        <div className="flex items-center gap-2.5">
                                            <label
                                                htmlFor="use-saved-address"
                                                className="text-sm font-medium text-foreground cursor-pointer"
                                            >
                                                Use saved address
                                            </label>
                                            <Switch
                                                id="use-saved-address"
                                                checked={useSavedAddress}
                                                onCheckedChange={setUseSavedAddress}
                                            />
                                        </div>
                                    )}
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    {/* Step 1: Division */}
                                    <SearchableSelect
                                        label="Select Division"
                                        stepNumber={1}
                                        options={locations.map((d) => ({ value: d.name, label: d.name }))}
                                        value={form.data.division}
                                        onChange={(val) =>
                                            form.setData({
                                                ...form.data,
                                                division: val,
                                                district: '',
                                                upazila: '',
                                            })
                                        }
                                        placeholder="Choose your division..."
                                        searchPlaceholder="Search division..."
                                        error={errors.division}
                                        disabled={useSavedAddress && !!savedAddress}
                                    />

                                    {/* Step 2: District - Only show when division selected */}
                                    {selectedDivision && (
                                        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                                            <SearchableSelect
                                                label="Select District"
                                                stepNumber={2}
                                                breadcrumb={selectedDivision.name}
                                                options={districts.map((d) => ({ value: d.name, label: d.name }))}
                                                value={form.data.district}
                                                onChange={(val) =>
                                                    form.setData({
                                                        ...form.data,
                                                        district: val,
                                                        upazila: '',
                                                    })
                                                }
                                                placeholder="Choose your district..."
                                                searchPlaceholder="Search district..."
                                                error={errors.district}
                                                disabled={useSavedAddress && !!savedAddress}
                                            />
                                        </div>
                                    )}

                                    {/* Step 3: Upazila - Only show when district selected */}
                                    {selectedDistrict && (
                                        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                                            <SearchableSelect
                                                label="Select Upazila / Thana"
                                                stepNumber={3}
                                                breadcrumb={selectedDistrict.name}
                                                options={upazilas.map((u) => ({ value: u.name, label: u.name }))}
                                                value={form.data.upazila}
                                                onChange={(val) => form.setData('upazila', val)}
                                                placeholder="Choose your upazila..."
                                                searchPlaceholder="Search upazila..."
                                                error={errors.upazila}
                                                disabled={useSavedAddress && !!savedAddress}
                                            />
                                        </div>
                                    )}

                                    {/* Full Address */}
                                    <div className="space-y-2">
                                        <label
                                            htmlFor="address"
                                            className="flex items-center gap-2 text-sm font-medium text-foreground"
                                        >
                                            <MapPin className="size-4 text-muted-foreground" />
                                            Full Address
                                        </label>
                                        <textarea
                                            id="address"
                                            rows={3}
                                            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                            value={form.data.address}
                                            onChange={(e) => form.setData('address', e.target.value)}
                                            placeholder="House number, road, village / area, landmark..."
                                            disabled={useSavedAddress && !!savedAddress}
                                        />
                                        {errors.address && (
                                            <p className="text-xs text-destructive">{errors.address}</p>
                                        )}
                                    </div>

                                    {/* Phone Number */}
                                    <div className="space-y-2">
                                        <label
                                            htmlFor="phone"
                                            className="flex items-center gap-2 text-sm font-medium text-foreground"
                                        >
                                            <Smartphone className="size-4 text-muted-foreground" />
                                            Phone Number
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                                +88
                                            </span>
                                            <input
                                                id="phone"
                                                type="tel"
                                                inputMode="numeric"
                                                className="h-11 w-full rounded-lg border border-input bg-background pl-12 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                                value={form.data.phone}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/\D/g, '');
                                                    if (val.length <= 11) form.setData('phone', val);
                                                }}
                                                placeholder="01XXXXXXXXX"
                                                maxLength={11}
                                                disabled={useSavedAddress && !!savedAddress}
                                            />
                                        </div>
                                        {errors.phone && (
                                            <p className="text-xs text-destructive">{errors.phone}</p>
                                        )}
                                        <p className="text-xs text-muted-foreground">
                                            {user
                                                ? 'This number will be used for order updates and OTP login.'
                                                : "We'll create an account for this number and use it for order updates and future OTP login."}
                                        </p>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="pt-2">
                                        <Button
                                            type="submit"
                                            size="lg"
                                            className="w-full text-base"
                                            disabled={form.processing}
                                        >
                                            {form.processing ? 'Placing order...' : 'Place Order'}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </section>

                        <aside className="w-full lg:sticky lg:top-20 lg:w-[20rem] lg:shrink-0">
                            <div className="rounded-xl border border-border bg-card p-5 sm:p-6 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
                                <h2 className="mb-5 flex items-center gap-2 text-lg font-semibold text-foreground">
                                    <Package className="size-4 text-primary" aria-hidden />
                                    Order summary
                                </h2>
                                <div className="mb-5 space-y-3 border-b border-border pb-5">
                                    {items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-start gap-3 rounded-lg bg-muted/40 p-3"
                                        >
                                            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
                                                {item.image ? (
                                                    <img
                                                        src={item.image}
                                                        alt=""
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                                                        {item.name.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium text-foreground">{item.name}</p>
                                                <p className="mt-0.5 text-xs text-muted-foreground">
                                                    {item.category.name}
                                                </p>
                                                <div className="mt-1.5 flex items-center justify-between">
                                                    <span className="text-xs text-muted-foreground">
                                                        Qty: {item.quantity}
                                                    </span>
                                                    <span className="text-sm font-semibold text-foreground">
                                                        {formatCurrency(item.line_total)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Price Breakdown */}
                                <div className="space-y-2.5 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Items total</span>
                                        <span className="font-medium text-foreground">
                                            {formatCurrency(subtotal)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Delivery charge</span>
                                        <span className="font-medium text-foreground">
                                            {formatCurrency(deliveryAmount)}
                                        </span>
                                    </div>
                                    <div className="border-t border-border pt-2.5">
                                        <div className="flex items-center justify-between">
                                            <span className="text-base font-semibold text-foreground">Total</span>
                                            <span className="text-lg font-bold text-foreground">
                                                {formatCurrency(total)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-5 rounded-lg border border-primary/15 bg-primary/5 p-3 text-xs text-muted-foreground">
                                    <p>
                                        After placing your order, you&apos;ll receive a confirmation SMS. You can track
                                        your order from your account dashboard.
                                    </p>
                                </div>
                            </div>
                        </aside>
                    </div>
                </main>
            </StoreLayout>
        </>
    );
}
