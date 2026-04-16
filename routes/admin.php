<?php

use App\Http\Controllers\Admin\AccountingController;
use App\Http\Controllers\Admin\AuthController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\CustomerController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\DeliveryAmountController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\OrderReceiptController;
use App\Http\Controllers\Admin\PosController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\StockController;
use App\Http\Controllers\Admin\StorefrontPopupsController;
use App\Http\Controllers\Admin\StorefrontSettingsController;
use Illuminate\Support\Facades\Route;

// Admin Authentication Routes
Route::prefix('admin')->group(function () {
    Route::get('login', [AuthController::class, 'showLoginForm'])->name('admin.login');
    Route::post('login', [AuthController::class, 'login'])->name('admin.login.post');
    Route::post('logout', [AuthController::class, 'logout'])->middleware('auth')->name('admin.logout');

    // Protected Admin Routes
    Route::middleware(['auth', 'admin'])->group(function () {
        Route::get('/', [DashboardController::class, 'index'])->name('admin.dashboard');

        // Storefront settings
        Route::get('settings/storefront', [StorefrontSettingsController::class, 'edit'])->name('admin.settings.storefront.edit');
        Route::put('settings/storefront', [StorefrontSettingsController::class, 'update'])->name('admin.settings.storefront.update');
        Route::get('settings/storefront/popups', [StorefrontPopupsController::class, 'index'])->name('admin.settings.storefront.popups.index');
        Route::post('settings/storefront/popups', [StorefrontPopupsController::class, 'store'])->name('admin.settings.storefront.popups.store');
        Route::put('settings/storefront/popups/{popup}/activate', [StorefrontPopupsController::class, 'activate'])->name('admin.settings.storefront.popups.activate');
        Route::delete('settings/storefront/popups/{popup}', [StorefrontPopupsController::class, 'destroy'])->name('admin.settings.storefront.popups.destroy');

        // Products
        Route::resource('products', ProductController::class)->names('admin.products');
        Route::get('products/import/csv', [ProductController::class, 'importCsvForm'])->name('admin.products.import.csv.form');
        Route::post('products/import/csv', [ProductController::class, 'importCsv'])->name('admin.products.import.csv');

        // Categories
        Route::resource('categories', CategoryController::class);

        // Orders
        Route::get('orders', [OrderController::class, 'index'])->name('admin.orders.index');
        Route::get('orders/{order}', [OrderController::class, 'show'])->name('admin.orders.show');
        Route::patch('orders/{order}/status', [OrderController::class, 'updateStatus'])->name('admin.orders.update-status');
        Route::get('orders/{order}/receipt', [OrderReceiptController::class, 'show'])->name('admin.orders.receipt');

        // POS (Offline Sale)
        Route::get('pos', [PosController::class, 'index'])->name('admin.pos.index');
        Route::post('pos', [PosController::class, 'store'])->name('admin.pos.store');

        // Customers
        Route::get('customers', [CustomerController::class, 'index'])->name('admin.customers.index');
        Route::get('customers/{user}', [CustomerController::class, 'show'])->name('admin.customers.show');

        // Stock (index = products + history; create = add stock)
        Route::get('stock', [StockController::class, 'index'])->name('admin.stock.index');
        Route::get('stock/create', [StockController::class, 'create'])->name('admin.stock.create');
        Route::post('stock', [StockController::class, 'store'])->name('admin.stock.store');
        Route::get('stock/product-movements/{product}', [StockController::class, 'productMovements'])->name('admin.stock.product-movements');
        Route::put('stock/{movement}', [StockController::class, 'update'])->name('admin.stock.update');
        Route::delete('stock/{movement}', [StockController::class, 'destroy'])->name('admin.stock.destroy');

        // Delivery Amounts
        Route::get('delivery-amounts', [DeliveryAmountController::class, 'index'])->name('admin.delivery-amounts.index');
        Route::post('delivery-amounts', [DeliveryAmountController::class, 'store'])->name('admin.delivery-amounts.store');
        Route::put('delivery-amounts/{deliveryAmount}', [DeliveryAmountController::class, 'update'])->name('admin.delivery-amounts.update');
        Route::delete('delivery-amounts/{deliveryAmount}', [DeliveryAmountController::class, 'destroy'])->name('admin.delivery-amounts.destroy');

        // Accounting & Reports
        Route::get('accounting', [AccountingController::class, 'index'])->name('admin.accounting.index');
        Route::get('accounting/bank-report', [AccountingController::class, 'bankReport'])->name('admin.accounting.bank-report');
        Route::get('accounting/receipt-payment-report', [AccountingController::class, 'receiptPaymentReport'])->name('admin.accounting.receipt-payment-report');
        Route::get('accounting/income-expenditure-report', [AccountingController::class, 'incomeExpenditureReport'])->name('admin.accounting.income-expenditure-report');
        Route::get('accounting/balance-sheet-report', [AccountingController::class, 'balanceSheetReport'])->name('admin.accounting.balance-sheet-report');
        Route::get('accounting/product-analysis-report', [AccountingController::class, 'productAnalysisReport'])->name('admin.accounting.product-analysis-report');
        Route::get('accounting/product-analysis-report/export', [AccountingController::class, 'exportProductAnalysisReport'])->name('admin.accounting.product-analysis-report.export');
        Route::get('accounting/transactions/create', [AccountingController::class, 'createTransaction'])->name('admin.accounting.transactions.create');
        Route::post('accounting/transactions', [AccountingController::class, 'storeTransaction'])->name('admin.accounting.transactions.store');
        Route::get('accounting/transactions/{transaction}/edit', [AccountingController::class, 'editTransaction'])->name('admin.accounting.transactions.edit');
        Route::put('accounting/transactions/{transaction}', [AccountingController::class, 'updateTransaction'])->name('admin.accounting.transactions.update');
        Route::delete('accounting/transactions/{transaction}', [AccountingController::class, 'destroyTransaction'])->name('admin.accounting.transactions.destroy');
    });
});
