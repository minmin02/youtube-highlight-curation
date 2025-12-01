import { formatTime, groupTagsByVideo } from '../../utils/urlUtils';

export const EditPlaylistForm = ({
  playlist,
  selectedTags,
  onTagSelection,
  onSubmit,
  onCancel,
  tags
}) => {
  const tagsByVideo = groupTagsByVideo(tags);

  return (
    <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
      <h3 className="font-semibold mb-3 text-purple-800">
        "{playlist.name}"에 태그 추가
      </h3>
      <div className="space-y-3">
        <p className="text-sm font-medium text-purple-800">추가할 태그 선택:</p>
        {Object.values(tagsByVideo).map((videoGroup) => (
          <div key={videoGroup.videoId} className="border-l-4 border-purple-400 pl-3">
            <h4 className="font-medium text-purple-700 mb-2 text-sm">
              {videoGroup.videoTitle} ({videoGroup.tags.length}개)
            </h4>
            <div className="space-y-1">
              {videoGroup.tags
                .filter(tag => !playlist.tags.some(pTag => pTag.id === tag.id))
                .sort((a, b) => a.timestamp - b.timestamp)
                .map((tag) => (
                  <label key={tag.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedTags.includes(tag.id)}
                      onChange={() => onTagSelection(tag.id)}
                      className="rounded border-purple-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-purple-600 font-mono">
                      {formatTime(tag.timestamp)}
                    </span>
                    <span className="text-gray-700">{tag.title}</span>
                  </label>
                ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={onSubmit}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors whitespace-nowrap cursor-pointer"
        >
          태그 추가
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors whitespace-nowrap cursor-pointer"
        >
          취소
        </button>
      </div>
    </div>
  );
};

export default EditPlaylistForm;

