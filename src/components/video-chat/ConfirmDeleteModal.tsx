
export function ConfirmDeleteModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 shadow-xl w-[90%] max-w-sm text-center">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Delete this message?</h2>
        <p className="text-sm text-gray-600 mb-6">This action cannot be undone.</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded bg-pink-600 hover:bg-pink-700 text-white"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
