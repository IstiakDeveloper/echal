<?php

use App\Http\Controllers\Store\CartController;
use App\Http\Controllers\Store\CheckoutController;
use App\Http\Controllers\Store\OrderTrackingController;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    $categories = Category::query()
        ->orderBy('sort_order')
        ->orderBy('name')
        ->get(['id', 'name', 'slug']);

    $featuredProductsQuery = Product::query()
        ->with('category:id,name,slug')
        ->where('is_active', true)
        ->where('is_featured', true);

    if (! $featuredProductsQuery->exists()) {
        $featuredProductsQuery = Product::query()
            ->with('category:id,name,slug')
            ->where('is_active', true);
    }

    $featuredProducts = $featuredProductsQuery
        ->orderByRaw('(stock > 0) desc')
        ->orderByRaw('featured_order is null asc, featured_order asc')
        ->orderBy('name')
        ->limit(8)
        ->get();

    return Inertia::render('store/home', [
        'canRegister' => Features::enabled(Features::registration()),
        'categories' => $categories,
        'featuredProducts' => $featuredProducts,
    ]);
})->name('home');

Route::get('products', function (Request $request) {
    $categorySlug = (string) $request->query('category', '');
    $search = (string) $request->query('search', '');

    $categories = Category::query()
        ->orderBy('sort_order')
        ->orderBy('name')
        ->get(['id', 'name', 'slug']);

    $productsQuery = Product::query()
        ->with('category:id,name,slug')
        ->where('is_active', true);

    if ($categorySlug !== '') {
        $productsQuery->whereHas('category', function ($q) use ($categorySlug) {
            $q->where('slug', $categorySlug);
        });
    }

    if ($search !== '') {
        $productsQuery->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%");
        });
    }

    $products = $productsQuery
        ->orderBy('name')
        ->get();

    return Inertia::render('store/products', [
        'products' => $products,
        'categories' => $categories,
        'activeCategory' => $categorySlug,
        'search' => $search,
    ]);
})->name('products.index');

Route::get('cart', [CartController::class, 'index'])->name('cart.index');
Route::post('cart', [CartController::class, 'store'])->name('cart.store');
Route::post('cart/clear', [CartController::class, 'clear'])->name('cart.clear');
Route::post('cart/buy-now', [CartController::class, 'buyNow'])->name('cart.buy-now');

Route::get('checkout', [CheckoutController::class, 'show'])->name('checkout.show');
Route::get('checkout/delivery-amount', [CheckoutController::class, 'deliveryAmount'])->name('checkout.delivery-amount');
Route::post('checkout', [CheckoutController::class, 'store'])->name('checkout.store');

Route::get('checkout/complete', [CheckoutController::class, 'complete'])->name('checkout.complete');

Route::get('order-tracking', [OrderTrackingController::class, 'show'])->name('order-tracking.show');

// Phone-only login (no OTP)
Route::get('login', [\App\Http\Controllers\Auth\PhoneAuthController::class, 'show'])->name('login');
Route::get('register', function () {
    return redirect()->route('login');
})->name('register');
Route::post('auth/phone/login', [\App\Http\Controllers\Auth\PhoneAuthController::class, 'login'])
    ->middleware('throttle:30,1')
    ->name('auth.phone.login');

Route::get('dashboard', [\App\Http\Controllers\DashboardController::class, 'index'])->middleware(['auth'])->name('dashboard');

Route::get('profile', [\App\Http\Controllers\ProfileController::class, 'show'])->middleware(['auth'])->name('profile.show');
Route::put('profile', [\App\Http\Controllers\ProfileController::class, 'update'])->middleware(['auth'])->name('customer.profile.update');

Route::post('logout', function () {
    auth()->logout();
    request()->session()->invalidate();
    request()->session()->regenerateToken();

    return redirect()->route('home');
})->middleware(['auth'])->name('logout');

$allowSetupRoutes = app()->environment('local')
    || filter_var(env('ALLOW_SETUP_ROUTES', false), FILTER_VALIDATE_BOOLEAN);

if ($allowSetupRoutes) {
    Route::get('migrate', function () {
        try {
            Artisan::call('migrate', ['--force' => true]);
        } catch (\Throwable $e) {
            return response('Error: '.$e->getMessage(), 500)->header('Content-Type', 'text/plain; charset=UTF-8');
        }

        $out = trim(Artisan::output());

        return response($out !== '' ? $out : 'Migrations finished.', 200)
            ->header('Content-Type', 'text/plain; charset=UTF-8');
    })->name('setup.migrate');

    Route::prefix('setup')->group(function () {
        Route::get('storage-link', function () {
            try {
                Artisan::call('storage:link', ['--force' => true]);
            } catch (\Throwable $e) {
                return response('Error: '.$e->getMessage(), 500)->header('Content-Type', 'text/plain; charset=UTF-8');
            }

            $out = trim(Artisan::output());

            return response($out !== '' ? $out : 'Storage link created.', 200)
                ->header('Content-Type', 'text/plain; charset=UTF-8');
        })->name('setup.storage-link');
    });
}

require __DIR__.'/settings.php';
require __DIR__.'/admin.php';
