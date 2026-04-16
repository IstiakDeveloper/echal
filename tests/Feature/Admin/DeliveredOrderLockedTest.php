<?php

use App\Models\Order;
use App\Models\User;
use Database\Seeders\AccountingSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('prevents changing status after delivered', function () {
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

    $this->actingAs($admin);

    $this->patch("/admin/orders/{$order->id}/status", ['status' => 'delivered'])->assertRedirect();
    $order->refresh();
    expect($order->status)->toBe('delivered');

    $this->patch("/admin/orders/{$order->id}/status", ['status' => 'cancelled'])
        ->assertRedirect()
        ->assertSessionHas('error');

    $order->refresh();
    expect($order->status)->toBe('delivered');
});
