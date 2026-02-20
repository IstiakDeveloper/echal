<?php

use App\Http\Controllers\Store\CartController;
use App\Http\Controllers\Store\CheckoutController;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    $categories = Category::query()
        ->orderBy('sort_order')
        ->orderBy('name')
        ->get(['id', 'name', 'slug']);

    $featuredProducts = Product::query()
        ->with('category:id,name,slug')
        ->where('is_active', true)
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
Route::post('cart/buy-now', [CartController::class, 'buyNow'])->name('cart.buy-now');

Route::get('checkout', [CheckoutController::class, 'show'])->name('checkout.show');
Route::post('checkout', [CheckoutController::class, 'store'])->name('checkout.store');

Route::get('checkout/complete', [CheckoutController::class, 'complete'])->name('checkout.complete');

// Phone-based authentication (OTP)
Route::get('login', [\App\Http\Controllers\Auth\PhoneAuthController::class, 'show'])->name('login');
Route::post('auth/phone/send-otp', [\App\Http\Controllers\Auth\PhoneAuthController::class, 'sendOTP'])->name('auth.phone.send-otp');
Route::post('auth/phone/verify-otp', [\App\Http\Controllers\Auth\PhoneAuthController::class, 'verifyOTP'])->name('auth.phone.verify-otp');

Route::get('dashboard', [\App\Http\Controllers\DashboardController::class, 'index'])->middleware(['auth'])->name('dashboard');

Route::get('profile', [\App\Http\Controllers\ProfileController::class, 'show'])->middleware(['auth'])->name('profile.show');
Route::put('profile', [\App\Http\Controllers\ProfileController::class, 'update'])->middleware(['auth'])->name('profile.update');

Route::post('logout', function () {
    auth()->logout();
    request()->session()->invalidate();
    request()->session()->regenerateToken();
    return redirect()->route('home');
})->middleware(['auth'])->name('logout');

require __DIR__.'/settings.php';
require __DIR__.'/admin.php';
