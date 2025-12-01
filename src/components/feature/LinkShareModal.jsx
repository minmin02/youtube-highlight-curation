export const LinkShareModal = ({ isOpen, onClose, playlistName, shareUrl, onCopy }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">플레이리스트 공유</h3>
        <p className="text-gray-600 mb-4">
          "{playlistName}" 플레이리스트를 공유하세요
        </p>
        <div className="space-y-3">
          <div className="p-3 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-600 break-all">
              {shareUrl}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onCopy}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap cursor-pointer"
            >
              <i className="ri-clipboard-line mr-2"></i>
              링크 복사
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors whitespace-nowrap cursor-pointer"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkShareModal;

