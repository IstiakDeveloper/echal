<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Miniket',
                'slug' => 'miniket',
                'description' => 'Premium long-grain aromatic rice, popular for daily use and special occasions.',
                'sort_order' => 1,
            ],
            [
                'name' => 'Chinigura',
                'slug' => 'chinigura',
                'description' => 'Short-grain fragrant rice with a distinct aroma, ideal for biryani and polao.',
                'sort_order' => 2,
            ],
            [
                'name' => 'Katari Bhog',
                'slug' => 'katari-bhog',
                'description' => 'Fine aromatic rice variety, known for soft texture and rich taste.',
                'sort_order' => 3,
            ],
            [
                'name' => 'Basmati',
                'slug' => 'basmati',
                'description' => 'Long-grain aromatic rice, aged for enhanced flavour and elongation.',
                'sort_order' => 4,
            ],
            [
                'name' => 'Premium / BR-28',
                'slug' => 'premium-br28',
                'description' => 'High-quality parboiled and white rice options for everyday meals.',
                'sort_order' => 5,
            ],
        ];

        $createdCategories = [];
        foreach ($categories as $cat) {
            $createdCategories[$cat['slug']] = Category::firstOrCreate(
                ['slug' => $cat['slug']],
                $cat
            );
        }

        $products = [
            [
                'category' => 'miniket',
                'name' => 'Miniket Premium 5 kg',
                'slug' => 'miniket-premium-5kg',
                'description' => 'Premium Miniket rice, 5 kg pack. Clean, long grain, perfect for daily cooking.',
                'price' => 450.00,
                'stock' => 120,
            ],
            [
                'category' => 'miniket',
                'name' => 'Miniket Premium 25 kg',
                'slug' => 'miniket-premium-25kg',
                'description' => 'Miniket rice in 25 kg bag. Best value for families and small businesses.',
                'price' => 2100.00,
                'stock' => 80,
            ],
            [
                'category' => 'chinigura',
                'name' => 'Chinigura Aromatic 2 kg',
                'slug' => 'chinigura-aromatic-2kg',
                'description' => 'Premium Chinigura, 2 kg. Ideal for biryani, polao and special dishes.',
                'price' => 380.00,
                'stock' => 95,
            ],
            [
                'category' => 'chinigura',
                'name' => 'Chinigura Aromatic 5 kg',
                'slug' => 'chinigura-aromatic-5kg',
                'description' => 'Chinigura rice 5 kg pack. Fragrant and fluffy when cooked.',
                'price' => 920.00,
                'stock' => 60,
            ],
            [
                'category' => 'katari-bhog',
                'name' => 'Katari Bhog Fine 2 kg',
                'slug' => 'katari-bhog-fine-2kg',
                'description' => 'Fine Katari Bhog rice, 2 kg. Soft texture and rich taste.',
                'price' => 420.00,
                'stock' => 70,
            ],
            [
                'category' => 'katari-bhog',
                'name' => 'Katari Bhog Fine 5 kg',
                'slug' => 'katari-bhog-fine-5kg',
                'description' => 'Katari Bhog 5 kg pack. Perfect for everyday premium meals.',
                'price' => 1000.00,
                'stock' => 55,
            ],
            [
                'category' => 'basmati',
                'name' => 'Basmati Long Grain 1 kg',
                'slug' => 'basmati-long-grain-1kg',
                'description' => 'Aged Basmati, 1 kg. Long grain, non-sticky, ideal for pulao and biryani.',
                'price' => 320.00,
                'stock' => 100,
            ],
            [
                'category' => 'basmati',
                'name' => 'Basmati Long Grain 5 kg',
                'slug' => 'basmati-long-grain-5kg',
                'description' => 'Premium Basmati rice 5 kg. Elongates on cooking with a distinct aroma.',
                'price' => 1550.00,
                'stock' => 45,
            ],
            [
                'category' => 'premium-br28',
                'name' => 'BR-28 Parboiled 5 kg',
                'slug' => 'br28-parboiled-5kg',
                'description' => 'BR-28 parboiled rice 5 kg. Nutritious and filling, great for daily use.',
                'price' => 380.00,
                'stock' => 150,
            ],
            [
                'category' => 'premium-br28',
                'name' => 'Premium White Rice 10 kg',
                'slug' => 'premium-white-rice-10kg',
                'description' => 'Premium white rice 10 kg bag. Clean, medium grain, good for all dishes.',
                'price' => 720.00,
                'stock' => 90,
            ],
        ];

        foreach ($products as $p) {
            $category = $createdCategories[$p['category']] ?? null;
            if (! $category) {
                continue;
            }

            Product::firstOrCreate(
                ['slug' => $p['slug']],
                [
                    'category_id' => $category->id,
                    'name' => $p['name'],
                    'description' => $p['description'],
                    'price' => $p['price'],
                    'stock' => $p['stock'],
                    'image' => 'https://picsum.photos/seed/'.Str::slug($p['slug']).'/400/400',
                    'is_active' => true,
                ]
            );
        }
    }
}
