/**
 * Select Component
 * Dropdown with label and Medoc styling (Teal focus)
 */
export default function Select({
    label,
    error,
    options = [],
    placeholder = 'Select an option',
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
            <select
                className={`
          w-full px-3 py-2 
          bg-white border border-slate-300 rounded-lg
          text-slate-900
          focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500
          transition-colors duration-200
          cursor-pointer
          ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
          ${className}
        `}
                {...props}
            >
                {placeholder && (
                    <option value="" disabled>
                        {placeholder}
                    </option>
                )}
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
        </div>
    );
}
