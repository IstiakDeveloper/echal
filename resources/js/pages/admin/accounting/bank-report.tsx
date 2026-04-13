import { Head, Link, useForm } from '@inertiajs/react';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/layouts/admin-layout';

const DEBIT_LABELS: Record<string, string> = {
    order: 'Sale',
    opening_balance: 'Opening',
    fund_in: 'Fund in',
};
const CREDIT_LABELS: Record<string, string> = {
    expense: 'Expense',
    purchase: 'Purchase',
    fund_out: 'Fund out',
    fixed_asset: 'Fixed asset',
};

type BankReportProps = {
    report: {
        opening_balance: number;
        rows: Array<Record<string, number | string>>;
        debit_columns: string[];
        credit_columns: string[];
        month_label: string;
        totals: Record<string, number>;
    };
    filters: { month: string };
};

function fmt(n: number): string {
    return n.toLocaleString('en-BD', { minimumFractionDigits: 2 });
}

export default function BankReport({ report, filters }: BankReportProps) {
    const form = useForm({ month: filters.month || new Date().toISOString().slice(0, 7) });
    const { debit_columns, credit_columns, rows, totals } = report;

    return (
        <>
            <Head title={`Bank Report — ${report.month_label}`}>
                <style>{`@media print { @page { size: A4 landscape; } }`}</style>
            </Head>
            <AdminLayout>
                <div className="space-y-6 report-container">
                    <div className="flex flex-wrap items-center justify-between gap-4 no-print">
                        <div>
                            <h1 className="text-3xl font-bold">Bank Report</h1>
                            <p className="mt-1 text-muted-foreground">
                                {report.month_label} — One row per day. Debit (Sale, Opening, Fund in) | Credit sub-columns | Available balance.
                            </p>
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
                            form.get('/admin/accounting/bank-report');
                        }}
                        className="flex flex-wrap items-end gap-4 rounded-lg border border-border bg-card p-4 no-print"
                    >
                        <label className="flex flex-col gap-1">
                            <span className="text-sm font-medium">Month</span>
                            <input
                                type="month"
                                value={form.data.month}
                                onChange={(e) => form.setData('month', e.target.value)}
                                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                            />
                        </label>
                        <Button type="submit">Apply</Button>
                    </form>

                    <div className="report-paper report-bank rounded border border-border bg-card overflow-hidden">
                        <div className="border-b border-border bg-muted px-4 py-3 text-sm font-medium">
                            <strong>Opening balance (start of {report.month_label}):</strong> ৳{fmt(report.opening_balance)}
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full report-table">
                                <thead>
                                    <tr>
                                        <th className="report-th report-date">Date</th>
                                        {debit_columns.map((c) => (
                                            <th key={c} className="report-th report-num">
                                                {DEBIT_LABELS[c] ?? c}
                                            </th>
                                        ))}
                                        <th className="report-th report-num report-total-col">Total Debit</th>
                                        {credit_columns.map((c) => (
                                            <th key={c} className="report-th report-num">
                                                {CREDIT_LABELS[c] ?? c}
                                            </th>
                                        ))}
                                        <th className="report-th report-num report-total-col">Total Credit</th>
                                        <th className="report-th report-num report-balance-col">Available balance</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((row, i) => (
                                        <tr key={row.date as string} className="report-tr">
                                            <td className="report-td report-date">{(row.date as string)}</td>
                                            {debit_columns.map((c) => (
                                                <td key={c} className="report-td report-num text-right">
                                                    {(row['debit_' + c] as number) > 0 ? `৳${fmt(row['debit_' + c] as number)}` : ''}
                                                </td>
                                            ))}
                                            <td className="report-td report-num text-right report-total-col font-medium">
                                                ৳{fmt(row.total_debit as number)}
                                            </td>
                                            {credit_columns.map((c) => (
                                                <td key={c} className="report-td report-num text-right">
                                                    {(row['credit_' + c] as number) > 0 ? `৳${fmt(row['credit_' + c] as number)}` : ''}
                                                </td>
                                            ))}
                                            <td className="report-td report-num text-right report-total-col font-medium">
                                                ৳{fmt(row.total_credit as number)}
                                            </td>
                                            <td className="report-td report-num text-right report-balance-col font-semibold">
                                                ৳{fmt(row.balance as number)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="report-total-row font-semibold">
                                        <td className="report-td report-date">Total</td>
                                        {debit_columns.map((c) => (
                                            <td key={c} className="report-td report-num text-right">
                                                ৳{fmt(totals['debit_' + c] ?? 0)}
                                            </td>
                                        ))}
                                        <td className="report-td report-num text-right report-total-col">৳{fmt(totals.total_debit ?? 0)}</td>
                                        {credit_columns.map((c) => (
                                            <td key={c} className="report-td report-num text-right">
                                                ৳{fmt(totals['credit_' + c] ?? 0)}
                                            </td>
                                        ))}
                                        <td className="report-td report-num text-right report-total-col">৳{fmt(totals.total_credit ?? 0)}</td>
                                        <td className="report-td report-num text-right report-balance-col">
                                            ৳{fmt(report.rows.length > 0 ? (report.rows[report.rows.length - 1].balance as number) : report.opening_balance)}
                                        </td>
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
