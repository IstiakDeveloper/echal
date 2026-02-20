<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DeliveryAmount;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DeliveryAmountController extends Controller
{
    public function index(Request $request): Response
    {
        $query = DeliveryAmount::query();

        // Filter by division
        if ($request->has('division') && $request->division) {
            $query->where('division', $request->division);
        }

        $deliveryAmounts = $query->orderBy('division')->orderBy('district')->orderBy('upazila')->paginate(50)->withQueryString();

        // Get unique divisions for filter
        $divisions = DeliveryAmount::select('division')->distinct()->orderBy('division')->pluck('division');

        return Inertia::render('admin/delivery-amounts/index', [
            'deliveryAmounts' => $deliveryAmounts,
            'divisions' => $divisions,
            'filters' => $request->only(['division']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'division' => ['required', 'string', 'max:255'],
            'district' => ['nullable', 'string', 'max:255'],
            'upazila' => ['nullable', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        DeliveryAmount::create($validated);

        return redirect()->back()->with('success', 'Delivery amount created successfully.');
    }

    public function update(Request $request, DeliveryAmount $deliveryAmount): RedirectResponse
    {
        $validated = $request->validate([
            'division' => ['required', 'string', 'max:255'],
            'district' => ['nullable', 'string', 'max:255'],
            'upazila' => ['nullable', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        $deliveryAmount->update($validated);

        return redirect()->back()->with('success', 'Delivery amount updated successfully.');
    }

    public function destroy(DeliveryAmount $deliveryAmount): RedirectResponse
    {
        $deliveryAmount->delete();

        return redirect()->back()->with('success', 'Delivery amount deleted successfully.');
    }
}
