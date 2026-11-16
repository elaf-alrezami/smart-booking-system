<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'بيانات الاعتماد غير صحيحة'
            ], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'تم تسجيل الدخول بنجاح',
            'access_token' => $token,
            'user' => $user
        ], 200);
    }

    public function demoLogin(Request $request)
    {
        // البحث عن الحساب التجريبي، وإنشاؤه تلقائياً إذا تم مسح قاعدة البيانات بالخطأ
        $demoUser = User::firstOrCreate(
            ['email' => 'admin@test.com'],
            [
                'name' => 'Demo Admin',
                'password' => \Illuminate\Support\Facades\Hash::make('password123'),
                'role' => 'admin'
            ]
        );

        // إنشاء الرمز (Token)
        $token = $demoUser->createToken('demo_token')->plainTextToken;

        return response()->json([
            'message' => 'تم تسجيل الدخول للحساب التجريبي بنجاح',
            'access_token' => $token,
            'user' => $demoUser
        ], 200);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'تم تسجيل الخروج بنجاح'
        ], 200);
    }
}
