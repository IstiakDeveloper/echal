<?php

use App\Models\Product;
use Inertia\Testing\AssertableInertia as Assert;

test('home popular rice prioritizes in-stock before limiting', function () {
    Product::factory()->create([
        'name' => 'AAAA Out of stock',
        'stock' => 0,
        'is_active' => true,
        'is_featured' => true,
    ]);

    Product::factory()->create([
        'name' => 'ZZZZ In stock',
        'stock' => 5,
        'is_active' => true,
        'is_featured' => true,
    ]);

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('store/home')
            ->has('featuredProducts', 2)
            ->where('featuredProducts.0.stock', fn (mixed $value): bool => (int) $value > 0));
});

test('home popular rice shows only featured products when set', function () {
    Product::factory()->create([
        'name' => 'Not featured',
        'stock' => 10,
        'is_active' => true,
        'is_featured' => false,
    ]);

    $featured = Product::factory()->create([
        'name' => 'Featured',
        'stock' => 10,
        'is_active' => true,
        'is_featured' => true,
    ]);

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('store/home')
            ->has('featuredProducts', 1)
            ->where('featuredProducts.0.id', $featured->id));
});
