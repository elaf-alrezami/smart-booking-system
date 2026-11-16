import { useState, useEffect } from 'react'
import axios from '../lib/axios'

export default function ServicesManager() {
    const [services, setServices] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [newService, setNewService] = useState({ name: '', description: '', duration_minutes: 30, price: 0, is_active: true })

    useEffect(() => {
        fetchServices()
    }, [])

    const fetchServices = async () => {
        try {
            setLoading(true)
            const response = await axios.get('/services')
            setServices(response.data)
            setError('')
        } catch (err) {
            setError('فشل في جلب الخدمات.')
        } finally {
            setLoading(false)
        }
    }

    const handleAddService = async (e) => {
        e.preventDefault()
        try {
            const response = await axios.post('/admin/services', newService)
            setServices([...services, response.data.service])
            setNewService({ name: '', description: '', duration_minutes: 30, price: 0, is_active: true }) // تفريغ النموذج
            alert('تمت إضافة الخدمة بنجاح')
        } catch (err) {
            alert('حدث خطأ أثناء إضافة الخدمة')
            console.error(err)
        }
    }

    const toggleActive = async (id, currentStatus) => {
        try {
            await axios.patch(`/admin/services/${id}/status`, { is_active: !currentStatus })
            setServices(services.map(s => s.id === id ? { ...s, is_active: !currentStatus } : s))
        } catch (err) {
            alert('خطأ في تحديث الحالة')
        }
    }

    if (loading) return <div className="text-center p-4 text-accent">جاري تحميل الخدمات...</div>

    return (
        <div className="bg-[#1e1e1e] rounded-xl shadow-lg border border-gray-800 p-6 mt-8">
            <h2 className="text-xl font-bold text-accent mb-6">إدارة الخدمات</h2>

            {error && <p className="text-red-500 mb-4">{error}</p>}

            {/* نموذج إضافة خدمة جديدة */}
            <form onSubmit={handleAddService} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8 bg-[#131313] p-4 rounded-lg border border-gray-800">
                <input
                    type="text"
                    placeholder="اسم الخدمة"
                    required
                    className="bg-transparent border border-gray-700 rounded p-2 text-white focus:border-accent outline-none"
                    value={newService.name}
                    onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                />
                <input
                    type="number"
                    placeholder="السعر"
                    required
                    className="bg-transparent border border-gray-700 rounded p-2 text-white focus:border-accent outline-none"
                    value={newService.price}
                    onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                />
                <input
                    type="number"
                    placeholder="المدة (دقائق)"
                    required
                    className="bg-transparent border border-gray-700 rounded p-2 text-white focus:border-accent outline-none"
                    value={newService.duration_minutes}
                    onChange={(e) => setNewService({ ...newService, duration_minutes: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="وصف قصير"
                    className="bg-transparent border border-gray-700 rounded p-2 text-white focus:border-accent outline-none lg:col-span-2"
                    value={newService.description}
                    onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                />
                <button type="submit" className="bg-accent text-dark font-bold rounded p-2 hover:opacity-90 transition lg:col-span-5 cursor-pointer">
                    إضافة خدمة جديدة
                </button>
            </form>

            {/* جدول الخدمات الحالية */}
            <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                    <thead>
                        <tr className="border-b border-gray-700 text-gray-400 text-sm">
                            <th className="p-3">الاسم</th>
                            <th className="p-3">السعر</th>
                            <th className="p-3">المدة</th>
                            <th className="p-3">الحالة</th>
                            <th className="p-3">الإجراء</th>
                        </tr>
                    </thead>
                    <tbody>
                        {services.map(service => (
                            <tr key={service.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                <td className="p-3">{service.name}</td>
                                <td className="p-3">{service.price} ريال</td>
                                <td className="p-3">{service.duration_minutes} دقيقة</td>
                                <td className="p-3">
                                    <span className={`px-2 py-1 text-xs rounded-full ${service.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                        {service.is_active ? 'مفعل' : 'معطل'}
                                    </span>
                                </td>
                                <td className="p-3">
                                    <button
                                        onClick={() => toggleActive(service.id, service.is_active)}
                                        className="text-xs bg-gray-700 text-white px-3 py-1 rounded hover:bg-gray-600 cursor-pointer"
                                    >
                                        {service.is_active ? 'تعطيل' : 'تفعيل'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {services.length === 0 && (
                            <tr>
                                <td colSpan="5" className="p-4 text-center text-gray-500">لا توجد خدمات مضافة بعد.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}