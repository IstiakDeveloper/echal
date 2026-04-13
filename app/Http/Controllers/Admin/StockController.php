<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\StockMovement;
use App\Services\StockService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StockController extends Controller
{
    public function __construct(
        private StockService $stock
    ) {}

    public function index(Request $request): Response
    {
        $products = Product::where('is_active', true)->orderBy('name')->get(['id', 'name', 'stock', 'cost_price']);

        return Inertia::render('admin/stock/index', [
            'products' => $products,
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        $products = Product::where('is_active', true)->orderBy('name')->get(['id', 'name', 'stock', 'cost_price']);
        $latestByProduct = StockMovement::whereIn('product_id', $products->pluck('id'))
            ->orderByDesc('created_at')
            ->get()
            ->groupBy('product_id')
            ->map(fn ($movements) => $movements->first());

        $productsWithLastPrice = $products->map(function ($p) use ($latestByProduct) {
            $m = $latestByProduct->get($p->id);
            return [
                'id' => $p->id,
                'name' => $p->name,
                'stock' => (int) $p->stock,
                'cost_price' => $p->cost_price !== null ? (float) $p->cost_price : null,
                'last_unit_price' => $m ? round((float) $m->total_amount / (int) $m->quantity, 2) : null,
            ];
        });

        return Inertia::render('admin/stock/create', [
            'products' => $productsWithLastPrice,
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'product_id' => ['required', 'exists:products,id'],
            'quantity' => ['required', 'integer', 'min:1'],
            'total_amount' => ['required', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        try {
            $product = Product::findOrFail($validated['product_id']);
            $this->stock->addStock(
                $product,
                (int) $validated['quantity'],
                (float) $validated['total_amount'],
                $validated['notes'] ?? null
            );
        } catch (\InvalidArgumentException $e) {
            return redirect()->route('admin.stock.index')->with('error', $e->getMessage());
        }

        return redirect()->route('admin.stock.index')->with('success', 'Stock added.');
    }

    public function productMovements(Product $product): JsonResponse
    {
        $movements = StockMovement::where('product_id', $product->id)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (StockMovement $m) => [
                'id' => $m->id,
                'quantity' => $m->quantity,
                'total_amount' => (float) $m->total_amount,
                'unit_price' => round($m->unit_price, 2),
                'created_at' => $m->created_at->format('Y-m-d H:i'),
            ]);

        return response()->json(['movements' => $movements]);
    }

    public function update(Request $request, StockMovement $movement): RedirectResponse|JsonResponse
    {
        $validated = $request->validate([
            'quantity' => ['required', 'integer', 'min:1'],
            'total_amount' => ['required', 'numeric', 'min:0'],
        ]);

        try {
            $this->stock->updateMovement(
                $movement,
                (int) $validated['quantity'],
                (float) $validated['total_amount']
            );
        } catch (\InvalidArgumentException $e) {
            if ($request->wantsJson()) {
                return response()->json(['message' => $e->getMessage()], 422);
            }

            return redirect()->route('admin.stock.index')->with('error', $e->getMessage());
        }

        if ($request->wantsJson()) {
            return response()->json(['success' => true]);
        }

        return redirect()->route('admin.stock.index')->with('success', 'Stock entry updated.');
    }

    public function destroy(StockMovement $movement): RedirectResponse|JsonResponse
    {
        try {
            $this->stock->deleteMovement($movement);
        } catch (\InvalidArgumentException $e) {
            if (request()->wantsJson()) {
                return response()->json(['message' => $e->getMessage()], 422);
            }

            return redirect()->route('admin.stock.index')->with('error', $e->getMessage());
        }

        if (request()->wantsJson()) {
            return response()->json(['success' => true]);
        }

        return redirect()->route('admin.stock.index')->with('success', 'Stock entry deleted.');
    }
}
