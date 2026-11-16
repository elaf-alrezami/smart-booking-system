import { useState } from 'react'
import axios from './lib/axios'
import AdminDashboard from './components/AdminDashboard'
import ServicesManager from './components/ServicesManager'

function App() {
  const [user, setUser] = useState(null)
  const [error, setError] = useState('')

  const handleDemoLogin = async () => {
    try {
      setError('')
      const response = await axios.post('/demo-login')
      localStorage.setItem('access_token', response.data.access_token)
      setUser(response.data.user)
    } catch (err) {
      setError('فشل الاتصال بالخادم.')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* الترويسة */}
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-accent">نظام الحجوزات</h1>
        {user && (
          <div className="flex items-center gap-4">
            <span className="text-gray-400">أهلاً، {user.name}</span>
            <button onClick={handleLogout} className="text-sm bg-red-500/10 text-red-500 px-4 py-2 rounded hover:bg-red-500/20 cursor-pointer">
              خروج
            </button>
          </div>
        )}
      </header>

      {/* المحتوى الرئيسي */}
      <main className="max-w-6xl mx-auto">
        {!user ? (
          <div className="max-w-md mx-auto bg-[#1e1e1e] rounded-xl shadow-lg p-8 border border-gray-800 text-center mt-20">
            <h2 className="text-xl font-bold mb-6">تسجيل الدخول للإدارة</h2>
            <button onClick={handleDemoLogin} className="w-full bg-accent text-dark font-bold py-3 rounded-lg hover:opacity-90 transition-opacity mb-4 cursor-pointer">
              دخول تجريبي (Admin)
            </button>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
        ) : user.role === 'admin' ? (
          <div className="flex flex-col gap-8">
            <AdminDashboard user={user} />
            <ServicesManager />
          </div>
        ) : (
          <div className="text-center p-8 bg-[#1e1e1e] rounded-xl border border-gray-800 text-yellow-400">
            هذه الواجهة مخصصة للمدراء فقط.
          </div>
        )}
      </main>
    </div>
  )
}

export default App