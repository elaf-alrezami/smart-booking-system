<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Schedule;
use App\Http\Requests\StoreBookingRequest;
use Illuminate\Http\Request;
use App\Services\NotificationService;

class BookingController extends Controller
{
    // 1. خوارزمية الفحص (تم بناؤها مسبقاً)
    public function checkAvailability(Request $request)
    {
        $request->validate([
            'service_id' => 'required|exists:services,id',
            'booking_date' => 'required|date|after_or_equal:today',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
        ]);

        $dayOfWeek = strtolower(date('l', strtotime($request->booking_date)));
        $schedule = Schedule::where('day_of_week', $dayOfWeek)->first();

        if (!$schedule) {
            return response()->json(['message' => 'يوم إجازة، لا توجد أوقات عمل متاحة'], 400);
        }

        if ($request->start_time < $schedule->start_time || $request->end_time > $schedule->end_time) {
            return response()->json(['message' => 'الوقت المحدد يقع خارج أوقات العمل الرسمية'], 400);
        }

        $overlap = Booking::where('booking_date', $request->booking_date)
            ->where('start_time', '<', $request->end_time)
            ->where('end_time', '>', $request->start_time)
            ->whereIn('status', ['pending', 'confirmed'])
            ->exists();

        if ($overlap) {
            return response()->json(['message' => 'هذا الوقت محجوز مسبقاً، يرجى اختيار وقت آخر'], 409);
        }

        return response()->json(['message' => 'الوقت متاح للحجز'], 200);
    }

    // 2. جلب الحجوزات (المدير يرى كل شيء، العميل يرى حجوزاته فقط)
    public function index(Request $request)
    {
        if ($request->user()->role === 'admin') {
            $bookings = Booking::with(['user', 'service'])->orderBy('booking_date', 'desc')->get();
        } else {
            $bookings = Booking::with('service')->where('user_id', $request->user()->id)->orderBy('booking_date', 'desc')->get();
        }
        return response()->json($bookings, 200);
    }

    // 3. إنشاء الحجز الفعلي
    public function store(StoreBookingRequest $request)
    {
        // فحص التعارض مرة أخرى قبل الحفظ الفعلي لمنع ثغرة السباق (Race Condition)
        $overlap = Booking::where('booking_date', $request->booking_date)
            ->where('start_time', '<', $request->end_time)
            ->where('end_time', '>', $request->start_time)
            ->whereIn('status', ['pending', 'confirmed'])
            ->exists();

        if ($overlap) {
            return response()->json(['message' => 'عذراً، تم حجز هذا الوقت للتو من قبل مستخدم آخر'], 409);
        }

        $booking = Booking::create(array_merge(
            $request->validated(),
            ['user_id' => $request->user()->id, 'status' => 'pending']
        ));

        // استدعاء خدمة الإشعارات لإرسال Webhook إلى n8n
        $notificationService = new NotificationService();
        $notificationService->sendNewBookingNotification($booking);

        return response()->json(['message' => 'تم إنشاء الحجز بنجاح', 'booking' => $booking], 201);
    }

    // 4. تغيير حالة الحجز (خاص بالمدير: تأكيد أو إلغاء)
    public function updateStatus(Request $request, Booking $booking)
    {
        $request->validate(['status' => 'required|in:confirmed,cancelled']);
        $booking->update(['status' => $request->status]);
        
        return response()->json(['message' => 'تم تحديث حالة الحجز', 'booking' => $booking], 200);
    }
}