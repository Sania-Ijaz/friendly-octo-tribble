import React from 'react';

export default function ErrorMessage({ message, onDismiss }) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4">
      <span className="text-lg leading-none">⚠️</span>
      <div className="flex-1 text-sm">{message}</div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-red-400 hover:text-red-600 text-lg leading-none ml-2"
          aria-label="Dismiss error"
        >
          ×
        </button>
      )}
    </div>
  );
}
