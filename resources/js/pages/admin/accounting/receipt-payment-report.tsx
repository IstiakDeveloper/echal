import { Head, Link, useForm } from '@inertiajs/react';
import { Printer } from 'lucide-react';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';

type ReceiptPaymentReportProps = {
    report: {
        opening_balance: number;
        receipts: Array<{ date: string; description: string; amount: number }>;
        payments: Array<{ date: string; description: string; amount: number }>;
        closing_balance: number;
        total_left: number;
        total_right: number;
        total_left_cumulative: number;
        total_right_cumulative: number;
        period_label: string;
    };
    filters: { from: string; to: string };
};

function fmt(n: number): string {
    return n.toLocaleString('en-BD', { minimumFractionDigits: 2 });
}

export default function ReceiptPaymentReport({ report, filters }: ReceiptPaymentReportProps) {
    const form = useForm({
        from: filters.from || new Date().toISOString().slice(0, 10),
        to: filters.to || new Date().toISOString().slice(0, 10),
    });

    const maxRows = Math.max(
        1 + report.receipts.length,
        report.payments.length + 1
    );

    const leftRows = [
        { label: 'Opening balance', amount: report.opening_balance },
        ...report.receipts.map((r) => ({ label: `${r.date} — ${r.description}`, amount: r.amount })),
    ];
    const rightRows = [
        ...report.payments.map((p) => ({ label: `${p.date} — ${p.description}`, amount: p.amount })),
        { label: 'Closing balance', amount: report.closing_balance },
    ];

    return (
        <>
            <Head title="Receipt & Payment — Admin" />
            <AdminLayout>
                <div className="space-y-6 report-container">
                    <div className="flex flex-wrap items-center justify-between gap-4 no-print">
                        <div>
                            <h1 className="text-3xl font-bold">Receipt & Payment</h1>
                            <p className="mt-1 text-muted-foreground">{report.period_label}</p>
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
                            form.get(`/admin/accounting/receipt-payment-report`, { data: { from: form.data.from, to: form.data.to } });
                        }}
                        className="flex flex-wrap items-end gap-4 rounded-lg border border-border bg-card p-4 no-print"
                    >
                        <label className="flex flex-col gap-1">
                            <span className="text-sm font-medium">From</span>
                            <input type="date" value={form.data.from} onChange={(e) => form.setData('from', e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm" />
                        </label>
                        <label className="flex flex-col gap-1">
                            <span className="text-sm font-medium">To</span>
                            <input type="date" value={form.data.to} onChange={(e) => form.setData('to', e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm" />
                        </label>
                        <Button type="submit">Apply</Button>
                    </form>

                    <div className="report-paper rounded border border-border bg-card overflow-hidden">
                        <table className="w-full report-table">
                            <thead>
                                <tr>
                                    <th className="report-th text-left">Particulars</th>
                                    <th className="report-th text-right w-28">Current</th>
                                    <th className="report-th report-divider text-right w-28">Cumulative</th>
                                    <th className="report-th text-left">Particulars</th>
                                    <th className="report-th text-right w-28">Current</th>
                                    <th className="report-th text-right w-28">Cumulative</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.from({ length: maxRows }, (_, i) => (
                                    <tr key={i} className="report-tr">
                                        <td className="report-td text-left">
                                            {i < leftRows.length ? leftRows[i].label : ''}
                                        </td>
                                        <td className="report-td text-right">
                                            {i < leftRows.length ? `৳${fmt(leftRows[i].amount)}` : ''}
                                        </td>
                                        <td className="report-td report-divider text-right text-muted-foreground">
                                            {i < leftRows.length ? (i === 0 ? `৳${fmt(report.opening_balance)}` : '—') : ''}
                                        </td>
                                        <td className="report-td text-left">
                                            {i < rightRows.length ? rightRows[i].label : ''}
                                        </td>
                                        <td className="report-td text-right">
                                            {i < rightRows.length ? `৳${fmt(rightRows[i].amount)}` : ''}
                                        </td>
                                        <td className="report-td text-right text-muted-foreground">
                                            {i < rightRows.length ? (i === rightRows.length - 1 ? `৳${fmt(report.closing_balance)}` : '—') : ''}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="report-total-row">
                                    <td className="report-td font-semibold">Total (Left)</td>
                                    <td className="report-td text-right font-semibold">৳{fmt(report.total_left)}</td>
                                    <td className="report-td report-divider text-right font-semibold">৳{fmt(report.total_left_cumulative)}</td>
                                    <td className="report-td font-semibold">Total (Right)</td>
                                    <td className="report-td text-right font-semibold">৳{fmt(report.total_right)}</td>
                                    <td className="report-td text-right font-semibold">৳{fmt(report.total_right_cumulative)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </AdminLayout>
        </>
    );
}
