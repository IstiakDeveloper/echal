<?php

use App\Models\AccountingTransaction;
use App\Models\Order;
use App\Models\User;
use Database\Seeders\AccountingSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('does not record sale transaction until order is delivered', function () {
    $this->seed(AccountingSeeder::class);

    $admin = User::factory()->create(['role' => 'admin']);
    $user = User::factory()->create();

    $order = Order::query()->create([
        'user_id' => $user->id,
        'phone' => '01700000000',
        'division' => 'Dhaka',
        'district' => 'Dhaka',
        'upazila' => 'Savar',
        'address' => 'Test address',
        'subtotal' => 1400,
        'delivery_amount' => 100,
        'total' => 1500,
        'status' => 'pending',
    ]);

    expect(AccountingTransaction::query()->where('reference_type', 'order')->where('reference_id', $order->id)->count())
        ->toBe(0);

    $order->update(['status' => 'processing']);
    expect(AccountingTransaction::query()->where('reference_type', 'order')->where('reference_id', $order->id)->count())
        ->toBe(0);

    // Simulate admin status update to delivered which should record sale.
    $this->actingAs($admin);
    $this->patch("/admin/orders/{$order->id}/status", ['status' => 'delivered'])
        ->assertRedirect();

    expect(AccountingTransaction::query()->where('reference_type', 'order')->where('reference_id', $order->id)->count())
        ->toBe(1);

    // Idempotent: updating again should not create a second transaction.
    $this->patch("/admin/orders/{$order->id}/status", ['status' => 'delivered'])
        ->assertRedirect();

    expect(AccountingTransaction::query()->where('reference_type', 'order')->where('reference_id', $order->id)->count())
        ->toBe(1);
});
