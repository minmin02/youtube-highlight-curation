
import { useState } from 'react';
import useVideoStore from '../../stores/useVideoStore';
import usePlaylistPlayer from '../../hooks/usePlaylistPlayer';

const PlaylistManager = () => {
  const {
    tags,
    playlists,
    currentPlaylist,
    createPlaylist,
    setCurrentPlaylist,
    updatePlaylist,
    addTagsFromVideo,
    setCurrentVideo
  } = useVideoStore();

  const {
    startPlaylist,
    stopPlaylist,
    jumpToPlaylistItem,
    isPlaying,
    currentIndex,
    currentItem
  } = usePlaylistPlayer();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [playlistName, setPlaylistName] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [showAddVideoForm, setShowAddVideoForm] = useState(false);
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [showEditForm, setShowEditForm] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const extractVideoId = (url) => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const handleCreatePlaylist = () => {
    if (!playlistName.trim() || selectedTags.length === 0) {
      alert('플레이리스트 이름과 태그를 선택해주세요.');
      return;
    }

    const selectedTagObjects = tags.filter(tag => selectedTags.includes(tag.id));
    const playlist = createPlaylist(playlistName.trim(), selectedTagObjects);
    
    setPlaylistName('');
    setSelectedTags([]);
    setShowCreateForm(false);
    setCurrentPlaylist(playlist);
  };

  const handleTagSelection = (tagId) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleAddVideoTags = async () => {
    const videoId = extractVideoId(newVideoUrl);
    if (!videoId) {
      alert('올바른 YouTube URL을 입력해주세요.');
      return;
    }

    try {
      const videoTitle = `영상 ${videoId}`;
      
      const tagInput = prompt(
        '추가할 태그들을 입력하세요.\n형식: 제목1:시간1:메모1, 제목2:시간2:메모2\n예시: 인트로:0:시작 부분, 하이라이트:120:중요한 내용'
      );
      
      if (!tagInput) return;

      const newTags = tagInput.split(',').map(tagStr => {
        const [title, timeStr, memo] = tagStr.trim().split(':');
        const timestamp = parseInt(timeStr) || 0;
        
        return {
          title: title?.trim() || '제목 없음',
          memo: memo?.trim() || '',
          timestamp,
          duration: 10,
          createdAt: new Date().toISOString()
        };
      }).filter(tag => tag.title !== '제목 없음');

      if (newTags.length > 0) {
        addTagsFromVideo(videoId, videoTitle, newTags);
        setNewVideoUrl('');
        setShowAddVideoForm(false);
        alert(`${newTags.length}개의 태그가 추가되었습니다.`);
      }
    } catch (error) {
      console.error('태그 추가 중 오류:', error);
      alert('태그 추가 중 오류가 발생했습니다.');
    }
  };

  const handlePlaylistItemClick = (index) => {
    jumpToPlaylistItem(index);
  };

  const handleEditPlaylistTag = (tagIndex) => {
    if (!currentPlaylist) return;
    
    const tag = currentPlaylist.tags[tagIndex];
    const newTitle = prompt('태그 제목을 수정하세요:', tag.title);
    
    if (newTitle && newTitle.trim() !== tag.title) {
      const updatedTags = [...currentPlaylist.tags];
      updatedTags[tagIndex] = { ...tag, title: newTitle.trim() };
      
      updatePlaylist(currentPlaylist.id, { tags: updatedTags });
    }
  };

  const handleRemoveFromPlaylist = (tagIndex) => {
    if (!currentPlaylist) return;
    
    if (window.confirm('플레이리스트에서 이 태그를 제거하시겠습니까?')) {
      const updatedTags = currentPlaylist.tags.filter((_, index) => index !== tagIndex);
      updatePlaylist(currentPlaylist.id, { tags: updatedTags });
    }
  };

  const handleAddTagsToPlaylist = () => {
    if (!currentPlaylist) return;
    
    setSelectedTags([]);
    setShowEditForm(true);
  };

  const handleAddSelectedTagsToPlaylist = () => {
    if (!currentPlaylist || selectedTags.length === 0) {
      alert('추가할 태그를 선택해주세요.');
      return;
    }

    const selectedTagObjects = tags.filter(tag => selectedTags.includes(tag.id));
    const updatedTags = [...currentPlaylist.tags, ...selectedTagObjects];
    
    updatePlaylist(currentPlaylist.id, { tags: updatedTags });
    
    setSelectedTags([]);
    setShowEditForm(false);
    alert(`${selectedTagObjects.length}개의 태그가 추가되었습니다.`);
  };

  const generateShareUrl = () => {
    if (!currentPlaylist) return '';
    
    const baseUrl = window.location.origin;
    const playlistData = encodeURIComponent(JSON.stringify({
      name: currentPlaylist.name,
      tags: currentPlaylist.tags
    }));
    
    return `${baseUrl}/share?playlist=${playlistData}`;
  };

  const handleCopyShareUrl = () => {
    const shareUrl = generateShareUrl();
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert('공유 링크가 복사되었습니다!');
    }).catch(() => {
      alert('링크 복사에 실패했습니다.');
    });
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

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">플레이리스트 관리</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddVideoForm(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap cursor-pointer"
          >
            <i className="ri-add-line mr-2"></i>
            다른 영상 추가
          </button>
          <button
            onClick={() => setShowCreateForm(true)}
            disabled={tags.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors whitespace-nowrap cursor-pointer"
          >
            <i className="ri-play-list-add-line mr-2"></i>
            플레이리스트 만들기
          </button>
        </div>
      </div>

      {/* 다른 영상 추가 폼 */}
      {showAddVideoForm && (
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
                  setShowAddVideoForm(false);
                  setNewVideoUrl('');
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors whitespace-nowrap cursor-pointer"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 플레이리스트 생성 폼 */}
      {showCreateForm && (
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
                            onChange={() => handleTagSelection(tag.id)}
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
            
            <div className="flex gap-2">
              <button
                onClick={handleCreatePlaylist}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap cursor-pointer"
              >
                생성
              </button>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setPlaylistName('');
                  setSelectedTags([]);
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors whitespace-nowrap cursor-pointer"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 플레이리스트 편집 폼 */}
      {showEditForm && currentPlaylist && (
        <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <h3 className="font-semibold mb-3 text-purple-800">
            "{currentPlaylist.name}"에 태그 추가
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
                    .filter(tag => !currentPlaylist.tags.some(pTag => pTag.id === tag.id))
                    .sort((a, b) => a.timestamp - b.timestamp)
                    .map((tag) => (
                      <label key={tag.id} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={selectedTags.includes(tag.id)}
                          onChange={() => handleTagSelection(tag.id)}
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
              onClick={handleAddSelectedTagsToPlaylist}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors whitespace-nowrap cursor-pointer"
            >
              태그 추가
            </button>
            <button
              onClick={() => {
                setShowEditForm(false);
                setSelectedTags([]);
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors whitespace-nowrap cursor-pointer"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* 현재 플레이리스트 */}
      {currentPlaylist && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              현재 플레이리스트: {currentPlaylist.name}
            </h3>
            <div className="flex gap-2">
              <button
                onClick={handleAddTagsToPlaylist}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors whitespace-nowrap cursor-pointer"
              >
                <i className="ri-add-line mr-2"></i>
                태그 추가
              </button>
              <button
                onClick={() => setShowShareModal(true)}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors whitespace-nowrap cursor-pointer"
              >
                <i className="ri-share-line mr-2"></i>
                공유
              </button>
              {isPlaying ? (
                <button
                  onClick={stopPlaylist}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap cursor-pointer"
                >
                  <i className="ri-pause-line mr-2"></i>
                  정지
                </button>
              ) : (
                <button
                  onClick={startPlaylist}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap cursor-pointer"
                >
                  <i className="ri-play-line mr-2"></i>
                  재생
                </button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            {currentPlaylist.tags.map((tag, index) => (
              <div
                key={`${tag.id}-${index}`}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${
                  isPlaying && currentIndex === index
                    ? 'bg-green-100 border-green-300'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
                onClick={() => handlePlaylistItemClick(index)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono text-gray-500 w-8">
                    {index + 1}.
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-blue-600 font-mono text-sm">
                        {formatTime(tag.timestamp)}
                      </span>
                      <span className="font-medium text-gray-800">
                        {tag.title}
                      </span>
                      {isPlaying && currentIndex === index && (
                        <i className="ri-volume-up-line text-green-600"></i>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {tag.videoTitle}
                    </div>
                    {tag.memo && (
                      <p className="text-sm text-gray-600 mt-1">{tag.memo}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditPlaylistTag(index);
                    }}
                    className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                    title="편집"
                  >
                    <i className="ri-edit-line text-sm"></i>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFromPlaylist(index);
                    }}
                    className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                    title="제거"
                  >
                    <i className="ri-delete-bin-line text-sm"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 공유 모달 */}
      {showShareModal && currentPlaylist && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">플레이리스트 공유</h3>
            <p className="text-gray-600 mb-4">
              "{currentPlaylist.name}" 플레이리스트를 공유하세요
            </p>
            <div className="space-y-3">
              <div className="p-3 bg-gray-100 rounded-lg">
                <p className="text-sm text-gray-600 break-all">
                  {generateShareUrl()}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCopyShareUrl}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap cursor-pointer"
                >
                  <i className="ri-clipboard-line mr-2"></i>
                  링크 복사
                </button>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors whitespace-nowrap cursor-pointer"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 저장된 플레이리스트 목록 */}
      {playlists.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            저장된 플레이리스트 ({playlists.length}개)
          </h3>
          <div className="space-y-2">
            {playlists.map((playlist) => (
              <div
                key={playlist.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  currentPlaylist?.id === playlist.id
                    ? 'bg-blue-100 border-blue-300'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
                onClick={() => setCurrentPlaylist(playlist)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-gray-800">{playlist.name}</h4>
                    <p className="text-sm text-gray-600">
                      {playlist.tags.length}개 태그 • {' '}
                      {new Date(playlist.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {currentPlaylist?.id === playlist.id && (
                    <i className="ri-check-line text-blue-600"></i>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tags.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <i className="ri-play-list-line text-4xl mb-2"></i>
          <p>플레이리스트를 만들려면 먼저 태그를 추가해주세요.</p>
        </div>
      )}
    </div>
  );
};

export { PlaylistManager };
export default PlaylistManager;
