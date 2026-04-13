<?php

namespace Database\Seeders;

use App\Models\AccountingAccount;
use Illuminate\Database\Seeder;

class AccountingSeeder extends Seeder
{
    /**
     * Chart of Accounts — single main account (Cash & Bank) + classification accounts for reports.
     *
     * @return void
     */
    public function run(): void
    {
        $accounts = [
            ['code' => '1000', 'name' => 'Cash & Bank', 'type' => 'asset'],
            ['code' => '2000', 'name' => 'Inventory', 'type' => 'asset'],
            ['code' => '3000', 'name' => 'Fixed Assets', 'type' => 'asset'],
            ['code' => '4000', 'name' => 'Sales', 'type' => 'income'],
            ['code' => '5000', 'name' => 'Purchases', 'type' => 'expense'],
            ['code' => '6000', 'name' => 'Operating Expense', 'type' => 'expense'],
            ['code' => '7000', 'name' => 'Capital', 'type' => 'equity'],
        ];

        foreach ($accounts as $account) {
            AccountingAccount::firstOrCreate(
                ['code' => $account['code']],
                $account
            );
        }
    }
}
