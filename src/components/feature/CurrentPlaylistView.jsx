import { memo } from 'react';
import { RatingStars } from './RatingStars';

export const CurrentPlaylistView = memo(({
  playlist,
  isPlaying,
  onAddTags,
  onShare,
  onPlay,
  onStop,
  onRatingChange
}) => {
  return (
    <div className="bg-blue-50 rounded-t-xl p-6 border-b-2 border-blue-100">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold mb-2 text-gray-800">
            {playlist.name}
          </h3>
          <p className="text-gray-600 text-sm mb-2">
            {playlist.tags.length}개의 하이라이트
          </p>
          {playlist.sharedFrom && (
            <p className="text-sm text-purple-600 mb-2 flex items-center gap-1">
              <i className="ri-share-line"></i>
              {playlist.sharedFrom}님에게 공유받음
            </p>
          )}
          <RatingStars
            rating={playlist.rating || 0}
            onRatingChange={onRatingChange}
            size="md"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={onAddTags}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all whitespace-nowrap cursor-pointer flex items-center gap-2"
          >
            <i className="ri-add-line"></i>
            추가
          </button>
          <button
            onClick={onShare}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all whitespace-nowrap cursor-pointer flex items-center gap-2"
          >
            <i className="ri-share-line"></i>
            공유
          </button>
          {isPlaying ? (
            <button
              onClick={onStop}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all whitespace-nowrap cursor-pointer flex items-center gap-2"
            >
              <i className="ri-pause-line"></i>
              정지
            </button>
          ) : (
            <button
              onClick={onPlay}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all whitespace-nowrap cursor-pointer flex items-center gap-2"
            >
              <i className="ri-play-line"></i>
              재생
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

CurrentPlaylistView.displayName = 'CurrentPlaylistView';

export default CurrentPlaylistView;

