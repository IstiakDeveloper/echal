import { Head, Link, useForm } from '@inertiajs/react';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/layouts/admin-layout';

type IncomeExpenditureReportProps = {
    report: {
        income: Array<{
            name: string;
            code: string;
            amount: number;
            cumulative: number;
        }>;
        expenditure: Array<{
            name: string;
            code: string;
            amount: number;
            cumulative: number;
        }>;
        income_total: number;
        expenditure_total: number;
        income_total_cumulative: number;
        expenditure_total_cumulative: number;
        surplus: number;
        surplus_cumulative: number;
        period_label: string;
    };
    filters: { from: string; to: string };
};

function fmt(n: number): string {
    return n.toLocaleString('en-BD', { minimumFractionDigits: 2 });
}

export default function IncomeExpenditureReport({
    report,
    filters,
}: IncomeExpenditureReportProps) {
    const form = useForm({
        from: filters.from || new Date().toISOString().slice(0, 10),
        to: filters.to || new Date().toISOString().slice(0, 10),
    });

    const maxRows = Math.max(
        Math.max(report.income.length, 1),
        Math.max(report.expenditure.length, 1),
    );

    const incomeRows =
        report.income.length > 0
            ? report.income
            : [{ name: 'No income', code: '', amount: 0, cumulative: 0 }];
    const expenditureRows =
        report.expenditure.length > 0
            ? report.expenditure
            : [{ name: 'No expenditure', code: '', amount: 0, cumulative: 0 }];

    return (
        <>
            <Head title="Income & Expenditure — Admin" />
            <AdminLayout>
                <div className="report-container space-y-6">
                    <div className="no-print flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold">
                                Income & Expenditure
                            </h1>
                            <p className="mt-1 text-muted-foreground">
                                {report.period_label}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link href="/admin/accounting">← Transactions</Link>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => window.print()}
                            >
                                <Printer className="mr-2 size-4" />
                                Print
                            </Button>
                        </div>
                    </div>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            form.get(
                                '/admin/accounting/income-expenditure-report',
                                {
                                    data: {
                                        from: form.data.from,
                                        to: form.data.to,
                                    },
                                },
                            );
                        }}
                        className="no-print flex flex-wrap items-end gap-4 rounded-lg border border-border bg-card p-4"
                    >
                        <label className="flex flex-col gap-1">
                            <span className="text-sm font-medium">From</span>
                            <input
                                type="date"
                                value={form.data.from}
                                onChange={(e) =>
                                    form.setData('from', e.target.value)
                                }
                                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                            />
                        </label>
                        <label className="flex flex-col gap-1">
                            <span className="text-sm font-medium">To</span>
                            <input
                                type="date"
                                value={form.data.to}
                                onChange={(e) =>
                                    form.setData('to', e.target.value)
                                }
                                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                            />
                        </label>
                        <Button type="submit">Apply</Button>
                    </form>

                    <div className="report-paper overflow-hidden rounded border border-border bg-card">
                        <table className="report-table w-full">
                            <thead>
                                <tr>
                                    <th className="report-th text-left">
                                        Income — Particulars
                                    </th>
                                    <th className="report-th w-28 text-right">
                                        Current
                                    </th>
                                    <th className="report-th report-divider w-28 text-right">
                                        Cumulative
                                    </th>
                                    <th className="report-th text-left">
                                        Expenditure — Particulars
                                    </th>
                                    <th className="report-th w-28 text-right">
                                        Current
                                    </th>
                                    <th className="report-th w-28 text-right">
                                        Cumulative
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.from({ length: maxRows }, (_, i) => (
                                    <tr key={i} className="report-tr">
                                        <td className="report-td text-left">
                                            {i < incomeRows.length
                                                ? incomeRows[i].name
                                                : ''}
                                        </td>
                                        <td className="report-td text-right">
                                            {i < incomeRows.length
                                                ? Math.abs(
                                                      incomeRows[i].amount,
                                                  ) >= 0.01
                                                    ? `৳${fmt(incomeRows[i].amount)}`
                                                    : '—'
                                                : ''}
                                        </td>
                                        <td className="report-td report-divider text-right">
                                            {i < incomeRows.length
                                                ? Math.abs(
                                                      incomeRows[i].cumulative,
                                                  ) >= 0.01
                                                    ? `৳${fmt(incomeRows[i].cumulative)}`
                                                    : '—'
                                                : ''}
                                        </td>
                                        <td className="report-td text-left">
                                            {i < expenditureRows.length
                                                ? expenditureRows[i].name
                                                : ''}
                                        </td>
                                        <td className="report-td text-right">
                                            {i < expenditureRows.length
                                                ? Math.abs(
                                                      expenditureRows[i].amount,
                                                  ) >= 0.01
                                                    ? `৳${fmt(expenditureRows[i].amount)}`
                                                    : '—'
                                                : ''}
                                        </td>
                                        <td className="report-td text-right">
                                            {i < expenditureRows.length
                                                ? Math.abs(
                                                      expenditureRows[i]
                                                          .cumulative,
                                                  ) >= 0.01
                                                    ? `৳${fmt(expenditureRows[i].cumulative)}`
                                                    : '—'
                                                : ''}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="report-total-row">
                                    <td className="report-td text-left font-semibold">
                                        Total Income
                                    </td>
                                    <td className="report-td text-right font-semibold">
                                        ৳{fmt(report.income_total)}
                                    </td>
                                    <td className="report-td report-divider text-right font-semibold">
                                        ৳{fmt(report.income_total_cumulative)}
                                    </td>
                                    <td className="report-td text-left font-semibold">
                                        Total Expenditure
                                    </td>
                                    <td className="report-td text-right font-semibold">
                                        ৳{fmt(report.expenditure_total)}
                                    </td>
                                    <td className="report-td text-right font-semibold">
                                        ৳
                                        {fmt(
                                            report.expenditure_total_cumulative,
                                        )}
                                    </td>
                                </tr>
                                <tr className="report-total-row">
                                    <td className="report-td text-left font-semibold">
                                        Surplus / (Deficit)
                                    </td>
                                    <td className="report-td text-right font-semibold">
                                        ৳{fmt(report.surplus)}
                                    </td>
                                    <td className="report-td report-divider text-right font-semibold">
                                        ৳{fmt(report.surplus_cumulative)}
                                    </td>
                                    <td className="report-td" />
                                    <td className="report-td" />
                                    <td className="report-td" />
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </AdminLayout>
        </>
    );
}
