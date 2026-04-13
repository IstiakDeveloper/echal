<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        /** @var array{items?: array<int|string, array{quantity: int}>} $cart */
        $cart = $request->session()->get('cart', []);

        $cartItems = $cart['items'] ?? [];

        $cartCount = collect($cartItems)->sum(
            static fn (array $item): int => (int) ($item['quantity'] ?? 0),
        );

        // Get unread orders count and bank balance for admin users
        $unreadOrdersCount = 0;
        $accountingCashBalance = null;
        $role = $request->user()?->role;
        if ($request->user() && ($role === 'admin' || $role === 'superadmin')) {
            $unreadOrdersCount = \App\Models\Order::whereNull('read_at')->count();
            try {
                $accountingCashBalance = app(\App\Services\AccountingService::class)->getCurrentCashBalance();
            } catch (\Throwable) {
                // Accounting not set up or seeder not run
            }
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user(),
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'cart' => [
                'count' => $cartCount,
                'items' => $cartItems,
            ],
            'unreadOrdersCount' => $unreadOrdersCount,
            'accountingCashBalance' => $accountingCashBalance,
        ];
    }
}
