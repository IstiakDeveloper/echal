<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\DeliveryAmount;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CheckoutController extends Controller
{
    public function show(Request $request): Response|RedirectResponse
    {
        /** @var array{items?: array<int|string, array{quantity: int}>} $cart */
        $cart = $request->session()->get('cart', []);
        $rawItems = $cart['items'] ?? [];

        $productIds = array_map('intval', array_keys($rawItems));

        $products = Product::query()
            ->with('category:id,name,slug')
            ->whereIn('id', $productIds)
            ->get()
            ->keyBy('id');

        $items = collect($rawItems)
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

        $subtotal = collect($items)->sum(
            fn (array $item): float => (float) $item['line_total']
        );

        // Build nested locations data from bangladeshAddresses.json
        $locationsPath = resource_path('js/data/bangladeshAddresses.json');
        $locations = [];

        if (is_file($locationsPath)) {
            $decoded = json_decode((string) file_get_contents($locationsPath), true);

            if (is_array($decoded)) {
                $divisions = $decoded['divisions'] ?? [];
                $districtsByDivision = $decoded['districtsByDivision'] ?? [];
                $upazilasByDistrict = $decoded['upazilasByDistrict'] ?? [];

                foreach ($divisions as $divisionName) {
                    $districtNames = $districtsByDivision[$divisionName] ?? [];

                    $districts = [];

                    foreach ($districtNames as $districtName) {
                        $upazilas = [];
                        foreach ($upazilasByDistrict[$districtName] ?? [] as $upazilaName) {
                            $upazilas[] = ['name' => $upazilaName];
                        }

                        $districts[] = [
                            'name' => $districtName,
                            'upazilas' => $upazilas,
                        ];
                    }

                    $locations[] = [
                        'name' => $divisionName,
                        'districts' => $districts,
                    ];
                }
            }
        }

        // Get user's latest order for saved address
        $savedAddress = null;
        $user = $request->user();
        if ($user) {
            $latestOrder = Order::where('user_id', $user->id)
                ->whereNotNull('division')
                ->whereNotNull('district')
                ->whereNotNull('upazila')
                ->whereNotNull('address')
                ->whereNotNull('phone')
                ->latest('created_at')
                ->first();

            if ($latestOrder) {
                $savedAddress = [
                    'division' => $latestOrder->division,
                    'district' => $latestOrder->district,
                    'upazila' => $latestOrder->upazila,
                    'address' => $latestOrder->address,
                    'phone' => $latestOrder->phone,
                ];
            }
        }

        return Inertia::render('store/checkout', [
            'items' => $items,
            'subtotal' => $subtotal,
            'defaultDeliveryAmount' => 150,
            'locations' => $locations,
            'savedAddress' => $savedAddress,
        ]);
    }

    public function deliveryAmount(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'division' => ['nullable', 'string', 'max:255'],
            'district' => ['nullable', 'string', 'max:255'],
            'upazila' => ['nullable', 'string', 'max:255'],
        ]);

        $division = (string) ($validated['division'] ?? '');
        $district = (string) ($validated['district'] ?? '');
        $upazila = (string) ($validated['upazila'] ?? '');

        $default = 150.0;

        if ($division === '' || $district === '' || $upazila === '') {
            return response()->json(['delivery_amount' => $default]);
        }

        return response()->json([
            'delivery_amount' => $this->deliveryAmountForLocation($division, $district, $upazila),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        /** @var array{items?: array<int|string, array{quantity: int}>} $cart */
        $cart = $request->session()->get('cart', []);
        $rawItems = $cart['items'] ?? [];

        if ($rawItems === []) {
            return redirect()->route('cart.index');
        }

        $validated = $request->validate([
            'division' => ['required', 'string', 'max:255'],
            'district' => ['required', 'string', 'max:255'],
            'upazila' => ['required', 'string', 'max:255'],
            'address' => ['required', 'string', 'max:500'],
            'phone' => ['required', 'string', 'max:20'],
        ]);

        $phone = $validated['phone'];

        $email = $phone.'@e-chal.local';

        $user = User::firstOrCreate(
            ['email' => $email],
            [
                'name' => $phone,
                'password' => Str::random(32),
            ]
        );

        try {
            /** @var \App\Models\Order $order */
            $order = DB::transaction(function () use ($rawItems, $user, $validated): Order {
                $productIds = array_map('intval', array_keys($rawItems));

                $products = Product::query()
                    ->whereIn('id', $productIds)
                    ->lockForUpdate()
                    ->get()
                    ->keyBy('id');

                $items = collect($rawItems)
                    ->map(function (array $item, string $productId) use ($products): ?array {
                        $product = $products->get((int) $productId);

                        if ($product === null) {
                            return null;
                        }

                        $quantity = (int) $item['quantity'];
                        if ($quantity <= 0 || (int) $product->stock < $quantity) {
                            return null;
                        }
                        $lineTotal = (float) $product->price * $quantity;

                        return [
                            'product' => $product,
                            'quantity' => $quantity,
                            'line_total' => $lineTotal,
                        ];
                    })
                    ->filter()
                    ->values();

                if ($items->isEmpty()) {
                    throw new \RuntimeException('Some items are out of stock. Please update your cart.');
                }

                $subtotal = $items->sum(
                    fn (array $row): float => (float) $row['line_total']
                );

                $deliveryAmount = $this->deliveryAmountForLocation(
                    division: $validated['division'],
                    district: $validated['district'],
                    upazila: $validated['upazila'],
                );
                $total = $subtotal + $deliveryAmount;

                $order = Order::create([
                    'user_id' => $user->id,
                    'phone' => $validated['phone'],
                    'division' => $validated['division'],
                    'district' => $validated['district'],
                    'upazila' => $validated['upazila'],
                    'address' => $validated['address'],
                    'subtotal' => $subtotal,
                    'delivery_amount' => $deliveryAmount,
                    'total' => $total,
                    'status' => 'pending',
                ]);

                foreach ($items as $row) {
                    /** @var \App\Models\Product $product */
                    $product = $row['product'];
                    $quantity = (int) $row['quantity'];

                    if ((int) $product->stock < $quantity) {
                        throw new \RuntimeException('Some items are out of stock. Please update your cart.');
                    }

                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_id' => $product->id,
                        'name' => $product->name,
                        'price' => $product->price,
                        'quantity' => $quantity,
                        'line_total' => $row['line_total'],
                    ]);

                    $product->decrement('stock', $quantity);
                }

                return $order;
            });
        } catch (\Throwable) {
            return redirect()
                ->route('cart.index')
                ->with('error', 'Some items are out of stock. Please update your cart.');
        }

        $request->session()->forget('cart');

        return redirect()
            ->route('checkout.complete')
            ->with([
                'order_placed' => true,
                'order_id' => $order->id,
                'order_phone' => $validated['phone'],
            ]);
    }

    public function complete(Request $request): Response|RedirectResponse
    {
        if (! $request->session()->get('order_placed')) {
            return redirect()->route('home');
        }

        return Inertia::render('store/checkout-complete', [
            'orderId' => $request->session()->get('order_id'),
            'phone' => $request->session()->get('order_phone'),
        ]);
    }

    private function deliveryAmountForLocation(string $division, string $district, string $upazila): float
    {
        $default = 150.0;

        $candidate = DeliveryAmount::query()
            ->where('is_active', true)
            ->where('division', $division)
            ->where(function ($q) use ($district) {
                $q->whereNull('district')->orWhere('district', $district);
            })
            ->where(function ($q) use ($upazila) {
                $q->whereNull('upazila')->orWhere('upazila', $upazila);
            })
            ->orderByRaw('case when district is null then 0 else 1 end desc')
            ->orderByRaw('case when upazila is null then 0 else 1 end desc')
            ->first();

        if ($candidate === null) {
            return $default;
        }

        $amount = (float) $candidate->amount;

        return $amount < $default ? $amount : $default;
    }
}
