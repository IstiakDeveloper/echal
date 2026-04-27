<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ProductCsvImportRequest;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Product::with('category:id,name,slug');

        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filter by category
        if ($request->has('category') && $request->category) {
            $query->where('category_id', $request->category);
        }

        // Filter by status
        if ($request->has('status')) {
            if ($request->status === 'active') {
                $query->where('is_active', true);
            } elseif ($request->status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        $products = $query->latest()->paginate(20)->withQueryString();

        $categories = Category::orderBy('name')->get(['id', 'name']);

        return Inertia::render('admin/products/index', [
            'products' => $products,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category', 'status']),
        ]);
    }

    public function create(): Response
    {
        $categories = Category::orderBy('name')->get(['id', 'name']);

        return Inertia::render('admin/products/create', [
            'categories' => $categories,
        ]);
    }

    public function importCsvForm(): Response
    {
        return Inertia::render('admin/products/import-csv');
    }

    public function importCsv(ProductCsvImportRequest $request): RedirectResponse
    {
        $path = $request->file('file')->getRealPath();
        if (! $path) {
            return redirect()->back()->with('error', 'Unable to read uploaded file.');
        }

        $handle = fopen($path, 'r');
        if ($handle === false) {
            return redirect()->back()->with('error', 'Unable to open uploaded file.');
        }

        $header = null;
        $created = 0;
        $skipped = 0;
        $errors = [];

        DB::beginTransaction();

        try {
            $rowNumber = 0;

            while (($row = fgetcsv($handle)) !== false) {
                $rowNumber++;

                if ($rowNumber === 1) {
                    $maybeHeader = array_map(
                        fn ($v) => Str::of((string) $v)->lower()->trim()->toString(),
                        $row
                    );

                    if (in_array('name', $maybeHeader, true) || in_array('product_name', $maybeHeader, true)) {
                        $header = $maybeHeader;

                        continue;
                    }

                    $header = ['category', 'name', 'price', 'slug', 'description', 'image', 'stock', 'is_active'];
                }

                $values = $this->mapCsvRow($header, $row);

                $name = trim((string) ($values['name'] ?? ''));
                $categoryRaw = trim((string) ($values['category'] ?? ''));
                $priceRaw = trim((string) ($values['price'] ?? ''));

                if ($name === '' || $categoryRaw === '' || $priceRaw === '') {
                    $skipped++;
                    $errors[] = "Row {$rowNumber}: missing required fields (category, name, price).";

                    continue;
                }

                $price = (float) $priceRaw;
                if ($price < 0) {
                    $skipped++;
                    $errors[] = "Row {$rowNumber}: price must be >= 0.";

                    continue;
                }

                $categoryId = $this->resolveCategoryId($categoryRaw);
                if ($categoryId === null) {
                    $skipped++;
                    $errors[] = "Row {$rowNumber}: category not found: {$categoryRaw}.";

                    continue;
                }

                $slug = trim((string) ($values['slug'] ?? ''));
                if ($slug === '') {
                    $slug = Str::slug($name);
                } else {
                    $slug = Str::slug($slug);
                }

                $slug = $this->uniqueProductSlug($slug);

                $stockRaw = trim((string) ($values['stock'] ?? ''));
                $stock = $stockRaw === '' ? null : max(0, (int) $stockRaw);

                $isActiveRaw = Str::of((string) ($values['is_active'] ?? '1'))->lower()->trim()->toString();
                $isActive = in_array($isActiveRaw, ['1', 'true', 'yes', 'y'], true);

                $image = trim((string) ($values['image'] ?? ''));
                if ($image === '') {
                    $image = null;
                }

                $description = trim((string) ($values['description'] ?? ''));
                if ($description === '') {
                    $description = null;
                }

                Product::create([
                    'category_id' => $categoryId,
                    'name' => $name,
                    'slug' => $slug,
                    'description' => $description,
                    'price' => $price,
                    'image' => $image,
                    'stock' => $stock ?? 0,
                    'is_active' => $isActive,
                ]);

                $created++;
            }

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            fclose($handle);

            throw $e;
        }

        fclose($handle);

        $message = "CSV import done. Created: {$created}, Skipped: {$skipped}.";
        if ($errors !== []) {
            $message .= ' First errors: '.implode(' | ', array_slice($errors, 0, 3));
        }

        return redirect()->route('admin.products.index')->with('success', $message);
    }

    /**
     * @param  list<string>  $header
     * @param  list<string|null>  $row
     * @return array<string, string|null>
     */
    private function mapCsvRow(array $header, array $row): array
    {
        $out = [];
        foreach ($header as $i => $key) {
            $out[$key] = $row[$i] ?? null;
        }

        if (isset($out['product_name']) && ! isset($out['name'])) {
            $out['name'] = $out['product_name'];
        }

        return $out;
    }

    private function resolveCategoryId(string $raw): ?int
    {
        if (ctype_digit($raw)) {
            $id = (int) $raw;

            return Category::query()->whereKey($id)->value('id');
        }

        $name = trim($raw);
        if ($name === '') {
            return null;
        }

        $existing = Category::query()->where('name', $name)->first();
        if ($existing) {
            return $existing->id;
        }

        $slug = Str::slug($name);
        $category = Category::create([
            'name' => $name,
            'slug' => $slug,
        ]);

        return $category->id;
    }

    private function uniqueProductSlug(string $baseSlug): string
    {
        $slug = $baseSlug;
        $i = 2;

        while (Product::query()->where('slug', $slug)->exists()) {
            $slug = $baseSlug.'-'.$i;
            $i++;
        }

        return $slug;
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'category_id' => ['required', 'exists:categories,id'],
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:products,slug'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'image' => ['nullable', 'url', 'max:500'],
            'images' => ['nullable', 'array'],
            'images.*' => ['image', 'mimes:jpeg,png,jpg,webp', 'max:10240'], // 10MB max per image
            'stock' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
            'is_featured' => ['boolean'],
            'featured_order' => ['nullable', 'integer', 'min:0'],
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        // Handle image uploads
        $imagePaths = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $path = $image->store('products', 'public');
                $imagePaths[] = '/storage/'.$path;
            }
        }

        // Set main image if uploaded images exist
        if (! empty($imagePaths) && empty($validated['image'])) {
            $validated['image'] = $imagePaths[0]; // First image as main image
        }

        // Store all image paths
        $validated['images'] = $imagePaths;

        Product::create($validated);

        return redirect()->route('admin.products.index')
            ->with('success', 'Product created successfully.');
    }

    public function show(Product $product): Response
    {
        $product->load('category');

        return Inertia::render('admin/products/show', [
            'product' => $product,
        ]);
    }

    public function edit(Product $product): Response
    {
        $product->load('category');
        $categories = Category::orderBy('name')->get(['id', 'name']);

        // Ensure images is an array
        if ($product->images === null) {
            $product->images = [];
        }

        return Inertia::render('admin/products/edit', [
            'product' => $product,
            'categories' => $categories,
        ]);
    }

    public function update(Request $request, Product $product): RedirectResponse
    {
        $validated = $request->validate([
            'category_id' => ['required', 'exists:categories,id'],
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:products,slug,'.$product->id],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'image' => ['nullable', 'url', 'max:500'],
            'images' => ['nullable', 'array'],
            'images.*' => ['image', 'mimes:jpeg,png,jpg,webp', 'max:10240'], // 10MB max per image
            'images_to_delete' => ['nullable', 'array'],
            'images_to_delete.*' => ['string'],
            'stock' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
            'is_featured' => ['boolean'],
            'featured_order' => ['nullable', 'integer', 'min:0'],
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        // Handle image deletions
        $currentImages = $product->images ?? [];
        if ($request->has('images_to_delete') && is_array($request->images_to_delete)) {
            $currentImages = array_values(array_filter($currentImages, function ($image) use ($request) {
                return ! in_array($image, $request->images_to_delete);
            }));
        }

        // Handle new image uploads
        $newImagePaths = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $path = $image->store('products', 'public');
                $newImagePaths[] = '/storage/'.$path;
            }
        }

        // Merge existing and new images
        $allImages = array_merge($currentImages, $newImagePaths);

        // Set main image if uploaded images exist and no main image URL provided
        if (! empty($allImages) && empty($validated['image'])) {
            $validated['image'] = $allImages[0]; // First image as main image
        }

        // Store all image paths
        $validated['images'] = $allImages;

        $product->update($validated);

        return redirect()->route('admin.products.index')
            ->with('success', 'Product updated successfully.');
    }

    public function destroy(Product $product): RedirectResponse
    {
        $product->delete();

        return redirect()->route('admin.products.index')
            ->with('success', 'Product deleted successfully.');
    }
}
