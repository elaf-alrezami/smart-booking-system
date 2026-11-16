import { useState, useEffect } from 'react'
import axios from '../lib/axios'

export default function AdminDashboard({ user }) {
    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    // جلب الحجوزات عند تحميل المكون
    useEffect(() => {
        fetchBookings()
    }, [])

    const fetchBookings = async () => {
        try {
            setLoading(true)
            const response = await axios.get('/bookings')
            setBookings(response.data)
            setError('')
        } catch (err) {
            setError('فشل في جلب بيانات الحجوزات. تأكد من صلاحيات الوصول.')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const updateStatus = async (bookingId, newStatus) => {
        try {
            await axios.patch(`/admin/bookings/${bookingId}/status`, { status: newStatus })
            // تحديث الحالة محلياً دون إعادة تحميل كاملة (Optimistic UI)
            setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: newStatus } : b))
        } catch (err) {
            alert('حدث خطأ أثناء تحديث حالة الحجز')
        }
    }

    if (loading) return <div className="text-center p-8 text-accent animate-pulse">جاري تحميل البيانات...</div>
    if (error) return <div className="text-red-500 p-4 bg-red-500/10 rounded-lg">{error}</div>

    return (
        <div className="bg-[#1e1e1e] rounded-xl shadow-lg border border-gray-800 p-6 overflow-x-auto">
            <h2 className="text-xl font-bold text-accent mb-4">إدارة الحجوزات</h2>

            {bookings.length === 0 ? (
                <p className="text-gray-400">لا توجد حجوزات حالياً.</p>
            ) : (
                <table className="w-full text-right border-collapse">
                    <thead>
                        <tr className="border-b border-gray-700 text-gray-400 text-sm">
                            <th className="p-3">العميل</th>
                            <th className="p-3">الخدمة</th>
                            <th className="p-3">التاريخ والوقت</th>
                            <th className="p-3">الحالة</th>
                            <th className="p-3">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.map((booking) => (
                            <tr key={booking.id} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                                <td className="p-3">{booking.user.name}</td>
                                <td className="p-3">{booking.service.name}</td>
                                <td className="p-3" dir="ltr">
                                    <span className="block">{booking.booking_date}</span>
                                    <span className="text-xs text-gray-500">{booking.start_time.substring(0, 5)} - {booking.end_time.substring(0, 5)}</span>
                                </td>
                                <td className="p-3">
                                    <span className={`px-2 py-1 text-xs rounded-full ${booking.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                                        booking.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                                            'bg-yellow-500/20 text-yellow-400'
                                        }`}>
                                        {booking.status === 'confirmed' ? 'مؤكد' : booking.status === 'cancelled' ? 'ملغي' : 'معلق'}
                                    </span>
                                </td>
                                <td className="p-3 flex gap-2">
                                    {booking.status === 'pending' && (
                                        <>
                                            <button onClick={() => updateStatus(booking.id, 'confirmed')} className="text-xs bg-green-500/10 text-green-400 px-3 py-1 rounded hover:bg-green-500/20 cursor-pointer">تأكيد</button>
                                            <button onClick={() => updateStatus(booking.id, 'cancelled')} className="text-xs bg-red-500/10 text-red-400 px-3 py-1 rounded hover:bg-red-500/20 cursor-pointer">إلغاء</button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    )
}