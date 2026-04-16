<?php

namespace App\Services;

use App\Models\AccountingAccount;
use App\Models\AccountingEntry;
use App\Models\AccountingTransaction;
use App\Models\Order;
use Illuminate\Support\Facades\DB;

class AccountingService
{
    private const CASH = '1000';

    private const INVENTORY = '2000';

    private const FIXED_ASSETS = '3000';

    private const SALES = '4000';

    private const PURCHASES = '5000';

    private const OPERATING_EXPENSE = '6000';

    private const CAPITAL = '7000';

    /**
     * Record sale from order: Debit Cash, Credit Sales.
     */
    public function recordSale(Order $order): AccountingTransaction
    {
        $amount = (float) $order->total;
        if ($amount <= 0) {
            throw new \InvalidArgumentException('Sale amount must be positive.');
        }

        return $this->recordDoubleEntry(
            date: $order->created_at->toDateString(),
            description: 'Sale #'.$order->id,
            referenceType: 'order',
            referenceId: $order->id,
            entries: [
                [self::CASH, $amount, 0],
                [self::SALES, 0, $amount],
            ]
        );
    }

    public function recordSaleIfMissing(Order $order): AccountingTransaction
    {
        $existing = AccountingTransaction::query()
            ->where('reference_type', 'order')
            ->where('reference_id', $order->id)
            ->first();

        if ($existing) {
            return $existing;
        }

        return $this->recordSale($order);
    }

    /**
     * Record expense: Debit Operating Expense, Credit Cash.
     */
    public function recordExpense(string $date, string $description, float $amount): AccountingTransaction
    {
        if ($amount <= 0) {
            throw new \InvalidArgumentException('Expense amount must be positive.');
        }

        return $this->recordDoubleEntry(
            date: $date,
            description: $description,
            referenceType: 'expense',
            referenceId: null,
            entries: [
                [self::OPERATING_EXPENSE, $amount, 0],
                [self::CASH, 0, $amount],
            ]
        );
    }

    /**
     * Record fund in (capital injection): Debit Cash, Credit Capital.
     */
    public function recordFundIn(string $date, string $description, float $amount): AccountingTransaction
    {
        if ($amount <= 0) {
            throw new \InvalidArgumentException('Fund in amount must be positive.');
        }

        return $this->recordDoubleEntry(
            date: $date,
            description: $description,
            referenceType: 'fund_in',
            referenceId: null,
            entries: [
                [self::CASH, $amount, 0],
                [self::CAPITAL, 0, $amount],
            ]
        );
    }

    /**
     * Record fund out (drawing): Debit Capital, Credit Cash.
     */
    public function recordFundOut(string $date, string $description, float $amount): AccountingTransaction
    {
        if ($amount <= 0) {
            throw new \InvalidArgumentException('Fund out amount must be positive.');
        }

        return $this->recordDoubleEntry(
            date: $date,
            description: $description,
            referenceType: 'fund_out',
            referenceId: null,
            entries: [
                [self::CAPITAL, $amount, 0],
                [self::CASH, 0, $amount],
            ]
        );
    }

    /**
     * Record fixed asset purchase: Debit Fixed Assets, Credit Cash.
     */
    public function recordFixedAssetPurchase(string $date, string $description, float $amount): AccountingTransaction
    {
        if ($amount <= 0) {
            throw new \InvalidArgumentException('Amount must be positive.');
        }

        return $this->recordDoubleEntry(
            date: $date,
            description: $description,
            referenceType: 'fixed_asset',
            referenceId: null,
            entries: [
                [self::FIXED_ASSETS, $amount, 0],
                [self::CASH, 0, $amount],
            ]
        );
    }

    /**
     * Record purchase (stock/cost): Debit Purchases, Credit Cash.
     */
    public function recordPurchase(string $date, string $description, float $amount): AccountingTransaction
    {
        if ($amount <= 0) {
            throw new \InvalidArgumentException('Purchase amount must be positive.');
        }

        return $this->recordDoubleEntry(
            date: $date,
            description: $description,
            referenceType: 'purchase',
            referenceId: null,
            entries: [
                [self::PURCHASES, $amount, 0],
                [self::CASH, 0, $amount],
            ]
        );
    }

    /**
     * Record opening balance for Cash & Bank: Debit Cash, Credit Capital.
     */
    public function recordOpeningBalance(string $date, float $amount): AccountingTransaction
    {
        if ($amount <= 0) {
            throw new \InvalidArgumentException('Opening balance must be positive.');
        }

        return $this->recordDoubleEntry(
            date: $date,
            description: 'Opening balance',
            referenceType: 'opening_balance',
            referenceId: null,
            entries: [
                [self::CASH, $amount, 0],
                [self::CAPITAL, 0, $amount],
            ]
        );
    }

    /**
     * Delete a transaction and its entries. Only for manual transactions (not order).
     */
    public function deleteTransaction(AccountingTransaction $transaction): void
    {
        if ($transaction->reference_type === 'order') {
            throw new \InvalidArgumentException('Cannot delete a sale transaction.');
        }

        DB::transaction(function () use ($transaction): void {
            $transaction->entries()->delete();
            $transaction->delete();
        });
    }

    /**
     * Update a manual transaction (date, description, type, amount). Not for order.
     */
    public function updateTransaction(AccountingTransaction $transaction, string $date, string $description, string $type, float $amount): AccountingTransaction
    {
        if ($transaction->reference_type === 'order') {
            throw new \InvalidArgumentException('Cannot edit a sale transaction.');
        }

        if ($amount <= 0) {
            throw new \InvalidArgumentException('Amount must be positive.');
        }

        $entries = $transaction->entries()->with('account')->get();
        $cashEntry = $entries->firstWhere('account.code', self::CASH);
        $otherEntry = $entries->firstWhere('account.code', '!=', self::CASH);
        if (! $cashEntry || ! $otherEntry) {
            throw new \RuntimeException('Transaction entries not found.');
        }

        $debitCredit = match ($type) {
            'expense' => [[self::OPERATING_EXPENSE, $amount, 0], [self::CASH, 0, $amount]],
            'fund_in' => [[self::CASH, $amount, 0], [self::CAPITAL, 0, $amount]],
            'fund_out' => [[self::CAPITAL, $amount, 0], [self::CASH, 0, $amount]],
            'fixed_asset' => [[self::FIXED_ASSETS, $amount, 0], [self::CASH, 0, $amount]],
            'purchase' => [[self::PURCHASES, $amount, 0], [self::CASH, 0, $amount]],
            'opening_balance' => [[self::CASH, $amount, 0], [self::CAPITAL, 0, $amount]],
            default => throw new \InvalidArgumentException('Invalid transaction type.'),
        };

        return DB::transaction(function () use ($transaction, $date, $description, $type, $debitCredit): AccountingTransaction {
            $transaction->update([
                'date' => $date,
                'description' => $description,
                'reference_type' => $type,
            ]);

            $transaction->entries()->delete();

            foreach ($debitCredit as [$code, $debit, $credit]) {
                $account = $this->accountByCode($code);
                AccountingEntry::create([
                    'accounting_transaction_id' => $transaction->id,
                    'accounting_account_id' => $account->id,
                    'debit' => $debit,
                    'credit' => $credit,
                ]);
            }

            return $transaction->load('entries.account');
        });
    }

    /**
     * @param  array<int, array{0: string, 1: float, 2: float}>  $entries  [code, debit, credit]
     */
    private function recordDoubleEntry(
        string $date,
        string $description,
        ?string $referenceType,
        ?int $referenceId,
        array $entries
    ): AccountingTransaction {
        $totalDebit = 0.0;
        $totalCredit = 0.0;
        foreach ($entries as [, $debit, $credit]) {
            $totalDebit += $debit;
            $totalCredit += $credit;
        }
        if (abs($totalDebit - $totalCredit) > 0.01) {
            throw new \InvalidArgumentException('Debit and credit must be equal.');
        }

        return DB::transaction(function () use ($date, $description, $referenceType, $referenceId, $entries) {
            $tx = AccountingTransaction::create([
                'date' => $date,
                'description' => $description,
                'reference_type' => $referenceType,
                'reference_id' => $referenceId,
            ]);

            foreach ($entries as [$code, $debit, $credit]) {
                $account = $this->accountByCode($code);
                AccountingEntry::create([
                    'accounting_transaction_id' => $tx->id,
                    'accounting_account_id' => $account->id,
                    'debit' => $debit,
                    'credit' => $credit,
                ]);
            }

            return $tx->load('entries.account');
        });
    }

    private function accountByCode(string $code): AccountingAccount
    {
        $account = AccountingAccount::where('code', $code)->first();
        if (! $account) {
            throw new \RuntimeException("Accounting account not found: {$code}. Run AccountingSeeder.");
        }

        return $account;
    }

    /**
     * Get Cash & Bank account id for reports.
     */
    public function cashAccountId(): int
    {
        return $this->accountByCode(self::CASH)->id;
    }

    /**
     * Current Cash & Bank balance (as of today). Returns null if accounting not set up.
     */
    public function getCurrentCashBalance(): ?float
    {
        try {
            $cashId = $this->cashAccountId();
        } catch (\Throwable) {
            return null;
        }

        $balance = (float) AccountingEntry::query()
            ->join('accounting_transactions', 'accounting_entries.accounting_transaction_id', '=', 'accounting_transactions.id')
            ->where('accounting_account_id', $cashId)
            ->where('accounting_transactions.date', '<=', now()->toDateString())
            ->selectRaw('COALESCE(SUM(accounting_entries.debit) - SUM(accounting_entries.credit), 0) as bal')
            ->value('bal');

        return round($balance, 2);
    }

    /**
     * Bank Report: one row per day. Debit (Sale, Opening, Fund in) | Credit (Expense, Purchase, Fund out, Fixed asset) | Balance.
     * Sale and Opening are Debit to cash (money in).
     *
     * @return array{opening_balance: float, rows: array, debit_columns: array, credit_columns: array, month_label: string, totals: array}
     */
    public function bankReport(string $yearMonth): array
    {
        $cashId = $this->cashAccountId();
        $start = $yearMonth.'-01';
        $end = date('Y-m-t', strtotime($start));

        $openingBalance = (float) AccountingEntry::query()
            ->join('accounting_transactions', 'accounting_entries.accounting_transaction_id', '=', 'accounting_transactions.id')
            ->where('accounting_account_id', $cashId)
            ->where('accounting_transactions.date', '<', $start)
            ->selectRaw('COALESCE(SUM(accounting_entries.debit) - SUM(accounting_entries.credit), 0) as bal')
            ->value('bal');

        $debitTypes = ['order', 'opening_balance', 'fund_in'];
        $creditTypes = ['expense', 'purchase', 'fund_out', 'fixed_asset'];

        $entries = AccountingEntry::query()
            ->join('accounting_transactions', 'accounting_entries.accounting_transaction_id', '=', 'accounting_transactions.id')
            ->where('accounting_account_id', $cashId)
            ->whereBetween('accounting_transactions.date', [$start, $end])
            ->select([
                'accounting_transactions.date',
                'accounting_transactions.reference_type',
                'accounting_entries.debit',
                'accounting_entries.credit',
            ])
            ->get();

        $byDate = [];
        foreach ($entries as $e) {
            $d = \Carbon\Carbon::parse($e->date)->format('Y-m-d');
            if (! isset($byDate[$d])) {
                $byDate[$d] = array_fill_keys(array_merge($debitTypes, $creditTypes), 0.0);
                $byDate[$d]['total_debit'] = 0.0;
                $byDate[$d]['total_credit'] = 0.0;
            }
            $type = $e->reference_type ?? '';
            $debit = (float) $e->debit;
            $credit = (float) $e->credit;
            if (in_array($type, $debitTypes, true) && $debit > 0) {
                $byDate[$d][$type] += $debit;
                $byDate[$d]['total_debit'] += $debit;
            }
            if (in_array($type, $creditTypes, true) && $credit > 0) {
                $byDate[$d][$type] += $credit;
                $byDate[$d]['total_credit'] += $credit;
            }
        }

        $rows = [];
        $running = $openingBalance;
        $period = new \DatePeriod(
            new \DateTime($start),
            new \DateInterval('P1D'),
            (new \DateTime($end))->modify('+1 day')
        );
        foreach ($period as $d) {
            $dateStr = $d->format('Y-m-d');
            $day = $byDate[$dateStr] ?? null;
            $totalDebit = $day['total_debit'] ?? 0.0;
            $totalCredit = $day['total_credit'] ?? 0.0;
            $running += $totalDebit - $totalCredit;

            $row = ['date' => $dateStr, 'balance' => round($running, 2)];
            foreach ($debitTypes as $t) {
                $row['debit_'.$t] = round($day[$t] ?? 0, 2);
            }
            $row['total_debit'] = round($totalDebit, 2);
            foreach ($creditTypes as $t) {
                $row['credit_'.$t] = round($day[$t] ?? 0, 2);
            }
            $row['total_credit'] = round($totalCredit, 2);
            $rows[] = $row;
        }

        $totals = [
            'total_debit' => round(array_sum(array_column($rows, 'total_debit')), 2),
            'total_credit' => round(array_sum(array_column($rows, 'total_credit')), 2),
        ];
        foreach ($debitTypes as $t) {
            $totals['debit_'.$t] = round(array_sum(array_column($rows, 'debit_'.$t)), 2);
        }
        foreach ($creditTypes as $t) {
            $totals['credit_'.$t] = round(array_sum(array_column($rows, 'credit_'.$t)), 2);
        }

        return [
            'opening_balance' => round($openingBalance, 2),
            'rows' => $rows,
            'debit_columns' => $debitTypes,
            'credit_columns' => $creditTypes,
            'month_label' => date('F Y', strtotime($start)),
            'totals' => $totals,
        ];
    }

    /**
     * Receipt & Payment: Left = Opening + Receipts, Right = Payments + Closing. Current + Cumulative totals.
     *
     * @return array{opening_balance: float, receipts: array, payments: array, closing_balance: float, total_left: float, total_right: float, total_left_cumulative: float, total_right_cumulative: float, period_label: string}
     */
    public function receiptPaymentReport(string $dateFrom, string $dateTo): array
    {
        $cashId = $this->cashAccountId();

        $openingBalance = (float) AccountingEntry::query()
            ->join('accounting_transactions', 'accounting_entries.accounting_transaction_id', '=', 'accounting_transactions.id')
            ->where('accounting_account_id', $cashId)
            ->where('accounting_transactions.date', '<', $dateFrom)
            ->selectRaw('COALESCE(SUM(accounting_entries.debit) - SUM(accounting_entries.credit), 0) as bal')
            ->value('bal');

        $receipts = AccountingEntry::query()
            ->join('accounting_transactions', 'accounting_entries.accounting_transaction_id', '=', 'accounting_transactions.id')
            ->where('accounting_account_id', $cashId)
            ->whereBetween('accounting_transactions.date', [$dateFrom, $dateTo])
            ->where('accounting_entries.debit', '>', 0)
            ->selectRaw('accounting_transactions.date as date, accounting_transactions.description as description, accounting_entries.debit as amount')
            ->orderBy('accounting_transactions.date')
            ->get()
            ->map(fn ($r) => ['date' => $r->date, 'description' => $r->description, 'amount' => (float) $r->amount]);

        $payments = AccountingEntry::query()
            ->join('accounting_transactions', 'accounting_entries.accounting_transaction_id', '=', 'accounting_transactions.id')
            ->where('accounting_account_id', $cashId)
            ->whereBetween('accounting_transactions.date', [$dateFrom, $dateTo])
            ->where('accounting_entries.credit', '>', 0)
            ->selectRaw('accounting_transactions.date as date, accounting_transactions.description as description, accounting_entries.credit as amount')
            ->orderBy('accounting_transactions.date')
            ->get()
            ->map(fn ($r) => ['date' => $r->date, 'description' => $r->description, 'amount' => (float) $r->amount]);

        $closingBalance = $openingBalance
            + $receipts->sum('amount')
            - $payments->sum('amount');

        $totalReceipts = $receipts->sum('amount');
        $totalPayments = $payments->sum('amount');
        $totalLeft = $openingBalance + $totalReceipts;
        $totalRight = $totalPayments + $closingBalance;

        $cumulativeReceipts = (float) AccountingEntry::query()
            ->join('accounting_transactions', 'accounting_entries.accounting_transaction_id', '=', 'accounting_transactions.id')
            ->where('accounting_account_id', $cashId)
            ->where('accounting_transactions.date', '<=', $dateTo)
            ->where('accounting_entries.debit', '>', 0)
            ->selectRaw('COALESCE(SUM(accounting_entries.debit), 0) as amt')
            ->value('amt');

        $cumulativePayments = (float) AccountingEntry::query()
            ->join('accounting_transactions', 'accounting_entries.accounting_transaction_id', '=', 'accounting_transactions.id')
            ->where('accounting_account_id', $cashId)
            ->where('accounting_transactions.date', '<=', $dateTo)
            ->where('accounting_entries.credit', '>', 0)
            ->selectRaw('COALESCE(SUM(accounting_entries.credit), 0) as amt')
            ->value('amt');

        $totalLeftCumulative = $openingBalance + $cumulativeReceipts;
        $totalRightCumulative = $cumulativePayments + $closingBalance;

        return [
            'opening_balance' => round($openingBalance, 2),
            'receipts' => $receipts->values()->all(),
            'payments' => $payments->values()->all(),
            'closing_balance' => round($closingBalance, 2),
            'total_left' => round($totalLeft, 2),
            'total_right' => round($totalRight, 2),
            'total_left_cumulative' => round($totalLeftCumulative, 2),
            'total_right_cumulative' => round($totalRightCumulative, 2),
            'period_label' => $dateFrom.' to '.$dateTo,
        ];
    }

    /**
     * Income & Expenditure for period with Current Period and Cumulative amounts.
     *
     * @return array{income: array, expenditure: array, income_total: float, expenditure_total: float, income_total_cumulative: float, expenditure_total_cumulative: float, surplus: float, surplus_cumulative: float, period_label: string}
     */
    public function incomeExpenditureReport(string $dateFrom, string $dateTo): array
    {
        $incomeAccounts = AccountingAccount::where('type', 'income')->get();
        $expenseAccounts = AccountingAccount::where('type', 'expense')->get();

        $incomeRows = [];
        foreach ($incomeAccounts as $account) {
            $current = (float) AccountingEntry::query()
                ->join('accounting_transactions', 'accounting_entries.accounting_transaction_id', '=', 'accounting_transactions.id')
                ->where('accounting_account_id', $account->id)
                ->whereBetween('accounting_transactions.date', [$dateFrom, $dateTo])
                ->selectRaw('COALESCE(SUM(accounting_entries.credit) - SUM(accounting_entries.debit), 0) as amt')
                ->value('amt');
            $cumulative = (float) AccountingEntry::query()
                ->join('accounting_transactions', 'accounting_entries.accounting_transaction_id', '=', 'accounting_transactions.id')
                ->where('accounting_account_id', $account->id)
                ->where('accounting_transactions.date', '<=', $dateTo)
                ->selectRaw('COALESCE(SUM(accounting_entries.credit) - SUM(accounting_entries.debit), 0) as amt')
                ->value('amt');
            if (abs($current) >= 0.01 || abs($cumulative) >= 0.01) {
                $incomeRows[] = [
                    'name' => $account->name,
                    'code' => $account->code,
                    'amount' => round($current, 2),
                    'cumulative' => round($cumulative, 2),
                ];
            }
        }

        $expenseRows = [];
        foreach ($expenseAccounts as $account) {
            $current = (float) AccountingEntry::query()
                ->join('accounting_transactions', 'accounting_entries.accounting_transaction_id', '=', 'accounting_transactions.id')
                ->where('accounting_account_id', $account->id)
                ->whereBetween('accounting_transactions.date', [$dateFrom, $dateTo])
                ->selectRaw('COALESCE(SUM(accounting_entries.debit) - SUM(accounting_entries.credit), 0) as amt')
                ->value('amt');
            $cumulative = (float) AccountingEntry::query()
                ->join('accounting_transactions', 'accounting_entries.accounting_transaction_id', '=', 'accounting_transactions.id')
                ->where('accounting_account_id', $account->id)
                ->where('accounting_transactions.date', '<=', $dateTo)
                ->selectRaw('COALESCE(SUM(accounting_entries.debit) - SUM(accounting_entries.credit), 0) as amt')
                ->value('amt');
            if (abs($current) >= 0.01 || abs($cumulative) >= 0.01) {
                $expenseRows[] = [
                    'name' => $account->name,
                    'code' => $account->code,
                    'amount' => round($current, 2),
                    'cumulative' => round($cumulative, 2),
                ];
            }
        }

        $incomeTotal = array_sum(array_column($incomeRows, 'amount'));
        $expenditureTotal = array_sum(array_column($expenseRows, 'amount'));
        $incomeTotalCumulative = array_sum(array_column($incomeRows, 'cumulative'));
        $expenditureTotalCumulative = array_sum(array_column($expenseRows, 'cumulative'));

        return [
            'income' => $incomeRows,
            'expenditure' => $expenseRows,
            'income_total' => round($incomeTotal, 2),
            'expenditure_total' => round($expenditureTotal, 2),
            'income_total_cumulative' => round($incomeTotalCumulative, 2),
            'expenditure_total_cumulative' => round($expenditureTotalCumulative, 2),
            'surplus' => round($incomeTotal - $expenditureTotal, 2),
            'surplus_cumulative' => round($incomeTotalCumulative - $expenditureTotalCumulative, 2),
            'period_label' => $dateFrom.' to '.$dateTo,
        ];
    }

    /**
     * Balance Sheet as of date. Left = Assets, Right = Liabilities + Equity.
     *
     * @return array{assets: array, liabilities_equity: array, total_assets: float, total_liabilities_equity: float, as_of_date: string}
     */
    public function balanceSheetReport(string $asOfDate): array
    {
        $assetAccounts = AccountingAccount::where('type', 'asset')->orderBy('code')->get();
        $equityAccounts = AccountingAccount::where('type', 'equity')->orderBy('code')->get();
        $liabilityAccounts = AccountingAccount::where('type', 'liability')->orderBy('code')->get();

        $balanceForAccount = function (AccountingAccount $account) use ($asOfDate): float {
            $debit = (float) AccountingEntry::query()
                ->join('accounting_transactions', 'accounting_entries.accounting_transaction_id', '=', 'accounting_transactions.id')
                ->where('accounting_account_id', $account->id)
                ->where('accounting_transactions.date', '<=', $asOfDate)
                ->sum('accounting_entries.debit');
            $credit = (float) AccountingEntry::query()
                ->join('accounting_transactions', 'accounting_entries.accounting_transaction_id', '=', 'accounting_transactions.id')
                ->where('accounting_account_id', $account->id)
                ->where('accounting_transactions.date', '<=', $asOfDate)
                ->sum('accounting_entries.credit');

            if (in_array($account->type, ['asset', 'expense'], true)) {
                return $debit - $credit;
            }

            return $credit - $debit;
        };

        $assets = [];
        foreach ($assetAccounts as $a) {
            $bal = $balanceForAccount($a);
            if (abs($bal) >= 0.01) {
                $assets[] = ['name' => $a->name, 'code' => $a->code, 'balance' => round($bal, 2)];
            }
        }

        $liabilitiesEquity = [];
        foreach ($liabilityAccounts->merge($equityAccounts) as $a) {
            $bal = $balanceForAccount($a);
            if (abs($bal) >= 0.01) {
                $liabilitiesEquity[] = ['name' => $a->name, 'code' => $a->code, 'balance' => round($bal, 2)];
            }
        }

        $incomeAccounts = AccountingAccount::where('type', 'income')->pluck('id');
        $expenseAccounts = AccountingAccount::where('type', 'expense')->pluck('id');
        $incomeTotal = (float) AccountingEntry::query()
            ->join('accounting_transactions', 'accounting_entries.accounting_transaction_id', '=', 'accounting_transactions.id')
            ->whereIn('accounting_account_id', $incomeAccounts)
            ->where('accounting_transactions.date', '<=', $asOfDate)
            ->selectRaw('COALESCE(SUM(accounting_entries.credit) - SUM(accounting_entries.debit), 0) as t')
            ->value('t');
        $expenseTotal = (float) AccountingEntry::query()
            ->join('accounting_transactions', 'accounting_entries.accounting_transaction_id', '=', 'accounting_transactions.id')
            ->whereIn('accounting_account_id', $expenseAccounts)
            ->where('accounting_transactions.date', '<=', $asOfDate)
            ->selectRaw('COALESCE(SUM(accounting_entries.debit) - SUM(accounting_entries.credit), 0) as t')
            ->value('t');
        $retainedEarnings = $incomeTotal - $expenseTotal;
        if (abs($retainedEarnings) >= 0.01) {
            $liabilitiesEquity[] = ['name' => 'Retained Earnings', 'code' => '3900', 'balance' => round($retainedEarnings, 2)];
        }

        $totalAssets = array_sum(array_column($assets, 'balance'));
        $totalLiabilitiesEquity = array_sum(array_column($liabilitiesEquity, 'balance'));

        return [
            'assets' => $assets,
            'liabilities_equity' => $liabilitiesEquity,
            'total_assets' => round($totalAssets, 2),
            'total_liabilities_equity' => round($totalLiabilitiesEquity, 2),
            'as_of_date' => $asOfDate,
        ];
    }
}
