<?php

use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('redirects /register to /login', function () {
    $this->get('/register')
        ->assertRedirect('/login');
});
