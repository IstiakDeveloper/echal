<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AccountingTransaction extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'date',
        'description',
        'reference_type',
        'reference_id',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'date' => 'date',
        ];
    }

    /**
     * @return HasMany<AccountingEntry, $this>
     */
    public function entries(): HasMany
    {
        return $this->hasMany(AccountingEntry::class);
    }
}
