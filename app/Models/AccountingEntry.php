<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AccountingEntry extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'accounting_transaction_id',
        'accounting_account_id',
        'debit',
        'credit',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'debit' => 'decimal:2',
            'credit' => 'decimal:2',
        ];
    }

    /**
     * @return BelongsTo<AccountingTransaction, $this>
     */
    public function transaction(): BelongsTo
    {
        return $this->belongsTo(AccountingTransaction::class, 'accounting_transaction_id');
    }

    /**
     * @return BelongsTo<AccountingAccount, $this>
     */
    public function account(): BelongsTo
    {
        return $this->belongsTo(AccountingAccount::class, 'accounting_account_id');
    }
}
