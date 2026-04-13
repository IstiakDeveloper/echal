import { Head, Link, useForm } from '@inertiajs/react';
import { Home, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { home } from '@/routes';

export default function AdminLogin() {
    const form = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/admin/login');
    };

    return (
        <>
            <Head title="Admin Login — E-Chal" />
            <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
                <div className="w-full max-w-md">
                    <Link
                        href={home()}
                        className="mb-6 flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <Home className="size-4" aria-hidden />
                        Back to home
                    </Link>
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-bold">Admin Login</h1>
                        <p className="mt-2 text-muted-foreground">Sign in to access the admin panel</p>
                    </div>

                    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="email" className="mb-1 block text-sm font-medium">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    value={form.data.email}
                                    onChange={(e) => form.setData('email', e.target.value)}
                                    required
                                    autoFocus
                                />
                                {form.errors.email && (
                                    <p className="mt-1 text-xs text-destructive">{form.errors.email}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="password" className="mb-1 block text-sm font-medium">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    value={form.data.password}
                                    onChange={(e) => form.setData('password', e.target.value)}
                                    required
                                />
                                {form.errors.password && (
                                    <p className="mt-1 text-xs text-destructive">{form.errors.password}</p>
                                )}
                            </div>

                            <div className="flex items-center">
                                <input
                                    id="remember"
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-input text-primary focus:ring-2 focus:ring-primary/20"
                                    checked={form.data.remember}
                                    onChange={(e) => form.setData('remember', e.target.checked)}
                                />
                                <label htmlFor="remember" className="ml-2 text-sm text-muted-foreground">
                                    Remember me
                                </label>
                            </div>

                            <Button type="submit" className="w-full" disabled={form.processing}>
                                <LogIn className="mr-2 size-4" />
                                {form.processing ? 'Signing in...' : 'Sign in'}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
