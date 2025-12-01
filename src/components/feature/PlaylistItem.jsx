import { memo } from 'react';
import { formatTime } from '../../utils/urlUtils';

export const PlaylistItem = memo(({
  tag,
  index,
  isPlaying,
  isCurrent,
  onClick,
  onEdit,
  onRemove
}) => {
  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-300 cursor-pointer ${
        isPlaying && isCurrent
          ? 'bg-gradient-to-r from-green-50 to-blue-50 border-green-400 shadow-lg scale-105'
          : 'bg-gray-50 border-gray-200 hover:border-blue-300 hover:shadow-md hover:scale-102'
      }`}
    >
      {isPlaying && isCurrent && (
        <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 to-blue-400/10 animate-pulse"></div>
      )}

      <div className="relative p-4 flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold ${
            isPlaying && isCurrent
              ? 'bg-green-500 text-white'
              : 'bg-gray-200 text-gray-600'
          }`}>
            {index + 1}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-mono font-semibold">
                {formatTime(tag.timestamp)}
              </span>
              <h4 className="font-bold text-gray-800 text-lg truncate">
                {tag.title}
              </h4>
              {isPlaying && isCurrent && (
                <div className="flex items-center gap-1">
                  <div className="w-1 h-4 bg-green-500 rounded animate-pulse"></div>
                  <div className="w-1 h-4 bg-green-500 rounded animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-1 h-4 bg-green-500 rounded animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 flex items-center gap-1 mb-1">
              <i className="ri-video-line"></i>
              {tag.videoTitle}
            </p>
            {tag.memo && (
              <p className="text-sm text-gray-600 mt-2 p-2 bg-white rounded-lg border border-gray-100">
                {tag.memo}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="no-theme p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
            title="편집"
          >
            <i className="ri-edit-line text-lg"></i>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="no-theme p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
            title="제거"
          >
            <i className="ri-delete-bin-line text-lg"></i>
          </button>
        </div>
      </div>
    </div>
  );
});

PlaylistItem.displayName = 'PlaylistItem';

export default PlaylistItem;

