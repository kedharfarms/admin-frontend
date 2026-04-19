import React from 'react';

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  subtitle,
  icon,
  children,
  confirmText,
  cancelText = 'Cancel',
  confirmButtonClass="bg-[#94BF30] hover:bg-[#7CA126] focus:ring-[#94BF30]",
  isLoading = false,
  showHeader = true,
  headerClass = 'bg-gradient-to-r from-blue-50 to-indigo-50',
  zIndex = 'z-50',
}) {
  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 ${zIndex} flex items-center justify-center bg-black/60 backdrop-blur-sm p-4`}
    >
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-md">
        {/* Header */}
        {showHeader && (
          <div className={`px-6 py-4 border-b border-gray-200 rounded-t-xl ${headerClass}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {icon && <div className="flex-shrink-0">{icon}</div>}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-0">{title}</h3>
                  {subtitle && <p className="text-sm text-gray-600 mt-0.5">{subtitle}</p>}
                </div>
              </div>
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          <div className="text-sm text-gray-700">{children}</div>

          {/* Buttons */}
          <div className="flex gap-3 mt-6">
            {cancelText && (
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelText}
              </button>
            )}
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex-1 px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${confirmButtonClass}`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {confirmText}
                </>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
