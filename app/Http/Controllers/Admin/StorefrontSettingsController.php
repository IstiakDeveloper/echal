<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateStorefrontSettingsRequest;
use App\Models\StorefrontSetting;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class StorefrontSettingsController extends Controller
{
    public function edit(): Response
    {
        $settings = StorefrontSetting::current();

        return Inertia::render('admin/settings/storefront', [
            'settings' => [
                'top_offer' => $settings->top_offer,
                'support_email' => $settings->support_email,
                'support_phone' => $settings->support_phone,
                'whatsapp_phone' => $settings->whatsapp_phone,
                'whatsapp_prefill' => $settings->whatsapp_prefill,
                'facebook_page_url' => $settings->facebook_page_url,
            ],
        ]);
    }

    public function update(UpdateStorefrontSettingsRequest $request): RedirectResponse
    {
        $settings = StorefrontSetting::current();

        $settings->update($request->validated());

        return back()->with('success', 'Storefront settings updated.');
    }
}
