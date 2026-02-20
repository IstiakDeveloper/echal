<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\OTPService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PhoneAuthController extends Controller
{
    protected OTPService $otpService;

    public function __construct(OTPService $otpService)
    {
        $this->otpService = $otpService;
    }

    /**
     * Show phone login/register page.
     */
    public function show(): Response
    {
        return Inertia::render('auth/phone-login');
    }

    /**
     * Send OTP to phone number (for login or registration).
     */
    public function sendOTP(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'phone' => ['required', 'string', 'regex:/^01[3-9]\d{8}$/'],
        ]);

        $phone = $validated['phone'];
        $result = $this->otpService->sendOTP($phone);

        if (! $result['success']) {
            $errorMessage = $result['error'] ?? 'Unknown error';
            Log::error('OTP send failed', [
                'phone' => $phone,
                'error' => $errorMessage,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to send OTP: '.$errorMessage,
                'error' => $errorMessage,
            ], 500);
        }

        $request->session()->put('otp_phone', $phone);
        $request->session()->put('otp_sent_at', now()->timestamp);

        $message = 'OTP sent successfully to '.$phone;
        if (config('services.twilio.dev_mode', false) && isset($result['dev_otp'])) {
            $message .= ' (DEV MODE: Use OTP '.$result['dev_otp'].')';
        }

        return response()->json([
            'success' => true,
            'message' => $message,
        ]);
    }

    /**
     * Verify OTP and login/register user.
     */
    public function verifyOTP(Request $request): JsonResponse|Response
    {
        $validated = $request->validate([
            'phone' => ['required', 'string', 'regex:/^01[3-9]\d{8}$/'],
            'otp' => ['required', 'string', 'size:6'],
        ]);

        $phone = $validated['phone'];
        $otp = $validated['otp'];

        if ($request->session()->get('otp_phone') !== $phone) {
            return response()->json([
                'success' => false,
                'message' => 'Phone number mismatch. Please request OTP again.',
            ], 400);
        }

        $result = $this->otpService->verifyOTP($phone, $otp);

        if (! $result['success']) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid OTP. Please try again.',
            ], 400);
        }

        // Check if user exists by phone first
        $user = User::where('phone', $phone)->first();

        // If not found by phone, check if user exists by email (from checkout)
        if (! $user) {
            $email = $phone.'@e-chal.local';
            $user = User::where('email', $email)->first();

            // If found by email, update phone
            if ($user) {
                $user->update([
                    'phone' => $phone,
                    'phone_verified_at' => now(),
                ]);
            }
        }

        // If still not found, create new user
        if (! $user) {
            $user = User::create([
                'phone' => $phone,
                'name' => $phone,
                'email' => $phone.'@e-chal.local',
                'password' => Hash::make(Str::random(32)),
                'phone_verified_at' => now(),
            ]);
        } elseif (! $user->phone_verified_at) {
            // Update phone_verified_at if not set
            $user->update(['phone_verified_at' => now()]);
        }

        Auth::login($user, true);

        $request->session()->forget(['otp_phone', 'otp_sent_at']);

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
