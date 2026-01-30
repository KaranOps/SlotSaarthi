/**
 * Card Component
 * White card with border and optional header
 */
export default function Card({
    children,
    title,
    subtitle,
    className = '',
    headerAction,
    ...props
}) {
    return (
        <div
            className={`bg-white border border-slate-200 rounded-xl shadow-sm ${className}`}
            {...props}
        >
            {(title || headerAction) && (
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                    <div>
                        {title && (
                            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                        )}
                        {subtitle && (
                            <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
                        )}
                    </div>
                    {headerAction && <div>{headerAction}</div>}
                </div>
            )}
            <div className="p-6">
                {children}
            </div>
        </div>
    );
}
