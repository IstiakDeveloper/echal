import { Head, Link, router, useForm } from '@inertiajs/react';
import { FileSpreadsheet, FileText, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/layouts/admin-layout';

type Row = {
    sl: number;
    product_id: number;
    name: string;
    before_qty: number;
    before_price: number;
    before_value: number;
    buy_qty: number;
    buy_price: number;
    buy_total: number;
    sale_qty: number;
    sale_price: number;
    sale_subtotal: number;
    sale_discount: number;
    sale_total: number;
    profit_per_unit: number;
    profit_total: number;
    profit_pct: number;
    stock: number;
    stock_value: number;
};

type ProductAnalysisReportProps = {
    report: {
        summary: {
            total_buy: number;
            total_sale: number;
            total_profit: number;
            profit_margin_pct: number;
            stock_value: number;
        };
        rows: Row[];
        period_label: string;
    };
    filters: { from: string; to: string; search: string };
};

function fmt(n: number): string {
    return n.toLocaleString('en-BD', { minimumFractionDigits: 2 });
}

function num(x: number): string {
    return x.toLocaleString('en-BD', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export default function ProductAnalysisReport({ report, filters }: ProductAnalysisReportProps) {
    const form = useForm({
        from: filters.from || new Date().toISOString().slice(0, 10),
        to: filters.to || new Date().toISOString().slice(0, 10),
        search: filters.search || '',
    });

    const applyFilters = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/accounting/product-analysis-report', {
            from: form.data.from,
            to: form.data.to,
            search: form.data.search,
        });
    };

    const s = report.summary;
    const totalBuyQty = report.rows.reduce((a, r) => a + r.buy_qty, 0);
    const totalSaleQty = report.rows.reduce((a, r) => a + r.sale_qty, 0);
    const totalStock = report.rows.reduce((a, r) => a + r.stock, 0);

    return (
        <>
            <Head title="Product Analysis Report — Admin">
                <style>{`@media print { @page { size: A4 landscape; } }`}</style>
            </Head>
            <AdminLayout>
                <div className="space-y-6 report-container report-product-analysis-page">
                    <div className="flex flex-wrap items-center justify-between gap-4 no-print">
                        <h1 className="text-3xl font-bold">Product Analysis Report</h1>
                        <Link href="/admin/accounting">← Transactions</Link>
                    </div>

                    <form onSubmit={applyFilters} className="flex flex-wrap items-end gap-4 rounded-lg border border-border bg-card p-4 no-print">
                        <label className="flex flex-col gap-1">
                            <span className="text-sm font-medium">From</span>
                            <input
                                type="date"
                                value={form.data.from}
                                onChange={(e) => form.setData('from', e.target.value)}
                                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                            />
                        </label>
                        <label className="flex flex-col gap-1">
                            <span className="text-sm font-medium">To</span>
                            <input
                                type="date"
                                value={form.data.to}
                                onChange={(e) => form.setData('to', e.target.value)}
                                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                            />
                        </label>
                        <label className="flex flex-col gap-1">
                            <span className="text-sm font-medium">Search products</span>
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={form.data.search}
                                onChange={(e) => form.setData('search', e.target.value)}
                                className="h-10 w-56 rounded-md border border-input bg-background px-3 text-sm"
                            />
                        </label>
                        <Button type="submit">Apply</Button>
                        <div className="flex items-center gap-2 ml-auto">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700 hover:text-white"
                                onClick={() => {
                                    const q = new URLSearchParams({ from: form.data.from, to: form.data.to, search: form.data.search });
                                    window.location.href = `/admin/accounting/product-analysis-report/export?${q.toString()}`;
                                }}
                            >
                                <FileSpreadsheet className="mr-2 size-4" />
                                Excel
                            </Button>
                            <Button type="button" variant="outline" size="sm" className="bg-red-600 text-white border-red-600 hover:bg-red-700 hover:text-white" onClick={() => window.print()}>
                                <FileText className="mr-2 size-4" />
                                PDF
                            </Button>
                            <Button type="button" variant="outline" size="sm" onClick={() => router.reload()}>
                                <RotateCw className="mr-2 size-4" />
                                Refresh
                            </Button>
                        </div>
                    </form>

                    <div className="grid grid-cols-2 gap-4 no-print sm:grid-cols-3 lg:grid-cols-5">
                        <div className="rounded-lg border border-border bg-blue-50 p-4 dark:bg-blue-950/30">
                            <p className="text-sm font-medium text-muted-foreground">Total Buy</p>
                            <p className="text-2xl font-bold">৳{fmt(s.total_buy)}</p>
                        </div>
                        <div className="rounded-lg border border-border bg-green-50 p-4 dark:bg-green-950/30">
                            <p className="text-sm font-medium text-muted-foreground">Total Sale</p>
                            <p className="text-2xl font-bold">৳{fmt(s.total_sale)}</p>
                        </div>
                        <div className="rounded-lg border border-border bg-amber-50 p-4 dark:bg-amber-950/30">
                            <p className="text-sm font-medium text-muted-foreground">Total Profit</p>
                            <p className="text-2xl font-bold">৳{fmt(s.total_profit)}</p>
                        </div>
                        <div className="rounded-lg border border-border bg-violet-50 p-4 dark:bg-violet-950/30">
                            <p className="text-sm font-medium text-muted-foreground">Profit Margin</p>
                            <p className="text-2xl font-bold">{s.profit_margin_pct}%</p>
                        </div>
                        <div className="rounded-lg border border-border bg-yellow-50 p-4 dark:bg-yellow-950/30">
                            <p className="text-sm font-medium text-muted-foreground">Stock Value</p>
                            <p className="text-2xl font-bold">৳{fmt(s.stock_value)}</p>
                        </div>
                    </div>

                    <p className="text-muted-foreground no-print">{report.period_label}</p>

                    <div className="report-paper report-product-analysis rounded border border-border bg-card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full report-table product-analysis-table">
                                <thead>
                                    <tr>
                                        <th colSpan={2} className="report-th bg-muted/80 text-center">PRODUCT</th>
                                        <th colSpan={3} className="report-th bg-muted/80 text-center">BEFORE STOCK</th>
                                        <th colSpan={3} className="report-th bg-muted/80 text-center">BUY</th>
                                        <th colSpan={5} className="report-th bg-muted/80 text-center">SALE</th>
                                        <th colSpan={3} className="report-th bg-muted/80 text-center">PROFIT</th>
                                        <th colSpan={2} className="report-th bg-muted/80 text-center">STOCK</th>
                                    </tr>
                                    <tr>
                                        <th className="report-th report-num">SL</th>
                                        <th className="report-th text-left">NAME</th>
                                        <th className="report-th report-num">QTY</th>
                                        <th className="report-th report-num">PRICE</th>
                                        <th className="report-th report-num">VALUE</th>
                                        <th className="report-th report-num">QTY</th>
                                        <th className="report-th report-num">PRICE</th>
                                        <th className="report-th report-num">TOTAL</th>
                                        <th className="report-th report-num">QTY</th>
                                        <th className="report-th report-num">PRICE</th>
                                        <th className="report-th report-num">SUBTOTAL</th>
                                        <th className="report-th report-num">DISCOUNT</th>
                                        <th className="report-th report-num">TOTAL</th>
                                        <th className="report-th report-num">PER UNIT</th>
                                        <th className="report-th report-num">TOTAL</th>
                                        <th className="report-th report-num">%</th>
                                        <th className="report-th report-num">STOCK</th>
                                        <th className="report-th report-num">VALUE</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {report.rows.map((row) => (
                                        <tr key={row.product_id} className="report-tr">
                                            <td className="report-td report-num text-right">{row.sl}</td>
                                            <td className="report-td text-left">{row.name}</td>
                                            <td className="report-td report-num text-right">{num(row.before_qty)}</td>
                                            <td className="report-td report-num text-right">{row.before_price > 0 ? `৳${fmt(row.before_price)}` : '—'}</td>
                                            <td className="report-td report-num text-right">{row.before_value > 0 ? `৳${fmt(row.before_value)}` : '—'}</td>
                                            <td className="report-td report-num text-right">{num(row.buy_qty)}</td>
                                            <td className="report-td report-num text-right">{row.buy_price > 0 ? `৳${fmt(row.buy_price)}` : '—'}</td>
                                            <td className="report-td report-num text-right">{row.buy_total > 0 ? `৳${fmt(row.buy_total)}` : '—'}</td>
                                            <td className="report-td report-num text-right">{num(row.sale_qty)}</td>
                                            <td className="report-td report-num text-right">{row.sale_price > 0 ? `৳${fmt(row.sale_price)}` : '—'}</td>
                                            <td className="report-td report-num text-right">{row.sale_subtotal > 0 ? `৳${fmt(row.sale_subtotal)}` : '—'}</td>
                                            <td className="report-td report-num text-right">{row.sale_discount > 0 ? `৳${fmt(row.sale_discount)}` : '—'}</td>
                                            <td className="report-td report-num text-right">{row.sale_total > 0 ? `৳${fmt(row.sale_total)}` : '—'}</td>
                                            <td className="report-td report-num text-right">
                                                <span className={row.profit_per_unit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                                                    {row.profit_per_unit !== 0 ? `৳${fmt(row.profit_per_unit)}` : '—'}
                                                </span>
                                            </td>
                                            <td className="report-td report-num text-right">
                                                <span className={row.profit_total >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                                                    {row.profit_total !== 0 ? `৳${fmt(row.profit_total)}` : '—'}
                                                </span>
                                            </td>
                                            <td className="report-td report-num text-right">
                                                <span className={row.profit_pct >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                                                    {row.profit_pct !== 0 ? `${fmt(row.profit_pct)}%` : '—'}
                                                </span>
                                            </td>
                                            <td className="report-td report-num text-right">{num(row.stock)}</td>
                                            <td className="report-td report-num text-right">{row.stock_value > 0 ? `৳${fmt(row.stock_value)}` : '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="report-total-row font-semibold">
                                        <td className="report-td report-num text-right" />
                                        <td className="report-td text-left">Total</td>
                                        <td className="report-td report-num text-right">—</td>
                                        <td className="report-td report-num text-right">—</td>
                                        <td className="report-td report-num text-right">—</td>
                                        <td className="report-td report-num text-right">{num(totalBuyQty)}</td>
                                        <td className="report-td report-num text-right">—</td>
                                        <td className="report-td report-num text-right">৳{fmt(s.total_buy)}</td>
                                        <td className="report-td report-num text-right">{num(totalSaleQty)}</td>
                                        <td className="report-td report-num text-right">—</td>
                                        <td className="report-td report-num text-right">—</td>
                                        <td className="report-td report-num text-right">—</td>
                                        <td className="report-td report-num text-right">৳{fmt(s.total_sale)}</td>
                                        <td className="report-td report-num text-right">—</td>
                                        <td className="report-td report-num text-right">
                                            <span className={s.total_profit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                                                ৳{fmt(s.total_profit)}
                                            </span>
                                        </td>
                                        <td className="report-td report-num text-right">
                                            <span className={s.total_profit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                                                {s.profit_margin_pct}%
                                            </span>
                                        </td>
                                        <td className="report-td report-num text-right">{num(totalStock)}</td>
                                        <td className="report-td report-num text-right">৳{fmt(s.stock_value)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
            </AdminLayout>
        </>
    );
}
