<?php

use App\Models\DeliveryAmount;
use App\Models\Order;
use App\Models\Product;

it('charges 150 delivery by default', function () {
    /** @var \Tests\TestCase $this */
    $product = Product::factory()->create([
        'price' => 100,
        'stock' => 10,
    ]);

    $this->withSession([
        'cart' => [
            'items' => [
                (string) $product->id => ['quantity' => 2],
            ],
        ],
    ])
        ->post(route('checkout.store'), [
            'division' => 'Dhaka',
            'district' => 'Dhaka',
            'upazila' => 'Dhanmondi',
            'address' => 'House 1, Road 1',
            'phone' => '01700000000',
        ])
        ->assertRedirect(route('checkout.complete'));

    $order = Order::query()->latest('id')->firstOrFail();

    expect((float) $order->subtotal)->toBe(200.0)
        ->and((float) $order->delivery_amount)->toBe(150.0)
        ->and((float) $order->total)->toBe(350.0);
});

it('uses configured delivery amount only when it is lower than 150', function () {
    /** @var \Tests\TestCase $this */
    $product = Product::factory()->create([
        'price' => 100,
        'stock' => 10,
    ]);

    DeliveryAmount::create([
        'division' => 'Dhaka',
        'district' => 'Dhaka',
        'upazila' => 'Dhanmondi',
        'amount' => 100,
        'is_active' => true,
    ]);

    $this->withSession([
        'cart' => [
            'items' => [
                (string) $product->id => ['quantity' => 2],
            ],
        ],
    ])
        ->post(route('checkout.store'), [
            'division' => 'Dhaka',
            'district' => 'Dhaka',
            'upazila' => 'Dhanmondi',
            'address' => 'House 1, Road 1',
            'phone' => '01700000001',
        ])
        ->assertRedirect(route('checkout.complete'));

    $order = Order::query()->latest('id')->firstOrFail();

    expect((float) $order->delivery_amount)->toBe(100.0)
        ->and((float) $order->total)->toBe(300.0);

    DeliveryAmount::query()->delete();
    Order::query()->delete();

    DeliveryAmount::create([
        'division' => 'Dhaka',
        'district' => 'Dhaka',
        'upazila' => 'Dhanmondi',
        'amount' => 200,
        'is_active' => true,
    ]);

    $this->withSession([
        'cart' => [
            'items' => [
                (string) $product->id => ['quantity' => 2],
            ],
        ],
    ])
        ->post(route('checkout.store'), [
            'division' => 'Dhaka',
            'district' => 'Dhaka',
            'upazila' => 'Dhanmondi',
            'address' => 'House 1, Road 1',
            'phone' => '01700000002',
        ])
        ->assertRedirect(route('checkout.complete'));

    $order = Order::query()->latest('id')->firstOrFail();

    expect((float) $order->delivery_amount)->toBe(150.0)
        ->and((float) $order->total)->toBe(350.0);
});
