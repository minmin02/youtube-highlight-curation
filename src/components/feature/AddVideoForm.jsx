import { useState } from 'react';
import { extractVideoId } from '../../utils/urlUtils';
import useVideoStore from '../../stores/useVideoStore';
import { DEFAULT_VALUES, MESSAGES } from '../../constants';

export const AddVideoForm = ({ onClose }) => {
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const { addTagsFromVideo } = useVideoStore();

  const handleAddVideoTags = async () => {
    const videoId = extractVideoId(newVideoUrl);
    if (!videoId) {
      alert(MESSAGES.VIDEO.INVALID_URL);
      return;
    }

    try {
      const videoTitle = `영상 ${videoId}`;

      const tagInput = prompt(MESSAGES.TAG.ADD_FORMAT);

      if (!tagInput) return;

      const newTags = tagInput.split(',').map(tagStr => {
        const [title, timeStr, memo] = tagStr.trim().split(':');
        const timestamp = parseInt(timeStr) || 0;

        return {
          title: title?.trim() || DEFAULT_VALUES.EMPTY_TAG_TITLE,
          memo: memo?.trim() || '',
          timestamp,
          duration: DEFAULT_VALUES.TAG_DURATION,
          createdAt: new Date().toISOString()
        };
      }).filter(tag => tag.title !== DEFAULT_VALUES.EMPTY_TAG_TITLE);

      if (newTags.length > 0) {
        addTagsFromVideo(videoId, videoTitle, newTags);
        setNewVideoUrl('');
        onClose();
        alert(MESSAGES.TAG.ADD_SUCCESS(newTags.length));
      }
    } catch (error) {
      console.error('태그 추가 중 오류:', error);
      alert(MESSAGES.TAG.ADD_ERROR);
    }
  };

  return (
    <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
      <h3 className="font-semibold mb-3 text-green-800">다른 영상의 태그 추가</h3>
      <div className="space-y-3">
        <input
          type="text"
          value={newVideoUrl}
          onChange={(e) => setNewVideoUrl(e.target.value)}
          placeholder="YouTube URL을 입력하세요"
          className="w-full px-3 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <div className="flex gap-2">
          <button
            onClick={handleAddVideoTags}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap cursor-pointer"
          >
            태그 추가
          </button>
          <button
            onClick={() => {
              onClose();
              setNewVideoUrl('');
            }}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors whitespace-nowrap cursor-pointer"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddVideoForm;

