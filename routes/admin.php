<?php

use App\Http\Controllers\Admin\AuthController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\CustomerController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\DeliveryAmountController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\ProductController;
use Illuminate\Support\Facades\Route;

// Admin Authentication Routes
Route::prefix('admin')->group(function () {
    Route::get('login', [AuthController::class, 'showLoginForm'])->name('admin.login');
    Route::post('login', [AuthController::class, 'login'])->name('admin.login.post');
    Route::post('logout', [AuthController::class, 'logout'])->middleware('auth')->name('admin.logout');

    // Protected Admin Routes
    Route::middleware(['auth', 'admin'])->group(function () {
        Route::get('/', [DashboardController::class, 'index'])->name('admin.dashboard');

        // Products
        Route::resource('products', ProductController::class)->names('admin.products');

        // Categories
        Route::resource('categories', CategoryController::class);

        // Orders
        Route::get('orders', [OrderController::class, 'index'])->name('admin.orders.index');
        Route::get('orders/{order}', [OrderController::class, 'show'])->name('admin.orders.show');
        Route::patch('orders/{order}/status', [OrderController::class, 'updateStatus'])->name('admin.orders.update-status');

        // Customers
        Route::get('customers', [CustomerController::class, 'index'])->name('admin.customers.index');
        Route::get('customers/{user}', [CustomerController::class, 'show'])->name('admin.customers.show');

        // Delivery Amounts
        Route::get('delivery-amounts', [DeliveryAmountController::class, 'index'])->name('admin.delivery-amounts.index');
        Route::post('delivery-amounts', [DeliveryAmountController::class, 'store'])->name('admin.delivery-amounts.store');
        Route::put('delivery-amounts/{deliveryAmount}', [DeliveryAmountController::class, 'update'])->name('admin.delivery-amounts.update');
        Route::delete('delivery-amounts/{deliveryAmount}', [DeliveryAmountController::class, 'destroy'])->name('admin.delivery-amounts.destroy');
    });
});
