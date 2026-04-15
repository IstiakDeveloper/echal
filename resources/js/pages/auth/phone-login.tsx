import { Head, router, usePage } from '@inertiajs/react';
import { Leaf, Smartphone } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { SharedData } from '@/types';

export default function PhoneLogin() {
    const { auth } = usePage<SharedData>().props;
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState<'phone' | 'otp'>('phone');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const getCsrfToken = () => {
        const meta = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null;
        return meta?.content ?? '';
    };

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!/^01[3-9]\d{8}$/.test(phone)) {
            setError('Please enter a valid Bangladesh mobile number (01XXXXXXXXX)');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/auth/phone/send-otp', {
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

            const data = (await res.json()) as { success: boolean; message?: string; error?: string };

            if (data.success) {
                setMessage(data.message ?? 'OTP sent successfully');
                setStep('otp');
            } else {
                const errorMsg = data.error ?? data.message ?? 'Failed to send OTP';
                setError(errorMsg);
                console.error('OTP send error:', errorMsg);
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!/^\d{6}$/.test(otp)) {
            setError('Please enter a valid 6-digit OTP');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/auth/phone/verify-otp', {
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
                    otp,
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
                setError(data.message ?? 'Invalid OTP. Please try again.');
            }
        } catch (err) {
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
                        <div className="mx-auto inline-flex size-12 items-center justify-center rounded-full bg-primary/10">
                            <Leaf className="size-6 text-primary" aria-hidden />
                        </div>
                        <h1 className="mt-4 text-2xl font-semibold text-foreground">E-Chal</h1>
                        <p className="mt-2 text-sm text-muted-foreground">
                            {step === 'phone'
                                ? 'Enter your phone number to login or register'
                                : 'Enter the OTP sent to your phone'}
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

                    {step === 'phone' ? (
                        <form onSubmit={handleSendOTP} className="space-y-4">
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
                                    We&apos;ll send a 6-digit OTP to +88{phone || '01XXXXXXXXX'}
                                </p>
                            </div>

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? 'Sending OTP...' : 'Send OTP'}
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOTP} className="space-y-4">
                            <div>
                                <label htmlFor="otp" className="mb-1 block text-sm font-medium text-foreground">
                                    Enter OTP
                                </label>
                                <input
                                    id="otp"
                                    type="text"
                                    inputMode="numeric"
                                    className="w-full rounded-lg border border-input bg-background py-2 px-4 text-center text-2xl font-mono tracking-widest outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="000000"
                                    value={otp}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                                        setOtp(val);
                                    }}
                                    required
                                    pattern="\d{6}"
                                    maxLength={6}
                                    autoFocus
                                />
                                <p className="mt-2 text-xs text-muted-foreground">
                                    OTP sent to <span className="font-mono font-medium">{phone}</span>
                                </p>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => {
                                        setStep('phone');
                                        setOtp('');
                                        setError('');
                                        setMessage('');
                                    }}
                                    disabled={loading}
                                >
                                    Change number
                                </Button>
                                <Button type="submit" className="flex-1" disabled={loading || otp.length !== 6}>
                                    {loading ? 'Verifying...' : 'Verify & Login'}
                                </Button>
                            </div>
                        </form>
                    )}

                    <div className="pt-4 text-center text-xs text-muted-foreground">
                        <p>
                            By continuing, you agree to our terms. New users will be automatically registered.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
