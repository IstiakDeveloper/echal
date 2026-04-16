<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateStorefrontSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'top_offer' => ['nullable', 'string', 'max:500'],
            'support_email' => ['nullable', 'string', 'email', 'max:255'],
            'support_phone' => ['nullable', 'string', 'max:50'],
            'whatsapp_phone' => ['nullable', 'string', 'max:50'],
            'whatsapp_prefill' => ['nullable', 'string', 'max:200'],
            'facebook_page_url' => ['nullable', 'string', 'url', 'max:255'],
        ];
    }
}
