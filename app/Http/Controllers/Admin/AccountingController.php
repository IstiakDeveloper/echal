<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AccountingTransaction;
use App\Services\AccountingService;
use App\Services\ProductAnalysisService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response as HttpResponse;
use Inertia\Inertia;
use Inertia\Response;

class AccountingController extends Controller
{
    public function __construct(
        private AccountingService $accounting,
        private ProductAnalysisService $productAnalysis
    ) {}

    public function index(): Response
    {
        try {
            $cashId = $this->accounting->cashAccountId();
        } catch (\Throwable) {
            return Inertia::render('admin/accounting/index', [
                'transactions' => [],
                'bankBalance' => null,
                'flash' => [
                    'success' => session('success'),
                    'error' => session('error'),
                ],
            ]);
        }

        $transactions = AccountingTransaction::query()
            ->with(['entries' => fn ($q) => $q->with('account')])
            ->orderByDesc('date')
            ->orderByDesc('id')
            ->get()
            ->map(function (AccountingTransaction $tx) use ($cashId) {
                $cashEntry = $tx->entries->firstWhere('accounting_account_id', $cashId);
                $debit = $cashEntry ? (float) $cashEntry->debit : 0.0;
                $credit = $cashEntry ? (float) $cashEntry->credit : 0.0;

                return [
                    'id' => $tx->id,
                    'date' => $tx->date->format('Y-m-d'),
                    'reference_type' => $tx->reference_type,
                    'description' => $tx->description,
                    'debit' => round($debit, 2),
                    'credit' => round($credit, 2),
                    'can_edit' => $tx->reference_type !== 'order',
                    'can_delete' => $tx->reference_type !== 'order',
                ];
            });

        $bankBalance = $this->accounting->getCurrentCashBalance();

        return Inertia::render('admin/accounting/index', [
            'transactions' => $transactions,
            'bankBalance' => $bankBalance,
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    public function bankReport(Request $request): Response
    {
        $yearMonth = $request->get('month', date('Y-m'));
        $data = $this->accounting->bankReport($yearMonth);

        return Inertia::render('admin/accounting/bank-report', [
            'report' => $data,
            'filters' => ['month' => $yearMonth],
        ]);
    }

    public function receiptPaymentReport(Request $request): Response
    {
        $dateFrom = $request->get('from', date('Y-m-01'));
        $dateTo = $request->get('to', date('Y-m-t'));
        $data = $this->accounting->receiptPaymentReport($dateFrom, $dateTo);

        return Inertia::render('admin/accounting/receipt-payment-report', [
            'report' => $data,
            'filters' => ['from' => $dateFrom, 'to' => $dateTo],
        ]);
    }

    public function incomeExpenditureReport(Request $request): Response
    {
        $dateFrom = $request->get('from', date('Y-m-01'));
        $dateTo = $request->get('to', date('Y-m-t'));
        $data = $this->accounting->incomeExpenditureReport($dateFrom, $dateTo);

        return Inertia::render('admin/accounting/income-expenditure-report', [
            'report' => $data,
            'filters' => ['from' => $dateFrom, 'to' => $dateTo],
        ]);
    }

    public function balanceSheetReport(Request $request): Response
    {
        $asOfDate = $request->get('date', date('Y-m-d'));
        $data = $this->accounting->balanceSheetReport($asOfDate);

        return Inertia::render('admin/accounting/balance-sheet-report', [
            'report' => $data,
            'filters' => ['date' => $asOfDate],
        ]);
    }

    public function productAnalysisReport(Request $request): Response
    {
        $dateFrom = $request->get('from', date('Y-m-01'));
        $dateTo = $request->get('to', date('Y-m-t'));
        $search = $request->get('search', '');
        $data = $this->productAnalysis->report($dateFrom, $dateTo, $search);

        return Inertia::render('admin/accounting/product-analysis-report', [
            'report' => $data,
            'filters' => ['from' => $dateFrom, 'to' => $dateTo, 'search' => $search],
        ]);
    }

    public function exportProductAnalysisReport(Request $request)
    {
        $dateFrom = $request->get('from', date('Y-m-01'));
        $dateTo = $request->get('to', date('Y-m-t'));
        $search = $request->get('search', '');
        $data = $this->productAnalysis->report($dateFrom, $dateTo, $search);

        $filename = 'product-analysis-'.$dateFrom.'-'.$dateTo.'.csv';
        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="'.$filename.'"',
        ];

        $callback = function () use ($data) {
            $out = fopen('php://output', 'w');
            fputcsv($out, ['SL', 'Name', 'Before Qty', 'Before Price', 'Before Value', 'Buy Qty', 'Buy Price', 'Buy Total', 'Sale Qty', 'Sale Price', 'Sale Subtotal', 'Sale Discount', 'Sale Total', 'Profit Per Unit', 'Profit Total', 'Profit %', 'Stock', 'Stock Value']);
            foreach ($data['rows'] as $row) {
                fputcsv($out, [
                    $row['sl'], $row['name'], $row['before_qty'], $row['before_price'], $row['before_value'],
                    $row['buy_qty'], $row['buy_price'], $row['buy_total'], $row['sale_qty'], $row['sale_price'],
                    $row['sale_subtotal'], $row['sale_discount'], $row['sale_total'], $row['profit_per_unit'],
                    $row['profit_total'], $row['profit_pct'], $row['stock'], $row['stock_value'],
                ]);
            }
            fclose($out);
        };

        return HttpResponse::stream($callback, 200, $headers);
    }

    public function createTransaction(): Response
    {
        return Inertia::render('admin/accounting/create-transaction');
    }

    public function storeTransaction(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'type' => ['required', 'string', 'in:expense,fund_in,fund_out,fixed_asset,purchase,opening_balance'],
            'date' => ['required', 'date'],
            'description' => ['required', 'string', 'max:500'],
            'amount' => ['required', 'numeric', 'min:0.01'],
        ]);

        $date = $validated['date'];
        $description = $validated['description'];
        $amount = (float) $validated['amount'];

        match ($validated['type']) {
            'expense' => $this->accounting->recordExpense($date, $description, $amount),
            'fund_in' => $this->accounting->recordFundIn($date, $description, $amount),
            'fund_out' => $this->accounting->recordFundOut($date, $description, $amount),
            'fixed_asset' => $this->accounting->recordFixedAssetPurchase($date, $description, $amount),
            'purchase' => $this->accounting->recordPurchase($date, $description, $amount),
            'opening_balance' => $this->accounting->recordOpeningBalance($date, $amount),
        };

        return redirect()->route('admin.accounting.index')->with('success', 'Transaction recorded.');
    }

    public function editTransaction(AccountingTransaction $transaction): Response|RedirectResponse
    {
        if ($transaction->reference_type === 'order') {
            return redirect()->route('admin.accounting.index')->with('error', 'Sale transactions cannot be edited.');
        }

        $cashId = $this->accounting->cashAccountId();
        $cashEntry = $transaction->entries()->where('accounting_account_id', $cashId)->first();
        $amount = $cashEntry ? (float) $cashEntry->debit + (float) $cashEntry->credit : 0;

        return Inertia::render('admin/accounting/edit-transaction', [
            'transaction' => [
                'id' => $transaction->id,
                'date' => $transaction->date->format('Y-m-d'),
                'reference_type' => $transaction->reference_type,
                'description' => $transaction->description,
                'amount' => round($amount, 2),
            ],
        ]);
    }

    public function updateTransaction(Request $request, AccountingTransaction $transaction): RedirectResponse
    {
        if ($transaction->reference_type === 'order') {
            return redirect()->route('admin.accounting.index')->with('error', 'Sale transactions cannot be edited.');
        }

        $validated = $request->validate([
            'type' => ['required', 'string', 'in:expense,fund_in,fund_out,fixed_asset,purchase,opening_balance'],
            'date' => ['required', 'date'],
            'description' => ['required', 'string', 'max:500'],
            'amount' => ['required', 'numeric', 'min:0.01'],
        ]);

        $this->accounting->updateTransaction(
            $transaction,
            $validated['date'],
            $validated['description'],
            $validated['type'],
            (float) $validated['amount']
        );

        return redirect()->route('admin.accounting.index')->with('success', 'Transaction updated.');
    }

    public function destroyTransaction(AccountingTransaction $transaction): RedirectResponse
    {
        try {
            $this->accounting->deleteTransaction($transaction);
        } catch (\InvalidArgumentException $e) {
            return redirect()->route('admin.accounting.index')->with('error', $e->getMessage());
        }

        return redirect()->route('admin.accounting.index')->with('success', 'Transaction deleted.');
    }
}
