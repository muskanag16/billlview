export default function MetricCard({ title, value, type }: { title: string; value: string; type?: 'default' | 'success' | 'warning' | 'danger' }) {
    const colors = {
        default: 'text-gray-900',
        success: 'text-green-600',
        warning: 'text-amber-600',
        danger: 'text-red-600',
    };

    const bgGradients = {
        default: 'from-blue-50 to-indigo-50',
        success: 'from-emerald-50 to-teal-50',
        warning: 'from-amber-50 to-orange-50',
        danger: 'from-red-50 to-rose-50',
    };

    return (
        <div className={`glass-panel p-6 rounded-2xl bg-gradient-to-br ${bgGradients[type || 'default']} hover:-translate-y-1 hover:shadow-lg transition-all duration-300 relative overflow-hidden group`}>
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-300 transform group-hover:scale-110">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={colors[type || 'default']}>
                    <path d="M12 2L2 22h20L12 2z" />
                </svg>
            </div>
            <h3 className="text-sm font-semibold text-slate-600 mb-2">{title}</h3>
            <p className={`text-3xl font-extrabold tracking-tight ${colors[type || 'default']}`}>{value}</p>
        </div>
    );
}
