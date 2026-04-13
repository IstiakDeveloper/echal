import { Head, Link, useForm } from '@inertiajs/react';
import { Printer } from 'lucide-react';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';

type BalanceSheetReportProps = {
    report: {
        assets: Array<{ name: string; code: string; balance: number }>;
        liabilities_equity: Array<{ name: string; code: string; balance: number }>;
        total_assets: number;
        total_liabilities_equity: number;
        as_of_date: string;
    };
    filters: { date: string };
};

function fmt(n: number): string {
    return n.toLocaleString('en-BD', { minimumFractionDigits: 2 });
}

export default function BalanceSheetReport({ report, filters }: BalanceSheetReportProps) {
    const form = useForm({
        date: filters.date || new Date().toISOString().slice(0, 10),
    });

    const maxRows = Math.max(Math.max(report.assets.length, 1), Math.max(report.liabilities_equity.length, 1));

    const assetRows = report.assets.length > 0 ? report.assets : [{ name: 'No assets', code: '', balance: 0 }];
    const liabilityRows = report.liabilities_equity.length > 0 ? report.liabilities_equity : [{ name: 'None', code: '', balance: 0 }];

    return (
        <>
            <Head title={`Balance Sheet — ${report.as_of_date}`} />
            <AdminLayout>
                <div className="space-y-6 report-container">
                    <div className="flex flex-wrap items-center justify-between gap-4 no-print">
                        <div>
                            <h1 className="text-3xl font-bold">Balance Sheet</h1>
                            <p className="mt-1 text-muted-foreground">As of {report.as_of_date}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link href="/admin/accounting">← Transactions</Link>
                            <Button type="button" variant="outline" size="sm" onClick={() => window.print()}>
                                <Printer className="mr-2 size-4" />
                                Print
                            </Button>
                        </div>
                    </div>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            form.get('/admin/accounting/balance-sheet-report', { data: { date: form.data.date } });
                        }}
                        className="flex flex-wrap items-end gap-4 rounded-lg border border-border bg-card p-4 no-print"
                    >
                        <label className="flex flex-col gap-1">
                            <span className="text-sm font-medium">As of date</span>
                            <input type="date" value={form.data.date} onChange={(e) => form.setData('date', e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm" />
                        </label>
                        <Button type="submit">Apply</Button>
                    </form>

                    <div className="report-paper rounded border border-border bg-card overflow-hidden">
                        <table className="w-full report-table">
                            <thead>
                                <tr>
                                    <th className="report-th report-divider text-left w-1/2">Assets (Left)</th>
                                    <th className="report-th text-left w-1/2">Liabilities & Equity (Right)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.from({ length: maxRows }, (_, i) => (
                                    <tr key={i} className="report-tr">
                                        <td className="report-td report-divider">
                                            {i < assetRows.length && Math.abs(assetRows[i].balance) >= 0.01 ? (
                                                <span className="flex justify-between gap-4">
                                                    <span>{assetRows[i].name}</span>
                                                    <span>৳{fmt(assetRows[i].balance)}</span>
                                                </span>
                                            ) : i < assetRows.length ? (
                                                <span className="flex justify-between gap-4 text-muted-foreground">
                                                    <span>{assetRows[i].name}</span>
                                                    <span>—</span>
                                                </span>
                                            ) : null}
                                        </td>
                                        <td className="report-td">
                                            {i < liabilityRows.length && Math.abs(liabilityRows[i].balance) >= 0.01 ? (
                                                <span className="flex justify-between gap-4">
                                                    <span>{liabilityRows[i].name}</span>
                                                    <span>৳{fmt(liabilityRows[i].balance)}</span>
                                                </span>
                                            ) : i < liabilityRows.length ? (
                                                <span className="flex justify-between gap-4 text-muted-foreground">
                                                    <span>{liabilityRows[i].name}</span>
                                                    <span>—</span>
                                                </span>
                                            ) : null}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="report-total-row">
                                    <td className="report-td report-divider font-semibold">
                                        <span className="flex justify-between gap-4">
                                            <span>Total Assets</span>
                                            <span>৳{fmt(report.total_assets)}</span>
                                        </span>
                                    </td>
                                    <td className="report-td font-semibold">
                                        <span className="flex justify-between gap-4">
                                            <span>Total</span>
                                            <span>৳{fmt(report.total_liabilities_equity)}</span>
                                        </span>
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </AdminLayout>
        </>
    );
}
