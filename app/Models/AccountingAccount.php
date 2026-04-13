<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AccountingAccount extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'code',
        'name',
        'type',
    ];

    /**
     * @return HasMany<AccountingEntry, $this>
     */
    public function entries(): HasMany
    {
        return $this->hasMany(AccountingEntry::class);
    }
}
