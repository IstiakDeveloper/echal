import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/layouts/admin-layout';

type StorefrontSettings = {
    top_offer: string | null;
    support_email: string | null;
    support_phone: string | null;
    whatsapp_phone: string | null;
    whatsapp_prefill: string | null;
    facebook_page_url: string | null;
};

type Props = {
    settings: StorefrontSettings;
};

export default function StorefrontSettingsPage({ settings }: Props) {
    const form = useForm<StorefrontSettings>({
        top_offer: settings.top_offer ?? '',
        support_email: settings.support_email ?? '',
        support_phone: settings.support_phone ?? '',
        whatsapp_phone: settings.whatsapp_phone ?? '',
        whatsapp_prefill: settings.whatsapp_prefill ?? '',
        facebook_page_url: settings.facebook_page_url ?? '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.put('/admin/settings/storefront');
    };

    return (
        <>
            <Head title="Storefront Settings — Admin" />
            <AdminLayout>
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Link href="/admin">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="mr-2 size-4" />
                                Back
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold">
                                Storefront Settings
                            </h1>
                            <p className="mt-1 text-muted-foreground">
                                Offer banner & contact info used across the
                                store.
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Link href="/admin/settings/storefront/popups">
                            <Button variant="outline" size="sm">
                                Manage popups
                            </Button>
                        </Link>
                    </div>

                    <form
                        onSubmit={submit}
                        className="max-w-2xl space-y-4 rounded-lg border border-border bg-card p-6 shadow-sm"
                    >
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Top Offer Text
                            </label>
                            <input
                                type="text"
                                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                value={form.data.top_offer ?? ''}
                                onChange={(e) =>
                                    form.setData('top_offer', e.target.value)
                                }
                                placeholder="Free delivery on orders over ৳2,000 · Fresh stock · Bangladesh-wide"
                            />
                            {form.errors.top_offer && (
                                <p className="mt-1 text-xs text-destructive">
                                    {form.errors.top_offer}
                                </p>
                            )}
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    Support Email
                                </label>
                                <input
                                    type="email"
                                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    value={form.data.support_email ?? ''}
                                    onChange={(e) =>
                                        form.setData(
                                            'support_email',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="help@echal.bd"
                                />
                                {form.errors.support_email && (
                                    <p className="mt-1 text-xs text-destructive">
                                        {form.errors.support_email}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    Support Phone (display)
                                </label>
                                <input
                                    type="text"
                                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    value={form.data.support_phone ?? ''}
                                    onChange={(e) =>
                                        form.setData(
                                            'support_phone',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="+8801717893432"
                                />
                                {form.errors.support_phone && (
                                    <p className="mt-1 text-xs text-destructive">
                                        {form.errors.support_phone}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    WhatsApp Phone (digits)
                                </label>
                                <input
                                    type="text"
                                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    value={form.data.whatsapp_phone ?? ''}
                                    onChange={(e) =>
                                        form.setData(
                                            'whatsapp_phone',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="8801717893432"
                                />
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Used for WhatsApp link: wa.me/&lt;number&gt;
                                </p>
                                {form.errors.whatsapp_phone && (
                                    <p className="mt-1 text-xs text-destructive">
                                        {form.errors.whatsapp_phone}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    WhatsApp Prefill Message
                                </label>
                                <input
                                    type="text"
                                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    value={form.data.whatsapp_prefill ?? ''}
                                    onChange={(e) =>
                                        form.setData(
                                            'whatsapp_prefill',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Hi! I need help with my order."
                                />
                                {form.errors.whatsapp_prefill && (
                                    <p className="mt-1 text-xs text-destructive">
                                        {form.errors.whatsapp_prefill}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Facebook Page URL
                            </label>
                            <input
                                type="url"
                                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                value={form.data.facebook_page_url ?? ''}
                                onChange={(e) =>
                                    form.setData(
                                        'facebook_page_url',
                                        e.target.value,
                                    )
                                }
                                placeholder="https://www.facebook.com/yourpage"
                            />
                            {form.errors.facebook_page_url && (
                                <p className="mt-1 text-xs text-destructive">
                                    {form.errors.facebook_page_url}
                                </p>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <Button type="submit" disabled={form.processing}>
                                {form.processing ? 'Saving…' : 'Save settings'}
                            </Button>
                            <Link href="/admin">
                                <Button type="button" variant="outline">
                                    Cancel
                                </Button>
                            </Link>
                        </div>
                    </form>
                </div>
            </AdminLayout>
        </>
    );
}
