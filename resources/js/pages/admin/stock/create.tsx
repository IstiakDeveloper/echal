import { Head, Link, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/layouts/admin-layout';

type Product = { id: number; name: string; stock: number; cost_price: number | null; last_unit_price: number | null };

type Props = {
    products: Product[];
    flash: { success?: string; error?: string };
};

function fmt(n: number): string {
    return n.toLocaleString('en-BD', { minimumFractionDigits: 2 });
}

export default function StockCreate({ products, flash }: Props) {
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<Product | null>(null);

    const form = useForm({
        product_id: '' as string | number,
        quantity: '',
        total_amount: '',
        notes: '',
    });

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return products.slice(0, 80);
        return products.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 80);
    }, [products, query]);

    const qtyNum = parseInt(form.data.quantity as string, 10) || 0;
    const totalNum = parseFloat(form.data.total_amount as string) || 0;
    const currentStock = selected ? selected.stock : 0;
    const avgPrice = selected?.cost_price ?? 0;
    const lastUnit = selected?.last_unit_price ?? null;

    const thisUnitPrice = qtyNum > 0 && totalNum >= 0 ? totalNum / qtyNum : 0;
    const newTotalValue = currentStock * avgPrice + totalNum;
    const newTotalQty = currentStock + qtyNum;
    const newAvgPrice = newTotalQty > 0 ? newTotalValue / newTotalQty : avgPrice;

    const selectProduct = (p: Product) => {
        setSelected(p);
        form.setData('product_id', p.id);
        setQuery(p.name);
        setOpen(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/admin/stock', { preserveScroll: true });
    };

    return (
        <>
            <Head title="Add Stock — Admin" />
            <AdminLayout>
                <div className="mx-auto max-w-2xl space-y-6">
                    <div>
                        <Link href="/admin/stock" className="text-sm text-muted-foreground hover:text-foreground">← Stock</Link>
                        <h1 className="mt-2 text-2xl font-bold">Add Stock</h1>
                        <p className="mt-1 text-sm text-muted-foreground">Select or search product, enter quantity and total price. Average cost updates automatically.</p>
                    </div>

                    {flash.success && (
                        <div className="rounded-md bg-green-50 dark:bg-green-950/40 px-4 py-3 text-sm text-green-800 dark:text-green-200">
                            {flash.success}
                        </div>
                    )}
                    {flash.error && (
                        <div className="rounded-md bg-red-50 dark:bg-red-950/40 px-4 py-3 text-sm text-red-800 dark:text-red-200">
                            {flash.error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border border-border bg-card p-6">
                        <div className="relative">
                            <label className="mb-2 block text-sm font-medium">Product</label>
                            <input
                                type="text"
                                placeholder="Click or type to search product..."
                                value={query}
                                onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
                                onFocus={() => setOpen(true)}
                                onBlur={() => setTimeout(() => setOpen(false), 200)}
                                className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
                            />
                            <InputError message={form.errors.product_id} />
                            {open && (
                                <ul className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md border border-border bg-card py-1 shadow-lg">
                                    {filtered.length === 0 ? (
                                        <li className="px-3 py-2 text-sm text-muted-foreground">No product found.</li>
                                    ) : (
                                        filtered.map((p) => (
                                            <li key={p.id}>
                                                <button
                                                    type="button"
                                                    className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
                                                    onClick={() => selectProduct(p)}
                                                >
                                                    {p.name}
                                                    <span className="ml-2 text-muted-foreground">(stock: {p.stock})</span>
                                                </button>
                                            </li>
                                        ))
                                    )}
                                </ul>
                            )}
                        </div>

                        {selected && (
                            <div className="rounded-lg border border-border bg-muted/30 p-4">
                                <p className="text-sm font-medium text-muted-foreground">Selected product</p>
                                <p className="mt-1 font-semibold">{selected.name}</p>
                                <div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                                    <div>
                                        <p className="text-muted-foreground">Current stock</p>
                                        <p className="font-medium">{selected.stock}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Average price</p>
                                        <p className="font-medium">{selected.cost_price != null ? `৳${fmt(selected.cost_price)}` : '—'}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Last entry unit price</p>
                                        <p className="font-medium">{lastUnit != null ? `৳${fmt(lastUnit)}` : '—'}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-sm font-medium">Quantity</label>
                                <input
                                    type="number"
                                    min="1"
                                    required
                                    value={form.data.quantity}
                                    onChange={(e) => form.setData('quantity', e.target.value)}
                                    className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
                                />
                                <InputError message={form.errors.quantity} />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium">Total amount (৳)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    required
                                    value={form.data.total_amount}
                                    onChange={(e) => form.setData('total_amount', e.target.value)}
                                    className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
                                />
                                <InputError message={form.errors.total_amount} />
                            </div>
                        </div>

                        {(qtyNum > 0 || totalNum > 0) && selected && (
                            <div className="rounded-lg border border-border bg-muted/20 p-4">
                                <p className="text-sm font-medium text-muted-foreground">Live calculation</p>
                                <div className="mt-2 grid gap-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">This entry unit price</span>
                                        <span className="font-medium">৳{fmt(thisUnitPrice)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">New average price after add</span>
                                        <span className="font-medium">৳{fmt(newAvgPrice)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">New stock (qty)</span>
                                        <span className="font-medium">{newTotalQty}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="mb-1 block text-sm font-medium">Notes (optional)</label>
                            <input
                                type="text"
                                value={form.data.notes}
                                onChange={(e) => form.setData('notes', e.target.value)}
                                placeholder="Optional note"
                                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                            />
                        </div>

                        <Button type="submit" disabled={form.processing || !selected}>
                            Add Stock
                        </Button>
                    </form>
                </div>
            </AdminLayout>
        </>
    );
}
