import { memo } from 'react';
import { formatTime } from '../../utils/urlUtils';
import { RatingStars } from './RatingStars';

export const PlaylistCard = memo(({
  playlist,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onShare,
  onRatingChange
}) => {
  return (
    <div
      onClick={onSelect}
      className={`group relative overflow-hidden rounded-xl border-2 cursor-pointer transition-all duration-300 ${
        isSelected
          ? 'bg-gradient-to-br from-blue-50 to-purple-50 border-blue-400 shadow-lg scale-105'
          : 'bg-white border-gray-200 hover:border-purple-300 hover:shadow-md'
      }`}
    >
      <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="no-theme w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-blue-600 hover:border-blue-300 transition-all shadow-sm"
          title="이름 수정"
        >
          <i className="ri-edit-line text-sm"></i>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="no-theme w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-red-600 hover:border-red-300 transition-all shadow-sm"
          title="삭제"
        >
          <i className="ri-delete-bin-line text-sm"></i>
        </button>
      </div>

      <div className="p-5">
        <div className="flex items-start gap-3">
          {isSelected && (
            <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
              <i className="ri-check-line text-white text-sm font-bold"></i>
            </div>
          )}
          <h4 className={`font-bold text-gray-800 text-lg mb-2 pr-16 ${isSelected ? '' : 'pl-0'}`}>
            {playlist.name}
          </h4>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
          <span className="flex items-center gap-1">
            <i className="ri-music-2-line"></i>
            {playlist.tags.length}개 트랙
          </span>
          <span className="flex items-center gap-1">
            <i className="ri-calendar-line"></i>
            {new Date(playlist.createdAt).toLocaleDateString('ko-KR')}
          </span>
        </div>

        <div className="mb-3">
          {playlist.sharedFrom && (
            <div className="text-xs text-purple-600 mb-2 flex items-center gap-1">
              <i className="ri-share-line"></i>
              {playlist.sharedFrom}님에게 공유받음
            </div>
          )}
          <RatingStars
            rating={playlist.rating || 0}
            onRatingChange={onRatingChange}
            size="sm"
          />
        </div>

        <div className="mt-3 flex gap-2">
          {playlist.tags.slice(0, 3).map((tag, idx) => (
            <div
              key={idx}
              className="flex-1 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-600 font-mono"
            >
              {formatTime(tag.timestamp)}
            </div>
          ))}
          {playlist.tags.length > 3 && (
            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center text-xs font-bold text-purple-700">
              +{playlist.tags.length - 3}
            </div>
          )}
        </div>

        <div className="mt-3 pt-3 border-t border-gray-200">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onShare();
            }}
            className="no-theme w-full px-3 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center gap-2"
            title="이메일로 공유하기"
          >
            <i className="ri-mail-send-line text-lg"></i>
            <span className="text-sm font-medium">이메일로 공유</span>
          </button>
        </div>
      </div>
    </div>
  );
});

PlaylistCard.displayName = 'PlaylistCard';

export default PlaylistCard;

