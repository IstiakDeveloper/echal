<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Inertia\Inertia;
use Inertia\Response;

class OrderReceiptController extends Controller
{
    public function show(Order $order): Response
    {
        $order->load(['user', 'items.product:id,name,slug,image']);

        return Inertia::render('admin/orders/receipt', [
            'order' => $order,
        ]);
    }
}
