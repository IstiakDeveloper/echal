<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\PosSaleStoreRequest;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Services\AccountingService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class PosController extends Controller
{
    public function __construct(
        private AccountingService $accounting
    ) {}

    public function index(Request $request): Response
    {
        $query = Product::query()
            ->select(['id', 'name', 'price', 'image', 'is_active', 'stock'])
            ->where('is_active', true)
            ->orderBy('name');

        $search = (string) $request->get('search', '');
        if ($search !== '') {
            $query->where('name', 'like', "%{$search}%");
        }

        $products = $query->paginate(30)->withQueryString();

        return Inertia::render('admin/pos/index', [
            'products' => $products,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function store(PosSaleStoreRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        /** @var list<array{product_id: int, quantity: int}> $items */
        $items = $validated['items'];
        $phone = (string) $validated['phone'];
        $discount = isset($validated['discount']) ? (float) $validated['discount'] : 0.0;

        $productIds = array_values(array_unique(array_map(
            fn (array $row): int => (int) $row['product_id'],
            $items
        )));

        $products = Product::query()
            ->whereIn('id', $productIds)
            ->get()
            ->keyBy('id');

        $subtotal = 0.0;
        foreach ($items as $row) {
            $product = $products->get((int) $row['product_id']);
            if (! $product) {
                continue;
            }

            $requestedQty = (int) $row['quantity'];
            if ((int) $product->stock < $requestedQty) {
                return redirect()
                    ->back()
                    ->with('error', "{$product->name} is out of stock.");
            }

            $subtotal += ((float) $product->price) * $requestedQty;
        }

        if ($subtotal <= 0) {
            return redirect()
                ->back()
                ->with('error', 'Sale total must be positive.');
        }

        if ($discount < 0) {
            $discount = 0.0;
        }
        if ($discount > $subtotal) {
            return redirect()
                ->back()
                ->with('error', 'Discount cannot exceed subtotal.');
        }

        $total = $subtotal - $discount;
        if ($total <= 0) {
            return redirect()
                ->back()
                ->with('error', 'Total must be positive after discount.');
        }

        try {
            $order = DB::transaction(function () use ($items, $phone, $subtotal, $discount, $total): Order {
                $productIds = array_values(array_unique(array_map(
                    fn (array $row): int => (int) $row['product_id'],
                    $items
                )));

                $products = Product::query()
                    ->whereIn('id', $productIds)
                    ->lockForUpdate()
                    ->get()
                    ->keyBy('id');

                $order = Order::create([
                    'user_id' => null,
                    'phone' => $phone,
                    'division' => 'Offline',
                    'district' => 'Offline',
                    'upazila' => 'Offline',
                    'address' => 'Offline Sale',
                    'subtotal' => $subtotal,
                    'delivery_amount' => 0,
                    'discount' => $discount,
                    'total' => $total,
                    'status' => 'delivered',
                ]);

                foreach ($items as $row) {
                    /** @var \App\Models\Product|null $product */
                    $product = $products->get((int) $row['product_id']);
                    if (! $product) {
                        continue;
                    }

                    $quantity = (int) $row['quantity'];
                    if ((int) $product->stock < $quantity) {
                        throw new \RuntimeException("Out of stock: {$product->name}");
                    }
                    $lineTotal = ((float) $product->price) * $quantity;

                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_id' => $product->id,
                        'name' => $product->name,
                        'price' => $product->price,
                        'quantity' => $quantity,
                        'line_total' => $lineTotal,
                    ]);

                    $product->decrement('stock', $quantity);
                }

                $this->accounting->recordSaleIfMissing($order);

                return $order;
            });
        } catch (Throwable $e) {
            return redirect()
                ->back()
                ->with('error', $e->getMessage() !== '' ? $e->getMessage() : 'Could not complete sale.');
        }

        return redirect()
            ->route('admin.orders.show', $order)
            ->with('success', 'Offline sale completed.');
    }
}
