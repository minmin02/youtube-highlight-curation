
import { useState } from 'react';
import YouTube from 'react-youtube';
import useVideoStore from '../../stores/useVideoStore';
import { Modal } from '../base/Modal';
import { formatTime, extractVideoId } from '../../utils/urlUtils';
import { MESSAGES } from '../../constants';

const VideoPlayer = () => {
  const [videoUrl, setVideoUrl] = useState('');
  const [showTagModal, setShowTagModal] = useState(false);
  const [tagForm, setTagForm] = useState({
    title: '',
    memo: '',
    minutes: '',
    seconds: '',
    duration: '10'
  });
  
  const {
    currentVideoId,
    currentVideoTitle,
    setCurrentVideo,
    setPlayer,
    addTag,
    player,
  } = useVideoStore();

  const handleLoadVideo = () => {
    const videoId = extractVideoId(videoUrl);
    if (videoId) {
      setCurrentVideo(videoId, '');
    } else {
      alert(MESSAGES.VIDEO.LOAD_ERROR);
    }
  };

  const onReady = (event) => {
    const playerInstance = event.target;
    setPlayer(playerInstance);

    const videoData = playerInstance.getVideoData();
    if (videoData && videoData.title) {
      setCurrentVideo(currentVideoId, videoData.title);
    }
  };

  const handleAddTag = () => {
    if (!player) {
      alert(MESSAGES.VIDEO.LOAD_REQUIRED);
      return;
    }

    const currentTime = Math.floor(player.getCurrentTime());
    const currentMinutes = Math.floor(currentTime / 60);
    const currentSeconds = currentTime % 60;
    
    setTagForm({
      title: '',
      memo: '',
      minutes: currentMinutes.toString(),
      seconds: currentSeconds.toString(),
      duration: '10'
    });
    setShowTagModal(true);
  };

  const handleTagFormSubmit = () => {
    if (!tagForm.title.trim()) {
      alert(MESSAGES.TAG.TITLE_REQUIRED);
      return;
    }

    const minutes = parseInt(tagForm.minutes) || 0;
    const seconds = parseInt(tagForm.seconds) || 0;
    const totalSeconds = minutes * 60 + seconds;
    const duration = parseInt(tagForm.duration) || 10;

    if (totalSeconds < 0) {
      alert(MESSAGES.VIDEO.LOAD_ERROR);
      return;
    }

    addTag({
      title: tagForm.title.trim(),
      memo: tagForm.memo.trim(),
      timestamp: totalSeconds,
      duration,
      createdAt: new Date().toISOString(),
    });

    setShowTagModal(false);
    setTagForm({
      title: '',
      memo: '',
      minutes: '',
      seconds: '',
      duration: '10'
    });
  };

  const handleCurrentTimeSet = () => {
    if (!player) return;
    
    const currentTime = Math.floor(player.getCurrentTime());
    const currentMinutes = Math.floor(currentTime / 60);
    const currentSeconds = currentTime % 60;
    
    setTagForm(prev => ({
      ...prev,
      minutes: currentMinutes.toString(),
      seconds: currentSeconds.toString()
    }));
  };

  const opts = {
    height: '400',
    width: '100%',
    playerVars: {
      autoplay: 0,
      controls: 1,
      rel: 0,
      showinfo: 0,
      modestbranding: 1,
    },
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-6">
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="YouTube URL을 입력하세요"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleLoadVideo}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap cursor-pointer"
            >
              영상 로드
            </button>
          </div>
        </div>

        {currentVideoId && (
          <div className="space-y-4">
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <YouTube
                videoId={currentVideoId}
                opts={opts}
                onReady={onReady}
                className="w-full h-full"
              />
            </div>

            {currentVideoTitle && (
              <h3 className="text-lg font-semibold text-gray-800">
                {currentVideoTitle}
              </h3>
            )}

            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {player && (
                  <span>
                    현재 시간:{' '}
                    {formatTime(
                      Math.floor(player.getCurrentTime?.() || 0),
                    )}
                  </span>
                )}
              </div>

              <button
                onClick={handleAddTag}
                disabled={!player}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors whitespace-nowrap cursor-pointer"
              >
                <i className="ri-add-line mr-2"></i>
                태그 추가
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={showTagModal}
        onClose={() => setShowTagModal(false)}
        title="새 태그 추가"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              태그 제목 *
            </label>
            <input
              type="text"
              value={tagForm.title}
              onChange={(e) => setTagForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder="태그 제목을 입력하세요"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              시작 시간
            </label>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={tagForm.minutes}
                  onChange={(e) => setTagForm(prev => ({ ...prev, minutes: e.target.value }))}
                  placeholder="0"
                  min="0"
                  className="w-16 px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                />
                <span className="text-sm text-gray-600">분</span>
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={tagForm.seconds}
                  onChange={(e) => setTagForm(prev => ({ ...prev, seconds: e.target.value }))}
                  placeholder="0"
                  min="0"
                  max="59"
                  className="w-16 px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                />
                <span className="text-sm text-gray-600">초</span>
              </div>
              <button
                onClick={handleCurrentTimeSet}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap cursor-pointer"
              >
                <i className="ri-time-line mr-1"></i>
                현재 시간
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              현재 재생 시간: {player ? formatTime(Math.floor(player.getCurrentTime?.() || 0)) : '0:00'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              메모 (선택사항)
            </label>
            <textarea
              value={tagForm.memo}
              onChange={(e) => setTagForm(prev => ({ ...prev, memo: e.target.value }))}
              placeholder="태그에 대한 메모를 입력하세요"
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button
              onClick={handleTagFormSubmit}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap cursor-pointer"
            >
              <i className="ri-save-line mr-2"></i>
              태그 추가
            </button>
            <button
              onClick={() => setShowTagModal(false)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors whitespace-nowrap cursor-pointer"
            >
              취소
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default VideoPlayer;
export { VideoPlayer };
