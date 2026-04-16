<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StorefrontPopupStoreRequest;
use App\Models\StorefrontPopup;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StorefrontPopupsController extends Controller
{
    public function index(): Response
    {
        $popups = StorefrontPopup::query()
            ->latest()
            ->get(['id', 'image_url', 'is_active', 'link_url', 'created_at']);

        return Inertia::render('admin/settings/popups', [
            'popups' => $popups,
        ]);
    }

    public function store(StorefrontPopupStoreRequest $request): RedirectResponse
    {
        $path = $request->file('image')->store('storefront-popups', 'public');
        $imageUrl = '/storage/'.$path;

        $popup = StorefrontPopup::create([
            'image_url' => $imageUrl,
            'is_active' => false,
            'link_url' => $request->validated('link_url'),
        ]);

        $activateNow = (bool) $request->boolean('activate_now');
        if ($activateNow) {
            StorefrontPopup::query()->whereKeyNot($popup->id)->update(['is_active' => false]);
            $popup->update(['is_active' => true]);
        }

        return back()->with('success', 'Popup uploaded.');
    }

    public function activate(Request $request, StorefrontPopup $popup): RedirectResponse
    {
        StorefrontPopup::query()->whereKeyNot($popup->id)->update(['is_active' => false]);
        $popup->update(['is_active' => true]);

        return back()->with('success', 'Popup activated.');
    }

    public function destroy(StorefrontPopup $popup): RedirectResponse
    {
        $popup->delete();

        return back()->with('success', 'Popup deleted.');
    }
}
