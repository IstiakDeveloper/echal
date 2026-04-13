<?php

namespace App\Services;

use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Support\Facades\DB;

class StockService
{
    public function __construct(
        private AccountingService $accounting
    ) {}

    public function addStock(Product $product, int $quantity, float $totalAmount, ?string $notes = null): StockMovement
    {
        if ($quantity <= 0) {
            throw new \InvalidArgumentException('Quantity must be positive.');
        }
        if ($totalAmount < 0) {
            throw new \InvalidArgumentException('Total amount cannot be negative.');
        }

        return DB::transaction(function () use ($product, $quantity, $totalAmount, $notes) {
            $movement = StockMovement::create([
                'product_id' => $product->id,
                'quantity' => $quantity,
                'total_amount' => $totalAmount,
                'type' => 'in',
                'notes' => $notes,
            ]);

            $product->stock = (int) $product->stock + $quantity;
            $this->updateProductCostPrice($product);
            $product->save();

            if ($totalAmount > 0) {
                $description = 'Stock: '.$product->name.' (qty '.$quantity.')';
                if ($notes) {
                    $description .= ' — '.$notes;
                }
                $this->accounting->recordPurchase(now()->toDateString(), $description, $totalAmount);
            }

            return $movement;
        });
    }

    public function updateMovement(StockMovement $movement, int $quantity, float $totalAmount): void
    {
        if ($quantity <= 0) {
            throw new \InvalidArgumentException('Quantity must be positive.');
        }
        if ($totalAmount < 0) {
            throw new \InvalidArgumentException('Total amount cannot be negative.');
        }

        DB::transaction(function () use ($movement, $quantity, $totalAmount) {
            $product = $movement->product;
            $oldQty = $movement->quantity;

            $product->stock = (int) $product->stock - $oldQty + $quantity;
            $movement->update(['quantity' => $quantity, 'total_amount' => $totalAmount]);

            $this->updateProductCostPrice($product);
            $product->save();
        });
    }

    public function deleteMovement(StockMovement $movement): void
    {
        DB::transaction(function () use ($movement) {
            $product = $movement->product;
            $product->stock = (int) $product->stock - $movement->quantity;
            $this->updateProductCostPrice($product);
            $product->save();
            $movement->delete();
        });
    }

    private function updateProductCostPrice(Product $product): void
    {
        $totalQty = $product->stockMovements()->where('type', 'in')->sum('quantity');
        $totalAmount = $product->stockMovements()->where('type', 'in')->sum('total_amount');
        $product->cost_price = $totalQty > 0 ? round($totalAmount / $totalQty, 2) : null;
    }
}
