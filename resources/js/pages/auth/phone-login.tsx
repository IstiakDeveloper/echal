import { Head, router, usePage } from '@inertiajs/react';
import { Smartphone } from 'lucide-react';
import { useState } from 'react';
import { BrandLogoPlate, brandLogoImageClass } from '@/components/app-logo-icon';
import { Button } from '@/components/ui/button';
import type { SharedData } from '@/types';

export default function PhoneLogin() {
    const { auth } = usePage<SharedData>().props;
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const getCsrfToken = () => {
        const meta = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null;
        return meta?.content ?? '';
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!/^01[3-9]\d{8}$/.test(phone)) {
            setError('Please enter a valid Bangladesh mobile number (01XXXXXXXXX)');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/auth/phone/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    phone,
                    _token: getCsrfToken(),
                }),
            });

            const data = (await res.json()) as {
                success: boolean;
                message?: string;
                redirect?: string;
            };

            if (data.success) {
                setMessage('Login successful! Redirecting...');
                router.visit(data.redirect ?? '/dashboard', {
                    onFinish: () => {
                        window.location.reload();
                    },
                });
            } else {
                setError(data.message ?? 'Could not log in. Please try again.');
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (auth?.user) {
        router.visit('/dashboard');
        return null;
    }

    return (
        <>
            <Head title="Login / Register — E-Chal" />
            <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
                <div className="w-full max-w-md space-y-8 rounded-xl border border-border bg-card p-8 shadow-sm">
                    <div className="text-center">
                        <BrandLogoPlate rounded="full" className="mx-auto size-16">
                            <img src="/logo.png" alt="" className={brandLogoImageClass} />
                        </BrandLogoPlate>
                        <h1 className="mt-4 text-2xl font-semibold text-foreground">E-Chal</h1>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Enter your phone number to login or register
                        </p>
                    </div>

                    {error && (
                        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                            {error}
                        </div>
                    )}

                    {message && (
                        <div className="rounded-lg border border-emerald-500/50 bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label htmlFor="phone" className="mb-1 block text-sm font-medium text-foreground">
                                Phone number
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                    +88
                                </span>
                                <Smartphone className="absolute left-12 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    id="phone"
                                    type="tel"
                                    inputMode="numeric"
                                    className="w-full rounded-lg border border-input bg-background py-2 pl-16 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="01XXXXXXXXX"
                                    value={phone}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '');
                                        if (val.length <= 11) setPhone(val);
                                    }}
                                    required
                                    pattern="01[3-9]\d{8}"
                                    maxLength={11}
                                />
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                We&apos;ll log you in as +88{phone || '01XXXXXXXXX'}
                            </p>
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Signing in...' : 'Continue'}
                        </Button>
                    </form>

                    <div className="pt-4 text-center text-xs text-muted-foreground">
                        <p>New users are registered automatically. No password or OTP required.</p>
                    </div>
                </div>
            </div>
        </>
    );
}
