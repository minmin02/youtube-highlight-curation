import { useState } from 'react';
import useVideoStore from '../../stores/useVideoStore';

const TagList = () => {
  const { tags, player, updateTag, deleteTag, setCurrentVideo } = useVideoStore();
  const [editingTag, setEditingTag] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', memo: '' });

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTagClick = (tag) => {
    if (!player) return;
    
    // 현재 영상과 다른 영상의 태그라면 영상 변경
    const currentVideoId = player.getVideoData()?.video_id;
    if (tag.videoId !== currentVideoId) {
      setCurrentVideo(tag.videoId, tag.videoTitle);
      player.loadVideoById(tag.videoId, tag.timestamp);
    } else {
      player.seekTo(tag.timestamp);
    }
  };

  const handleEditStart = (tag) => {
    setEditingTag(tag.id);
    setEditForm({ title: tag.title, memo: tag.memo || '' });
  };

  const handleEditSave = () => {
    if (editingTag && editForm.title.trim()) {
      updateTag(editingTag, {
        title: editForm.title.trim(),
        memo: editForm.memo.trim()
      });
      setEditingTag(null);
      setEditForm({ title: '', memo: '' });
    }
  };

  const handleEditCancel = () => {
    setEditingTag(null);
    setEditForm({ title: '', memo: '' });
  };

  const handleDelete = (tagId) => {
    if (window.confirm('이 태그를 삭제하시겠습니까?')) {
      deleteTag(tagId);
    }
  };

  // 영상별로 태그 그룹화
  const tagsByVideo = tags.reduce((acc, tag) => {
    const videoKey = tag.videoId || 'unknown';
    if (!acc[videoKey]) {
      acc[videoKey] = {
        videoId: tag.videoId,
        videoTitle: tag.videoTitle || '제목 없음',
        tags: []
      };
    }
    acc[videoKey].tags.push(tag);
    return acc;
  }, {});

  if (tags.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800">태그 목록</h2>
        <div className="text-center py-8 text-gray-500">
          <i className="ri-bookmark-line text-4xl mb-2"></i>
          <p>아직 추가된 태그가 없습니다.</p>
          <p className="text-sm">영상을 시청하며 원하는 순간에 태그를 추가해보세요!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800">
        태그 목록 ({tags.length}개)
      </h2>
      
      <div className="space-y-6">
        {Object.values(tagsByVideo).map((videoGroup) => (
          <div key={videoGroup.videoId} className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
              <i className="ri-video-line mr-2"></i>
              {videoGroup.videoTitle}
              <span className="ml-2 text-sm text-gray-500">
                ({videoGroup.tags.length}개 태그)
              </span>
            </h3>
            
            <div className="space-y-2">
              {videoGroup.tags
                .sort((a, b) => a.timestamp - b.timestamp)
                .map((tag) => (
                  <div
                    key={tag.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      {editingTag === tag.id ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editForm.title}
                            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="태그 제목"
                          />
                          <textarea
                            value={editForm.memo}
                            onChange={(e) => setEditForm({ ...editForm, memo: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="메모 (선택사항)"
                            rows="2"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={handleEditSave}
                              className="no-theme px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 whitespace-nowrap"
                            >
                              저장
                            </button>
                            <button
                              onClick={handleEditCancel}
                              className="no-theme px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 whitespace-nowrap"
                            >
                              취소
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => handleTagClick(tag)}
                          className="cursor-pointer"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-blue-600 font-medium text-sm">
                              {formatTime(tag.timestamp)}
                            </span>
                            <span className="font-medium text-gray-800">
                              {tag.title}
                            </span>
                          </div>
                          {tag.memo && (
                            <p className="text-sm text-gray-600 ml-12">
                              {tag.memo}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {editingTag !== tag.id && (
                      <div className="flex gap-1 ml-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditStart(tag);
                          }}
                          className="no-theme p-1 text-gray-500 hover:text-blue-600 transition-colors"
                          title="편집"
                        >
                          <i className="ri-edit-line text-sm"></i>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(tag.id);
                          }}
                          className="no-theme p-1 text-gray-500 hover:text-red-600 transition-colors"
                          title="삭제"
                        >
                          <i className="ri-delete-bin-line text-sm"></i>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export { TagList };
export default TagList;
