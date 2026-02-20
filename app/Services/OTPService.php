<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Twilio\Rest\Client;

class OTPService
{
    protected Client $twilio;

    protected string $serviceSid;

    public function __construct()
    {
        $sid = config('services.twilio.sid');
        $token = config('services.twilio.token');
        $this->serviceSid = config('services.twilio.verify_service_sid');

        if (empty($sid) || empty($token) || empty($this->serviceSid)) {
            Log::error('Twilio credentials missing', [
                'sid_set' => !empty($sid),
                'token_set' => !empty($token),
                'service_sid_set' => !empty($this->serviceSid),
            ]);
            throw new \RuntimeException('Twilio credentials not configured. Please check your .env file.');
        }

        $this->twilio = new Client($sid, $token);
    }

    /**
     * Send OTP to phone number.
     */
    public function sendOTP(string $phone): array
    {
        // Development mode: bypass Twilio for testing
        if (config('services.twilio.dev_mode', false)) {
            $devOtp = config('services.twilio.dev_otp', '123456');
            Log::info('OTP sent (DEV MODE)', [
                'phone' => $phone,
                'dev_otp' => $devOtp,
            ]);

            return [
                'success' => true,
                'sid' => 'dev_'.uniqid(),
                'status' => 'pending',
                'dev_mode' => true,
                'dev_otp' => $devOtp,
            ];
        }

        try {
            $formattedPhone = $this->formatPhone($phone);
            Log::info('Sending OTP', [
                'original_phone' => $phone,
                'formatted_phone' => $formattedPhone,
                'service_sid' => $this->serviceSid,
            ]);

            $verification = $this->twilio->verify->v2->services($this->serviceSid)
                ->verifications
                ->create($formattedPhone, 'sms');

            Log::info('OTP sent successfully', [
                'verification_sid' => $verification->sid,
                'status' => $verification->status,
            ]);

            return [
                'success' => true,
                'sid' => $verification->sid,
                'status' => $verification->status,
            ];
        } catch (\Exception $e) {
            Log::error('OTP send exception', [
                'phone' => $phone,
                'formatted_phone' => $this->formatPhone($phone),
                'error' => $e->getMessage(),
                'error_class' => get_class($e),
                'trace' => $e->getTraceAsString(),
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Verify OTP code.
     */
    public function verifyOTP(string $phone, string $code): array
    {
        // Development mode: accept dev OTP
        if (config('services.twilio.dev_mode', false)) {
            $devOtp = config('services.twilio.dev_otp', '123456');
            $isValid = $code === $devOtp;

            Log::info('OTP verified (DEV MODE)', [
                'phone' => $phone,
                'code' => $code,
                'valid' => $isValid,
            ]);

            return [
                'success' => $isValid,
                'status' => $isValid ? 'approved' : 'pending',
            ];
        }

        try {
            $formattedPhone = $this->formatPhone($phone);
            $verificationCheck = $this->twilio->verify->v2->services($this->serviceSid)
                ->verificationChecks
                ->create([
                    'to' => $formattedPhone,
                    'code' => $code,
                ]);

            return [
                'success' => $verificationCheck->status === 'approved',
                'status' => $verificationCheck->status,
            ];
        } catch (\Exception $e) {
            Log::error('OTP verify exception', [
                'phone' => $phone,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Format phone number to E.164 format (+880...).
     */
    protected function formatPhone(string $phone): string
    {
        $phone = preg_replace('/[^0-9]/', '', $phone);

        if (str_starts_with($phone, '880')) {
            return '+'.$phone;
        }

        if (str_starts_with($phone, '0')) {
            return '+88'.$phone;
        }

        if (strlen($phone) === 10) {
            return '+880'.$phone;
        }

        return '+880'.$phone;
    }
}
