<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Inertia\Inertia;
use Inertia\Response;

class CartController extends Controller
{
    /**
     * Display the cart (page or JSON for drawer).
     */
    public function index(Request $request): Response|JsonResponse
    {
        $items = $this->items($request);

        $total = collect($items)->sum(
            fn (array $item): float => (float) $item['line_total']
        );

        // JSON response only for explicit API/AJAX requests (drawer),
        // never for Inertia page visits.
        if (
            ($request->wantsJson() || $request->header('X-Requested-With') === 'XMLHttpRequest')
            && ! $request->header('X-Inertia')
        ) {
            return response()->json([
                'items' => $items,
                'total' => $total,
            ]);
        }

        return Inertia::render('store/cart', [
            'items' => $items,
            'total' => $total,
        ]);
    }

    /**
     * Add to cart or update quantity. Returns JSON for live updates.
     */
    public function store(Request $request): RedirectResponse|JsonResponse
    {
        $validated = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'quantity' => ['nullable', 'integer', 'min:0'],
        ]);

        $productId = (string) $validated['product_id'];
        $quantity = isset($validated['quantity']) ? (int) $validated['quantity'] : null;

        $cart = $request->session()->get('cart', ['items' => []]);

        $currentQuantity = (int) Arr::get($cart, "items.{$productId}.quantity", 0);
        $newQuantity = $quantity !== null ? $quantity : ($currentQuantity + 1);

        if ($newQuantity <= 0) {
            Arr::forget($cart, "items.{$productId}");
        } else {
            $cart['items'][$productId] = [
                'quantity' => $newQuantity,
            ];
        }

        $request->session()->put('cart', $cart);

        if ($request->wantsJson() || $request->header('X-Requested-With') === 'XMLHttpRequest') {
            $items = $cart['items'] ?? [];
            $count = (int) collect($items)->sum('quantity');

            return response()->json([
                'cart' => [
                    'count' => $count,
                    'items' => $items,
                ],
            ]);
        }

        return back()->with('cart_updated', true);
    }

    /**
     * Buy now: set cart to only this product (qty 1) and redirect to checkout.
     */
    public function buyNow(Request $request): JsonResponse|RedirectResponse
    {
        $validated = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
        ]);

        $productId = (string) $validated['product_id'];

        $request->session()->put('cart', [
            'items' => [
                $productId => ['quantity' => 1],
            ],
        ]);

        if ($request->wantsJson() || $request->header('X-Requested-With') === 'XMLHttpRequest') {
            return response()->json([
                'redirect' => url('/checkout'),
                'cart' => [
                    'count' => 1,
                    'items' => [$productId => ['quantity' => 1]],
                ],
            ]);
        }

        return redirect()->route('checkout.show');
    }

    /**
     * Get cart items with product data.
     *
     * @return list<array<string, mixed>>
     */
    protected function items(Request $request): array
    {
        /** @var array{items?: array<int|string, array{quantity: int}>} $cart */
        $cart = $request->session()->get('cart', []);

        $items = $cart['items'] ?? [];

        if ($items === []) {
            return [];
        }

        $productIds = array_map('intval', array_keys($items));

        $products = Product::query()
            ->with('category:id,name,slug')
            ->whereIn('id', $productIds)
            ->get()
            ->keyBy('id');

        return collect($items)
            ->map(function (array $item, string $productId) use ($products): ?array {
                $product = $products->get((int) $productId);

                if ($product === null) {
                    return null;
                }

                $quantity = (int) $item['quantity'];
                $lineTotal = (float) $product->price * $quantity;

                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'slug' => $product->slug,
                    'price' => (string) $product->price,
                    'image' => $product->image,
                    'category' => [
                        'id' => $product->category?->id,
                        'name' => $product->category?->name,
                        'slug' => $product->category?->slug,
                    ],
                    'quantity' => $quantity,
                    'line_total' => $lineTotal,
                ];
            })
            ->filter()
            ->values()
            ->all();
    }
}
