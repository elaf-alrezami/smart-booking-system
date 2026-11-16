<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Booking;
use App\Models\Schedule;

class BookingController extends Controller
{
    public function checkAvailability(Request $request)
    {
        // 1. تفتيش صارم على المدخلات
        $request->validate([
            'service_id' => 'required|exists:services,id',
            'booking_date' => 'required|date|after_or_equal:today',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
        ]);

        // 2. التحقق من أوقات العمل الرسمية للمدير في ذلك اليوم
        $dayOfWeek = strtolower(date('l', strtotime($request->booking_date))); // استخراج اليوم (مثل: monday)
        
        // جلب جدول العمل (نفترض أن المدير هو المستخدم الأول حالياً أو يتم تمرير المعرف)
        $schedule = Schedule::where('day_of_week', $dayOfWeek)->first();

        if (!$schedule) {
            return response()->json(['message' => 'يوم إجازة، لا توجد أوقات عمل متاحة'], 400);
        }

        if ($request->start_time < $schedule->start_time || $request->end_time > $schedule->end_time) {
            return response()->json(['message' => 'الوقت المحدد يقع خارج أوقات العمل الرسمية'], 400);
        }

        // 3. خوارزمية فحص التعارض (Overlap Algorithm)
        $overlap = Booking::where('booking_date', $request->booking_date)
            ->where('start_time', '<', $request->end_time)
            ->where('end_time', '>', $request->start_time)
            ->whereIn('status', ['pending', 'confirmed'])
            ->exists();

        if ($overlap) {
            return response()->json(['message' => 'هذا الوقت محجوز مسبقاً، يرجى اختيار وقت آخر'], 409); // 409 Conflict
        }

        return response()->json(['message' => 'الوقت متاح للحجز'], 200);
    }
}