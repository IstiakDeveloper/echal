<?php

use App\Models\Product;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;

uses(RefreshDatabase::class);

it('returns no-store headers for cart json responses', function () {
    $product = Product::factory()->create([
        'name' => 'Test '.Str::random(6),
        'price' => 100,
        'is_active' => true,
    ]);

    $this->withoutMiddleware(VerifyCsrfToken::class);

    $r1 = $this->getJson('/cart')->assertOk();
    expect((string) $r1->headers->get('Cache-Control'))->toContain('no-store');

    $r2 = $this->postJson('/cart', [
        'product_id' => $product->id,
        'quantity' => 1,
    ])
        ->assertOk()
        ->assertJsonStructure(['cart' => ['count', 'items']]);
    expect((string) $r2->headers->get('Cache-Control'))->toContain('no-store');

    $r3 = $this->postJson('/cart/buy-now', [
        'product_id' => $product->id,
    ])
        ->assertOk()
        ->assertJsonStructure(['redirect', 'cart' => ['count', 'items']]);
    expect((string) $r3->headers->get('Cache-Control'))->toContain('no-store');
});
