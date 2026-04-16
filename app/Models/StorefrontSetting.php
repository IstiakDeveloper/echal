<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StorefrontSetting extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'top_offer',
        'support_email',
        'support_phone',
        'whatsapp_phone',
        'whatsapp_prefill',
        'facebook_page_url',
    ];

    public static function current(): self
    {
        return static::query()->firstOrCreate(
            ['id' => 1],
            [
                'top_offer' => 'Free delivery on orders over ৳2,000 · Fresh stock · Bangladesh-wide',
                'support_email' => 'help@echal.bd',
                'support_phone' => '+8801717893432',
                'whatsapp_phone' => '8801717893432',
                'whatsapp_prefill' => 'Hi! I need help with my order.',
                'facebook_page_url' => 'https://www.facebook.com/echal.bd',
            ],
        );
    }
}
