<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\AccountingService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Order::with(['user:id,name,email,phone']);

        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('id', $search)
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('division', 'like', "%{$search}%")
                    ->orWhere('district', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        // Filter by status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        $orders = $query->latest()->paginate(20)->withQueryString();

        return Inertia::render('admin/orders/index', [
            'orders' => $orders,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function show(Order $order): Response
    {
        $order->load(['user', 'items.product:id,name,slug,image']);

        // Mark order as read
        if (! $order->read_at) {
            $order->update(['read_at' => now()]);
        }

        return Inertia::render('admin/orders/show', [
            'order' => $order,
        ]);
    }

    public function updateStatus(Request $request, Order $order): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'string', 'in:pending,processing,shipped,delivered,cancelled'],
        ]);

        if ($order->status === 'delivered') {
            return redirect()
                ->back()
                ->with('error', 'Delivered orders cannot be changed or cancelled.');
        }

        $nextStatus = $validated['status'];
        $order->update(['status' => $nextStatus]);

        if ($nextStatus === 'delivered') {
            // Only recognize the sale in accounting once the order is completed/delivered.
            app(AccountingService::class)->recordSaleIfMissing($order);
        }

        return redirect()->back()->with('success', 'Order status updated successfully.');
    }
}
