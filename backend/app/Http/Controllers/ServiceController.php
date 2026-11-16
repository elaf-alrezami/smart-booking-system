<?php

namespace App\Http\Controllers;

use App\Models\Service;
use App\Http\Requests\StoreServiceRequest;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    // عرض الخدمات المتاحة (متاح للجميع)
    public function index()
    {
        return response()->json(Service::where('is_active', true)->get(), 200);
    }

    // عرض كل الخدمات للمدير (بما فيها غير النشطة)
    public function indexAdmin()
    {
        return response()->json(Service::all(), 200);
    }

    // إنشاء خدمة جديدة (مدير فقط)
    public function store(StoreServiceRequest $request)
    {
        $service = Service::create($request->validated());
        return response()->json(['message' => 'تم إنشاء الخدمة بنجاح', 'service' => $service], 201);
    }

    // تعديل خدمة (مدير فقط)
    public function update(StoreServiceRequest $request, Service $service)
    {
        $service->update($request->validated());
        return response()->json(['message' => 'تم تحديث الخدمة', 'service' => $service], 200);
    }

    // تعطيل خدمة (مدير فقط) - بدلاً من الحذف النهائي لمنع تكسر الحجوزات السابقة
    public function destroy(Service $service)
    {
        $service->update(['is_active' => false]);
        return response()->json(['message' => 'تم تعطيل الخدمة بنجاح'], 200);
    }
}