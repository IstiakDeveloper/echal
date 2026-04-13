import { Head, Link, router } from '@inertiajs/react';
import { Edit2, Plus, Trash2 } from 'lucide-react';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';

const TYPE_LABELS: Record<string, string> = {
    order: 'Sale',
    expense: 'Expense',
    fund_in: 'Fund in',
    fund_out: 'Fund out',
    fixed_asset: 'Fixed asset',
    purchase: 'Purchase',
    opening_balance: 'Opening balance',
};

type Transaction = {
    id: number;
    date: string;
    reference_type: string;
    description: string;
    debit: number;
    credit: number;
    can_edit: boolean;
    can_delete: boolean;
};

type AccountingIndexProps = {
    transactions: Transaction[];
    bankBalance: number | null;
    flash?: { success?: string; error?: string };
};

export default function AccountingIndex({ transactions, bankBalance, flash }: AccountingIndexProps) {
    const handleDelete = (id: number, canDelete: boolean) => {
        if (!canDelete) return;
        if (!confirm('Delete this transaction? This cannot be undone.')) return;
        router.delete(`/admin/accounting/transactions/${id}`);
    };

    return (
        <>
            <Head title="Accounting — Transactions" />
            <AdminLayout>
                <div className="space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold">Transactions</h1>
                            <p className="mt-1 text-muted-foreground">All accounting transactions. Create, edit, or delete (manual only).</p>
                        </div>
                        <Link href="/admin/accounting/transactions/create">
                            <Button>
                                <Plus className="mr-2 size-4" />
                                Create
                            </Button>
                        </Link>
                    </div>

                    {flash?.success && (
                        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                            {flash.success}
                        </div>
                    )}
                    {flash?.error && (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                            {flash.error}
                        </div>
                    )}

                    {bankBalance != null && (
                        <div className="rounded-lg border border-border bg-card px-5 py-4">
                            <span className="text-sm text-muted-foreground">Total bank balance</span>
                            <div className="text-2xl font-bold">৳{bankBalance.toLocaleString('en-BD', { minimumFractionDigits: 2 })}</div>
                        </div>
                    )}

                    <div className="rounded-lg border border-border bg-card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b border-border bg-muted/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">Description</th>
                                        <th className="px-4 py-3 text-right text-sm font-medium">Debit</th>
                                        <th className="px-4 py-3 text-right text-sm font-medium">Credit</th>
                                        <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                                No transactions yet. Use Create to add one.
                                            </td>
                                        </tr>
                                    ) : (
                                        transactions.map((tx) => (
                                            <tr key={tx.id} className="border-b border-border">
                                                <td className="px-4 py-3 text-sm">{tx.date}</td>
                                                <td className="px-4 py-3 text-sm">{TYPE_LABELS[tx.reference_type] ?? tx.reference_type}</td>
                                                <td className="px-4 py-3 text-sm">{tx.description}</td>
                                                <td className="px-4 py-3 text-right text-sm">
                                                    {tx.debit > 0 ? `৳${tx.debit.toLocaleString('en-BD', { minimumFractionDigits: 2 })}` : '—'}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm">
                                                    {tx.credit > 0 ? `৳${tx.credit.toLocaleString('en-BD', { minimumFractionDigits: 2 })}` : '—'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex justify-end gap-1">
                                                        {tx.can_edit && (
                                                            <Link href={`/admin/accounting/transactions/${tx.id}/edit`}>
                                                                <Button variant="ghost" size="sm">
                                                                    <Edit2 className="size-4" />
                                                                </Button>
                                                            </Link>
                                                        )}
                                                        {tx.can_delete && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-destructive hover:bg-destructive/10"
                                                                onClick={() => handleDelete(tx.id, tx.can_delete)}
                                                            >
                                                                <Trash2 className="size-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </AdminLayout>
        </>
    );
}
