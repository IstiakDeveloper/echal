<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('storefront_popups', function (Blueprint $table) {
            $table->id();
            $table->string('image_url');
            $table->boolean('is_active')->default(false)->index();
            $table->string('link_url')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('storefront_popups');
    }
};
