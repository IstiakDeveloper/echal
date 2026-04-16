import { Head, Link, router } from '@inertiajs/react';
import * as Dialog from '@radix-ui/react-dialog';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/layouts/admin-layout';

type Product = {
    id: number;
    name: string;
    stock: number;
    cost_price: number | null;
};
type HistoryMovement = {
    id: number;
    quantity: number;
    total_amount: number;
    unit_price: number;
    created_at: string;
};

type Props = {
    products: Product[];
    flash: { success?: string; error?: string };
};

function fmt(n: number): string {
    return n.toLocaleString('en-BD', { minimumFractionDigits: 2 });
}

export default function StockIndex({ products, flash }: Props) {
    const [historyProduct, setHistoryProduct] = useState<{
        id: number;
        name: string;
    } | null>(null);
    const [historyMovements, setHistoryMovements] = useState<HistoryMovement[]>(
        [],
    );
    const [editMovement, setEditMovement] = useState<
        (HistoryMovement & { product_id: number; product_name: string }) | null
    >(null);
    const [editQty, setEditQty] = useState('');
    const [editTotal, setEditTotal] = useState('');

    const openHistory = useCallback(
        async (productId: number, productName: string) => {
            setHistoryProduct({ id: productId, name: productName });
            setHistoryMovements([]);
            try {
                const r = await fetch(
                    `/admin/stock/product-movements/${productId}`,
                    {
                        headers: {
                            Accept: 'application/json',
                            'X-Requested-With': 'XMLHttpRequest',
                        },
                    },
                );
                const data = await r.json();
                setHistoryMovements(data.movements || []);
            } catch {
                setHistoryMovements([]);
            }
        },
        [],
    );

    const openEdit = (
        m: HistoryMovement,
        productId: number,
        productName: string,
    ) => {
        setEditMovement({
            ...m,
            product_id: productId,
            product_name: productName,
        });
        setEditQty(String(m.quantity));
        setEditTotal(String(m.total_amount));
    };

    const submitEdit = () => {
        if (!editMovement) return;
        router.put(
            `/admin/stock/${editMovement.id}`,
            { quantity: editQty, total_amount: editTotal },
            {
                preserveScroll: true,
                onSuccess: () => setEditMovement(null),
            },
        );
    };

    const deleteMovement = (id: number) => {
        if (!confirm('Delete this stock entry? Product stock will be reduced.'))
            return;
        router.delete(`/admin/stock/${id}`, { preserveScroll: true });
    };

    return (
        <>
            <Head title="Stock — Admin" />
            <AdminLayout>
                <div className="space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <Link
                                href="/admin"
                                className="text-sm text-muted-foreground hover:text-foreground"
                            >
                                ← Dashboard
                            </Link>
                            <h1 className="mt-2 text-2xl font-bold">Stock</h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                All products. Use History to view or edit stock
                                entries.
                            </p>
                        </div>
                        <Link href="/admin/stock/create">
                            <Button>Add Stock</Button>
                        </Link>
                    </div>

                    {flash.success && (
                        <div className="rounded-md bg-green-50 px-4 py-3 text-sm text-green-800 dark:bg-green-950/40 dark:text-green-200">
                            {flash.success}
                        </div>
                    )}
                    {flash.error && (
                        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-800 dark:bg-red-950/40 dark:text-red-200">
                            {flash.error}
                        </div>
                    )}

                    <div className="overflow-hidden rounded-md border border-border bg-card">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium">
                                        Product
                                    </th>
                                    <th className="px-4 py-3 text-right font-medium">
                                        Current stock
                                    </th>
                                    <th className="px-4 py-3 text-right font-medium">
                                        Avg. price (৳)
                                    </th>
                                    <th className="px-4 py-3 text-right font-medium">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="px-4 py-8 text-center text-muted-foreground"
                                        >
                                            No products.
                                        </td>
                                    </tr>
                                ) : (
                                    products.map((p) => (
                                        <tr
                                            key={p.id}
                                            className="border-t border-border"
                                        >
                                            <td className="px-4 py-3 font-medium">
                                                {p.name}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {p.stock}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {p.cost_price != null
                                                    ? fmt(p.cost_price)
                                                    : '—'}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        openHistory(
                                                            p.id,
                                                            p.name,
                                                        )
                                                    }
                                                >
                                                    History
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* History modal */}
                <Dialog.Root
                    open={!!historyProduct}
                    onOpenChange={(open) => !open && setHistoryProduct(null)}
                >
                    <Dialog.Portal>
                        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
                        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-6 shadow-lg">
                            <Dialog.Title className="text-lg font-semibold">
                                Stock history — {historyProduct?.name}
                            </Dialog.Title>
                            <div className="mt-4 max-h-80 overflow-y-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/50">
                                        <tr>
                                            <th className="px-2 py-2 text-left">
                                                Date
                                            </th>
                                            <th className="px-2 py-2 text-right">
                                                Qty
                                            </th>
                                            <th className="px-2 py-2 text-right">
                                                Total (৳)
                                            </th>
                                            <th className="px-2 py-2 text-right">
                                                Unit (৳)
                                            </th>
                                            <th className="px-2 py-2 text-right">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {historyMovements.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={5}
                                                    className="px-2 py-4 text-center text-muted-foreground"
                                                >
                                                    No entries.
                                                </td>
                                            </tr>
                                        ) : (
                                            historyMovements.map((m) => (
                                                <tr
                                                    key={m.id}
                                                    className="border-t border-border"
                                                >
                                                    <td className="px-2 py-2">
                                                        {m.created_at}
                                                    </td>
                                                    <td className="px-2 py-2 text-right">
                                                        {m.quantity}
                                                    </td>
                                                    <td className="px-2 py-2 text-right">
                                                        {fmt(m.total_amount)}
                                                    </td>
                                                    <td className="px-2 py-2 text-right">
                                                        {fmt(m.unit_price)}
                                                    </td>
                                                    <td className="px-2 py-2 text-right">
                                                        {historyProduct && (
                                                            <>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-7 text-xs"
                                                                    onClick={() => {
                                                                        const pid =
                                                                            historyProduct!
                                                                                .id;
                                                                        const pname =
                                                                            historyProduct!
                                                                                .name;
                                                                        setHistoryProduct(
                                                                            null,
                                                                        );
                                                                        openEdit(
                                                                            m,
                                                                            pid,
                                                                            pname,
                                                                        );
                                                                    }}
                                                                >
                                                                    Edit
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-7 text-xs text-red-600"
                                                                    onClick={() => {
                                                                        deleteMovement(
                                                                            m.id,
                                                                        );
                                                                        setHistoryProduct(
                                                                            null,
                                                                        );
                                                                    }}
                                                                >
                                                                    Delete
                                                                </Button>
                                                            </>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <Dialog.Close asChild>
                                <Button variant="outline" className="mt-4">
                                    Close
                                </Button>
                            </Dialog.Close>
                        </Dialog.Content>
                    </Dialog.Portal>
                </Dialog.Root>

                {/* Edit modal */}
                <Dialog.Root
                    open={!!editMovement}
                    onOpenChange={(open) => !open && setEditMovement(null)}
                >
                    <Dialog.Portal>
                        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
                        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-6 shadow-lg">
                            <Dialog.Title className="text-lg font-semibold">
                                Edit stock entry
                            </Dialog.Title>
                            {editMovement && (
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {editMovement.product_name}
                                </p>
                            )}
                            <div className="mt-4 space-y-3">
                                <div>
                                    <label className="block text-sm font-medium">
                                        Quantity
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={editQty}
                                        onChange={(e) =>
                                            setEditQty(e.target.value)
                                        }
                                        className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">
                                        Total price (৳)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={editTotal}
                                        onChange={(e) =>
                                            setEditTotal(e.target.value)
                                        }
                                        className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                                    />
                                </div>
                            </div>
                            <div className="mt-4 flex gap-2">
                                <Button onClick={submitEdit}>Save</Button>
                                <Dialog.Close asChild>
                                    <Button variant="outline">Cancel</Button>
                                </Dialog.Close>
                            </div>
                        </Dialog.Content>
                    </Dialog.Portal>
                </Dialog.Root>
            </AdminLayout>
        </>
    );
}
