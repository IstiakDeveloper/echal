import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import InputError from '@/components/input-error';

const TRANSACTION_TYPES = [
    { value: 'opening_balance', label: 'Opening balance' },
    { value: 'fund_in', label: 'Fund in' },
    { value: 'fund_out', label: 'Fund out' },
    { value: 'expense', label: 'Expense' },
    { value: 'purchase', label: 'Purchase (stock/cost)' },
    { value: 'fixed_asset', label: 'Fixed asset purchase' },
] as const;

export default function CreateTransaction() {
    const form = useForm({
        type: 'expense' as string,
        date: new Date().toISOString().slice(0, 10),
        description: '',
        amount: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/admin/accounting/transactions');
    };

    return (
        <>
            <Head title="Add transaction — Accounting" />
            <AdminLayout>
                <div className="mx-auto max-w-md space-y-6">
                    <div>
                        <Link href="/admin/accounting" className="text-sm text-muted-foreground hover:text-foreground">← Transactions</Link>
                        <h1 className="mt-2 text-2xl font-bold">Add transaction</h1>
                        <p className="mt-1 text-sm text-muted-foreground">Expense, fund in/out, purchase, fixed asset, or opening balance</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-border bg-card p-6">
                        <div>
                            <label className="mb-1 block text-sm font-medium">Type</label>
                            <select
                                value={form.data.type}
                                onChange={(e) => form.setData('type', e.target.value)}
                                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                            >
                                {TRANSACTION_TYPES.map((t) => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">Date</label>
                            <input
                                type="date"
                                value={form.data.date as string}
                                onChange={(e) => form.setData('date', e.target.value)}
                                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">Description</label>
                            <input
                                type="text"
                                value={form.data.description as string}
                                onChange={(e) => form.setData('description', e.target.value)}
                                placeholder="e.g. Office rent, Capital injection"
                                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                                required
                            />
                            <InputError message={form.errors.description} />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">Amount (৳)</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={form.data.amount as string}
                                onChange={(e) => form.setData('amount', e.target.value)}
                                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                                required
                            />
                            <InputError message={form.errors.amount} />
                        </div>
                        <Button type="submit" className="w-full" disabled={form.processing}>
                            {form.processing ? 'Saving...' : 'Save transaction'}
                        </Button>
                    </form>
                </div>
            </AdminLayout>
        </>
    );
}
