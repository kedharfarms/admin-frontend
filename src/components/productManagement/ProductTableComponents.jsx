// components/ProductManagement/ProductTableComponents.jsx

export function ResponsiveTable({ children }) {
    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full">{children}</table>
            </div>
        </div>
    );
}

export function TableHeader({ children }) {
    return (
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
            {children}
        </th>
    );
}

export function TableRow({ children }) {
    return (
        <tr className="hover:bg-gray-50 transition-colors border-t border-gray-100">
            {children}
        </tr>
    );
}

export function TableCell({ children, className = '' }) {
    return (
        <td className={`px-4 py-3 whitespace-nowrap text-sm ${className}`}>
            {children}
        </td>
    );
}

export function StatusBadge({ active }) {
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
            <span className={`w-2 h-2 rounded-full mr-1 ${active ? 'bg-green-500' : 'bg-red-500'}`} />
            {active ? 'Active' : 'Inactive'}
        </span>
    );
}

export function Modal({ title, children, onClose, disabled }) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div
                className="bg-white rounded-lg w-full max-w-md max-h-[80vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header (fixed) */}
                <div className="p-6 border-b flex justify-between items-center">
                    <h3 className="text-xl font-semibold">{title}</h3>
                    <button
                        disabled={disabled}
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                    >
                        ×
                    </button>
                </div>

                {/* Scrollable Body */}
                <div className="p-6 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
}

export function Input({ label, type = 'text', ...props }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input
                type={type}
                {...props}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
        </div>
    );
}

export function Textarea({ label, ...props }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <textarea
                rows={3}
                {...props}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
            />
        </div>
    );
}

export function SelectInput({ label, options = [], placeholder, ...props }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <select
                {...props}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg
                 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
            >
                {placeholder && <option value="">{placeholder}</option>}
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        </div>
    );
}

export function Toggle({ label, checked, onChange }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">{label}</span>
            <button
                type="button"
                onClick={() => onChange(!checked)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    checked ? 'bg-blue-600' : 'bg-gray-200'
                }`}
            >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    checked ? 'translate-x-6' : 'translate-x-1'
                }`} />
            </button>
        </div>
    );
}