<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        // Statistics
        $totalOrders = Order::count();
        $totalRevenue = Order::where('status', '!=', 'cancelled')->sum('total');
        $totalCustomers = User::where('role', 'customer')->count();
        $totalProducts = Product::count();
        $activeProducts = Product::where('is_active', true)->count();

        // Recent orders
        $recentOrders = Order::with(['user:id,name,email,phone', 'items'])
            ->latest()
            ->limit(10)
            ->get();

        // Orders by status
        $ordersByStatus = Order::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        // Revenue by month (last 6 months)
        $revenueByMonth = Order::selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month, SUM(total) as revenue')
            ->where('status', '!=', 'cancelled')
            ->where('created_at', '>=', now()->subMonths(6))
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->mapWithKeys(function ($item) {
                return [$item->month => (float) $item->revenue];
            })
            ->toArray();

        return Inertia::render('admin/dashboard', [
            'stats' => [
                'totalOrders' => $totalOrders,
                'totalRevenue' => (float) $totalRevenue,
                'totalCustomers' => $totalCustomers,
                'totalProducts' => $totalProducts,
                'activeProducts' => $activeProducts,
            ],
            'recentOrders' => $recentOrders,
            'ordersByStatus' => $ordersByStatus,
            'revenueByMonth' => $revenueByMonth,
        ]);
    }
}
