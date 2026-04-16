<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StorefrontPopup extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'image_url',
        'is_active',
        'link_url',
    ];
}
