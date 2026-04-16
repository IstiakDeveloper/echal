import { Head, router } from '@inertiajs/react';
import { useEffect } from 'react';

export default function Register() {
    useEffect(() => {
        router.visit('/login', { replace: true });
    }, []);

    return (
        <>
            <Head title="Register" />
            <div className="flex min-h-screen items-center justify-center bg-background px-4">
                <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
                    Redirecting to phone login…
                </div>
            </div>
        </>
    );
}
