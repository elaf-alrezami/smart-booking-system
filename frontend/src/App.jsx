import { useState } from 'react'
import axios from './lib/axios'

function App() {
  const [user, setUser] = useState(null)
  const [error, setError] = useState('')

  const handleDemoLogin = async () => {
    try {
      setError('')
      // استدعاء مسار الدخول التجريبي
      const response = await axios.post('/demo-login')

      // حفظ التوكن في التخزين المحلي
      localStorage.setItem('access_token', response.data.access_token)
      setUser(response.data.user)
    } catch (err) {
      // التقاط أخطاء الشبكة أو الـ CORS
      setError('فشل الاتصال بالخادم. تأكدي من عمل Laravel وضبط إعدادات CORS.')
      console.error(err)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#1e1e1e] rounded-xl shadow-lg p-8 border border-gray-800 text-center">
        <h1 className="text-2xl font-bold text-[var(--color-accent)] mb-6">نظام الحجوزات الذكي</h1>

        {user ? (
          <div>
            <p className="text-green-400 mb-4 font-semibold">تم تسجيل الدخول بنجاح</p>
            <p className="text-gray-300 mb-2">أهلاً بك، {user.name}</p>
            <p className="text-sm text-gray-500 mb-6">الصلاحية: {user.role}</p>

            <button
              onClick={handleLogout}
              className="w-full bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500/20 py-2 rounded-lg transition-colors cursor-pointer"
            >
              تسجيل خروج
            </button>
          </div>
        ) : (
          <div>
            <button
              onClick={handleDemoLogin}
              className="w-full bg-[var(--color-accent)] text-[var(--color-dark)] font-bold py-3 rounded-lg hover:opacity-90 transition-opacity mb-4 cursor-pointer"
            >
              دخول تجريبي للوحة الإدارة
            </button>
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded p-3 mt-4">
                <p className="text-red-500 text-sm">{error}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default App