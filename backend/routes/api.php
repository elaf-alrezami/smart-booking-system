<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\BookingController;

// --- مسارات عامة ---
Route::post('/login', [AuthController::class, 'login']);
Route::post('/demo-login', [AuthController::class, 'demoLogin']);

// --- مسارات تتطلب مصادقة (أي مستخدم) ---
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // الخدمات (للعميل لكي يختار منها)
    Route::get('/services', [ServiceController::class, 'index']);

    // الحجوزات
    Route::post('/bookings/check-availability', [BookingController::class, 'checkAvailability']);
    Route::get('/bookings', [BookingController::class, 'index']);
    Route::post('/bookings', [BookingController::class, 'store']);
});

// --- مسارات الإدارة (تتطلب مصادقة + صلاحية admin) ---
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    // إدارة الخدمات بالكامل
    Route::get('/admin/services', [ServiceController::class, 'indexAdmin']);
    Route::post('/admin/services', [ServiceController::class, 'store']);
    Route::put('/admin/services/{service}', [ServiceController::class, 'update']);
    Route::delete('/admin/services/{service}', [ServiceController::class, 'destroy']);

    // التحكم بالحجوزات
    Route::patch('/admin/bookings/{booking}/status', [BookingController::class, 'updateStatus']);
});