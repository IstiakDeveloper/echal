<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        $orders = Order::query()
            ->where('user_id', $user->id)
            ->with(['items' => function ($query) {
                $query->select('id', 'order_id', 'product_id', 'name', 'price', 'quantity', 'line_total');
            }])
            ->orderBy('created_at', 'desc')
            ->get([
                'id',
                'phone',
                'division',
                'district',
                'upazila',
                'address',
                'subtotal',
                'delivery_amount',
                'total',
                'status',
                'created_at',
                'updated_at',
            ]);

        $totalOrders = $orders->count();
        $totalSpent = $orders->sum('total');
        $pendingOrders = $orders->where('status', 'pending')->count();

        return Inertia::render('dashboard', [
            'orders' => $orders->map(function (Order $order) {
                return [
                    'id' => $order->id,
                    'phone' => $order->phone,
                    'address' => [
                        'division' => $order->division,
                        'district' => $order->district,
                        'upazila' => $order->upazila,
                        'full' => $order->address,
                    ],
                    'items' => $order->items->map(function ($item) {
                        return [
                            'id' => $item->id,
                            'name' => $item->name,
                            'price' => (string) $item->price,
                            'quantity' => $item->quantity,
                            'line_total' => (string) $item->line_total,
                        ];
                    })->toArray(),
                    'subtotal' => (string) $order->subtotal,
                    'delivery_amount' => (string) $order->delivery_amount,
                    'total' => (string) $order->total,
                    'status' => $order->status,
                    'created_at' => $order->created_at->toIso8601String(),
                    'updated_at' => $order->updated_at->toIso8601String(),
                ];
            })->toArray(),
            'stats' => [
                'total_orders' => $totalOrders,
                'total_spent' => (string) $totalSpent,
                'pending_orders' => $pendingOrders,
            ],
        ]);
    }
}
