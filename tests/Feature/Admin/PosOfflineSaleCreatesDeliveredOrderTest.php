<?php

use App\Models\AccountingTransaction;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Database\Seeders\AccountingSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('creates a delivered order and records accounting sale from POS', function () {
    $this->seed(AccountingSeeder::class);

    $admin = User::factory()->create(['role' => 'admin']);
    $this->actingAs($admin);

    $productA = Product::factory()->create(['price' => 100, 'stock' => 10]);
    $productB = Product::factory()->create(['price' => 50, 'stock' => 10]);

    $this->post('/admin/pos', [
        'phone' => '01700000000',
        'discount' => 20,
        'items' => [
            ['product_id' => $productA->id, 'quantity' => 2],
            ['product_id' => $productB->id, 'quantity' => 1],
        ],
    ])->assertRedirect();

    $order = Order::query()->latest('id')->firstOrFail();

    expect($order->status)->toBe('delivered')
        ->and((float) $order->discount)->toBe(20.0)
        ->and((float) $order->total)->toBe(230.0);

    $productA->refresh();
    $productB->refresh();
    expect((int) $productA->stock)->toBe(8)
        ->and((int) $productB->stock)->toBe(9);

    expect(
        AccountingTransaction::query()
            ->where('reference_type', 'order')
            ->where('reference_id', $order->id)
            ->count()
    )->toBe(1);
});

it('prevents POS sale when stock is insufficient', function () {
    $this->seed(AccountingSeeder::class);

    $admin = User::factory()->create(['role' => 'admin']);
    $this->actingAs($admin);

    $product = Product::factory()->create(['price' => 100, 'stock' => 0]);

    $this->post('/admin/pos', [
        'phone' => '01700000000',
        'items' => [
            ['product_id' => $product->id, 'quantity' => 1],
        ],
    ])->assertRedirect();

    expect(Order::query()->count())->toBe(0);
});
