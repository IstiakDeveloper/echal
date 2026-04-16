import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, User, Smartphone, Mail, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CustomerLayout from '@/layouts/customer-layout';
import { home as homeRoute } from '@/routes';
import { dashboard } from '@/routes';

type ProfileProps = {
    user: {
        id: number;
        name: string;
        phone: string | null;
        email: string;
        phone_verified_at: string | null;
    };
};

export default function Profile({ user }: ProfileProps) {
    const form = useForm({
        name: user.name,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.put('/profile');
    };

    return (
        <>
            <Head title="My Profile — E-Chal" />
            <CustomerLayout>
                <div className="mx-auto max-w-2xl px-4 py-6 pb-20 sm:px-6 sm:py-8 sm:pb-8">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="mb-4 flex items-center gap-3">
                            <Link
                                href={dashboard.url()}
                                className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                            >
                                <ArrowLeft className="size-4" aria-hidden />
                                Back to orders
                            </Link>
                        </div>
                        <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
                            My Profile
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Manage your account information
                        </p>
                    </div>

                    {/* Profile Card */}
                    <div className="space-y-6 rounded-xl border border-border bg-card p-6 shadow-sm">
                        {/* Account Info */}
                        <div>
                            <h2 className="mb-4 text-lg font-semibold text-foreground">
                                Account Information
                            </h2>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="rounded-lg bg-primary/10 p-2">
                                        <User className="size-5 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-xs font-medium text-muted-foreground">
                                            Name
                                        </label>
                                        <p className="mt-1 text-sm font-medium text-foreground">
                                            {user.name}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="rounded-lg bg-emerald-500/10 p-2">
                                        <Smartphone className="size-5 text-emerald-600" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <label className="text-xs font-medium text-muted-foreground">
                                                Phone
                                            </label>
                                            {user.phone_verified_at && (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                                                    <CheckCircle2 className="size-3" />
                                                    Verified
                                                </span>
                                            )}
                                        </div>
                                        <p className="mt-1 text-sm font-medium text-foreground">
                                            {user.phone
                                                ? `+88${user.phone}`
                                                : 'Not set'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="rounded-lg bg-blue-500/10 p-2">
                                        <Mail className="size-5 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-xs font-medium text-muted-foreground">
                                            Email
                                        </label>
                                        <p className="mt-1 text-sm font-medium text-foreground">
                                            {user.email}
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Auto-generated for account
                                            management
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Update Name Form */}
                        <div className="border-t border-border pt-6">
                            <h2 className="mb-4 text-lg font-semibold text-foreground">
                                Update Name
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label
                                        htmlFor="name"
                                        className="mb-1 block text-sm font-medium text-foreground"
                                    >
                                        Full Name
                                    </label>
                                    <input
                                        id="name"
                                        type="text"
                                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                                        value={form.data.name}
                                        onChange={(e) =>
                                            form.setData('name', e.target.value)
                                        }
                                        required
                                    />
                                    {form.errors.name && (
                                        <p className="mt-1 text-xs text-destructive">
                                            {form.errors.name}
                                        </p>
                                    )}
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        type="submit"
                                        disabled={form.processing}
                                    >
                                        {form.processing
                                            ? 'Saving...'
                                            : 'Save Changes'}
                                    </Button>
                                    <Link href={dashboard.url()}>
                                        <Button type="button" variant="outline">
                                            Cancel
                                        </Button>
                                    </Link>
                                </div>
                            </form>
                        </div>

                        {/* Quick Actions */}
                        <div className="border-t border-border pt-6">
                            <h2 className="mb-4 text-lg font-semibold text-foreground">
                                Quick Actions
                            </h2>
                            <div className="flex flex-col gap-2 sm:flex-row">
                                <Link href={homeRoute.url()} className="flex-1">
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                    >
                                        Continue Shopping
                                    </Button>
                                </Link>
                                <Link href={dashboard.url()} className="flex-1">
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                    >
                                        View Orders
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </CustomerLayout>
        </>
    );
}
