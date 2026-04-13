<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PhoneAuthController extends Controller
{
    /**
     * Show phone login/register page.
     */
    public function show(): Response
    {
        return Inertia::render('auth/phone-login');
    }

    /**
     * Log in or register using phone number only (no OTP verification).
     */
    public function login(Request $request): JsonResponse|Response
    {
        $validated = $request->validate([
            'phone' => ['required', 'string', 'regex:/^01[3-9]\d{8}$/'],
        ]);

        $phone = $validated['phone'];

        $user = User::where('phone', $phone)->first();

        if (! $user) {
            $email = $phone.'@e-chal.local';
            $user = User::where('email', $email)->first();

            if ($user) {
                $user->update([
                    'phone' => $phone,
                    'phone_verified_at' => now(),
                ]);
            }
        }

        if (! $user) {
            $user = User::create([
                'phone' => $phone,
                'name' => $phone,
                'email' => $phone.'@e-chal.local',
                'password' => Hash::make(Str::random(32)),
                'phone_verified_at' => now(),
            ]);
        } elseif (! $user->phone_verified_at) {
            $user->update(['phone_verified_at' => now()]);
        }

        Auth::login($user, true);

        $request->session()->regenerate();

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Login successful',
                'redirect' => route('dashboard'),
            ]);
        }

        return redirect()->route('dashboard');
    }
}
