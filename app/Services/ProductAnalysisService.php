<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Support\Facades\DB;

class ProductAnalysisService
{
    /**
     * Product analysis report for date range: buy (cost), sale, profit, stock value.
     *
     * @return array{summary: array{total_buy: float, total_sale: float, total_profit: float, profit_margin_pct: float, stock_value: float}, rows: array<int, array>, period_label: string}
     */
    public function report(string $dateFrom, string $dateTo, string $search = ''): array
    {
        $products = Product::query()
            ->where('is_active', true)
            ->when($search !== '', fn ($q) => $q->where('name', 'like', '%'.trim($search).'%'))
            ->orderBy('name')
            ->get();

        $orderItemsInPeriod = DB::table('order_items')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->whereBetween('orders.created_at', [$dateFrom.' 00:00:00', $dateTo.' 23:59:59'])
            ->select([
                'order_items.product_id',
                DB::raw('SUM(order_items.quantity) as sale_qty'),
                DB::raw('SUM(order_items.line_total) as sale_total'),
                DB::raw('AVG(order_items.price) as avg_sale_price'),
            ])
            ->groupBy('order_items.product_id')
            ->get()
            ->keyBy('product_id');

        $totalBuy = 0.0;
        $totalSale = 0.0;
        $stockValue = 0.0;
        $rows = [];

        foreach ($products as $index => $product) {
            $cost = (float) ($product->cost_price ?? 0);
            $agg = $orderItemsInPeriod->get($product->id);

            $saleQty = $agg ? (int) $agg->sale_qty : 0;
            $saleTotal = $agg ? (float) $agg->sale_total : 0.0;
            $avgSalePrice = $agg && $saleQty > 0 ? (float) $agg->avg_sale_price : (float) $product->price;

            $buyTotal = $cost * $saleQty;
            $totalBuy += $buyTotal;
            $totalSale += $saleTotal;

            $profitTotal = $saleTotal - $buyTotal;
            $profitPerUnit = $saleQty > 0 ? $avgSalePrice - $cost : 0.0;
            $profitPct = $saleTotal > 0 ? round($profitTotal / $saleTotal * 100, 2) : 0.0;

            $stock = (int) $product->stock;
            $availableValue = $stock * $cost;
            $stockValue += $availableValue;

            $rows[] = [
                'sl' => $index + 1,
                'product_id' => $product->id,
                'name' => $product->name,
                'before_qty' => 0,
                'before_price' => $cost,
                'before_value' => 0.0,
                'buy_qty' => $saleQty,
                'buy_price' => $cost,
                'buy_total' => round($buyTotal, 2),
                'sale_qty' => $saleQty,
                'sale_price' => $avgSalePrice,
                'sale_subtotal' => round($saleQty * $avgSalePrice, 2),
                'sale_discount' => 0.0,
                'sale_total' => round($saleTotal, 2),
                'profit_per_unit' => round($profitPerUnit, 2),
                'profit_total' => round($profitTotal, 2),
                'profit_pct' => $profitPct,
                'stock' => $stock,
                'stock_value' => round($availableValue, 2),
            ];
        }

        $totalProfit = $totalSale - $totalBuy;
        $profitMarginPct = $totalSale > 0 ? round($totalProfit / $totalSale * 100, 2) : 0.0;

        $periodLabel = $dateFrom === $dateTo
            ? $dateFrom
            : $dateFrom.' to '.$dateTo;

        return [
            'summary' => [
                'total_buy' => round($totalBuy, 2),
                'total_sale' => round($totalSale, 2),
                'total_profit' => round($totalProfit, 2),
                'profit_margin_pct' => $profitMarginPct,
                'stock_value' => round($stockValue, 2),
            ],
            'rows' => $rows,
            'period_label' => $periodLabel,
        ];
    }
}
