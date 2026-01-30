/**
 * Input Component
 * Text input with label, error state, and Medoc styling (Teal focus)
 */
export default function Input({
    label,
    error,
    type = 'text',
    className = '',
    ...props
}) {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    {label}
                </label>
            )}
            <input
                type={type}
                className={`
          w-full px-3 py-2 
          bg-white border border-slate-300 rounded-lg
          text-slate-900 placeholder-slate-400
          focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500
          transition-colors duration-200
          ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
          ${className}
        `}
                {...props}
            />
            {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
        </div>
    );
}
