<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('accounting_accounts', function (Blueprint $table) {
            $table->id();
            $table->string('code', 20)->unique();
            $table->string('name');
            $table->string('type', 20); // asset, liability, equity, income, expense
            $table->timestamps();
        });

        Schema::create('accounting_transactions', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->string('description');
            $table->string('reference_type', 50)->nullable(); // order, expense, fund_in, fund_out, fixed_asset, opening_balance
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->timestamps();
        });

        Schema::create('accounting_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('accounting_transaction_id')->constrained()->cascadeOnDelete();
            $table->foreignId('accounting_account_id')->constrained()->cascadeOnDelete();
            $table->decimal('debit', 15, 2)->default(0);
            $table->decimal('credit', 15, 2)->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('accounting_entries');
        Schema::dropIfExists('accounting_transactions');
        Schema::dropIfExists('accounting_accounts');
    }
};
