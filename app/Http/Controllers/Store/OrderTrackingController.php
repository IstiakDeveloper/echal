<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderTrackingController extends Controller
{
    public function show(Request $request): Response
    {
        $orderId = $request->query('order_id');

        $order = null;

        if ($orderId !== null) {
            $validated = $request->validate([
                'order_id' => ['required', 'regex:/^\d+$/'],
            ]);

            $id = (int) $validated['order_id'];
            if ($id < 1) {
                return Inertia::render('store/order-tracking', [
                    'filters' => [
                        'order_id' => $orderId,
                    ],
                    'order' => null,
                ]);
            }

            $order = Order::query()
                ->with(['items:id,order_id,name,price,quantity,line_total'])
                ->whereKey($id)
                ->first([
                    'id',
                    'status',
                    'subtotal',
                    'delivery_amount',
                    'total',
                    'created_at',
                ]);
        }

        return Inertia::render('store/order-tracking', [
            'filters' => [
                'order_id' => $orderId,
            ],
            'order' => $order,
        ]);
    }
}
