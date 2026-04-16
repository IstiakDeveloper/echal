<?php

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;

uses(RefreshDatabase::class);

it('imports products from a CSV file', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $this->actingAs($admin);

    $csv = implode("\n", [
        'category,name,price,slug,description,image,stock,is_active',
        'Grocery,Rice 5kg,450,rice-5kg,Good rice,,10,1',
        'Grocery,Salt 1kg,50,,Fine salt,,0,true',
    ]);

    $file = UploadedFile::fake()->createWithContent('products.csv', $csv);

    $this->post('/admin/products/import/csv', [
        'file' => $file,
    ])->assertRedirect('/admin/products');

    expect(Product::query()->count())->toBe(2);
    expect(Product::query()->where('slug', 'rice-5kg')->exists())->toBeTrue();
});
