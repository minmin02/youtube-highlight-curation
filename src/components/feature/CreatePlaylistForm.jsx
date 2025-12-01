import { formatTime, groupTagsByVideo } from '../../utils/urlUtils';

export const CreatePlaylistForm = ({
  playlistName,
  setPlaylistName,
  selectedTags,
  onTagSelection,
  rating,
  onRatingChange,
  onSubmit,
  onCancel,
  tags
}) => {
  const tagsByVideo = groupTagsByVideo(tags);

  return (
    <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
      <h3 className="font-semibold mb-3 text-blue-800">새 플레이리스트 만들기</h3>
      <div className="space-y-4">
        <input
          type="text"
          value={playlistName}
          onChange={(e) => setPlaylistName(e.target.value)}
          placeholder="플레이리스트 이름을 입력하세요"
          className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="space-y-3">
          <p className="text-sm font-medium text-blue-800">태그 선택:</p>
          {Object.values(tagsByVideo).map((videoGroup) => (
            <div key={videoGroup.videoId} className="border-l-4 border-blue-400 pl-3">
              <h4 className="font-medium text-blue-700 mb-2 text-sm">
                {videoGroup.videoTitle} ({videoGroup.tags.length}개)
              </h4>
              <div className="space-y-1">
                {videoGroup.tags
                  .sort((a, b) => a.timestamp - b.timestamp)
                  .map((tag) => (
                    <label key={tag.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={selectedTags.includes(tag.id)}
                        onChange={() => onTagSelection(tag.id)}
                        className="rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-blue-600 font-mono">
                        {formatTime(tag.timestamp)}
                      </span>
                      <span className="text-gray-700">{tag.title}</span>
                    </label>
                  ))}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-blue-800">별점 (선택사항):</p>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => onRatingChange(star === rating ? 0 : star)}
                className={`no-theme text-xl transition-colors ${
                  star <= rating
                    ? 'text-yellow-400 hover:text-yellow-500'
                    : 'text-gray-300 hover:text-gray-400'
                }`}
              >
                <i className="ri-star-fill"></i>
              </button>
            ))}
            {rating > 0 && (
              <span className="text-sm text-gray-600 ml-2">({rating}점)</span>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap cursor-pointer"
          >
            생성
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors whitespace-nowrap cursor-pointer"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePlaylistForm;

