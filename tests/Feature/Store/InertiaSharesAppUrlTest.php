<?php

use Inertia\Testing\AssertableInertia as Assert;

test('storefront inertia responses include app url for same-origin link handling', function () {
    $this->get('/')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('appUrl')
            ->where('appUrl', fn (mixed $value): bool => is_string($value) && $value !== ''));
});
