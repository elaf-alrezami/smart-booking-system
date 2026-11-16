<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreServiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        // السماح بالوصول، لأننا سنحمي المسار لاحقاً بـ Middleware الصلاحيات
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'duration_minutes' => 'required|integer|min:15', // الحد الأدنى للخدمة 15 دقيقة
            'is_active' => 'boolean',
        ];
    }
}