<?php

namespace App\Services;

use App\Models\Booking;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    /**
     * إرسال تنبيه الحجز الجديد إلى n8n
     */
    public function sendNewBookingNotification(Booking $booking)
    {
        // سحب رابط Webhook الخاص بـ n8n من ملف .env
        $webhookUrl = env('N8N_WEBHOOK_URL');

        if (!$webhookUrl) {
            Log::warning('N8N_WEBHOOK_URL is not configured. Notification skipped.');
            return;
        }

        try {
            // تحميل العلاقات (المستخدم والخدمة) إذا لم تكن محملة مسبقاً
            $booking->loadMissing(['user', 'service']);

            // تجهيز البيانات (Payload)
            $payload = [
                'event' => 'new_booking',
                'booking_id' => $booking->id,
                'client_name' => $booking->user->name,
                'client_email' => $booking->user->email,
                'service_name' => $booking->service->name,
                'booking_date' => $booking->booking_date,
                'time_slot' => $booking->start_time . ' - ' . $booking->end_time,
                'price' => $booking->service->price,
                'status' => $booking->status,
            ];

            // إرسال طلب POST إلى n8n بصيغة JSON وبشكل متزامن
            $response = Http::timeout(5)->post($webhookUrl, $payload);

            if (!$response->successful()) {
                Log::error('Failed to send notification to n8n. Status: ' . $response->status());
            }

        } catch (\Exception $e) {
            // منع انهيار النظام (500 Error) إذا فشل الاتصال بـ n8n
            Log::error('Exception while sending n8n notification: ' . $e->getMessage());
        }
    }
}