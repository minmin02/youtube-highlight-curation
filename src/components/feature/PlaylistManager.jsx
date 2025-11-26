import { useState, useEffect } from 'react';
import useVideoStore from '../../stores/useVideoStore';
import usePlaylistPlayer from '../../hooks/usePlaylistPlayer';
import { SharePlaylistModal } from './SharePlaylistModal';
import { SharedPlaylistsTab } from './SharedPlaylistsTab';

const PlaylistManager = () => {
  const {
    tags,
    playlists,
    currentPlaylist,
    createPlaylist,
    setCurrentPlaylist,
    updatePlaylist,
    updatePlaylistRating,
    deletePlaylist,
    renamePlaylist,
    addTagsFromVideo,
    rateSharedPlaylist,
    getPlaylistRatings,
    getMyRating,
    calculateAverageRating
  } = useVideoStore();

  const {
    startPlaylist,
    stopPlaylist,
    jumpToPlaylistItem,
    isPlaying,
    currentIndex
  } = usePlaylistPlayer();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [playlistName, setPlaylistName] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [newPlaylistRating, setNewPlaylistRating] = useState(0);
  const [showAddVideoForm, setShowAddVideoForm] = useState(false);
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [showEditForm, setShowEditForm] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [sortBy, setSortBy] = useState('rating');

  // 공유 기능을 위한 state
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedPlaylistForShare, setSelectedPlaylistForShare] = useState(null);
  const [currentTab, setCurrentTab] = useState('myPlaylists');
  
  // 공유받은 플레이리스트 평점 정보
  const [ratingsData, setRatingsData] = useState({}); // { playlistId: { myRating, average, count } }

  // 공유받은 플레이리스트의 평점 정보 로드
  useEffect(() => {
    const loadRatingsForSharedPlaylists = async () => {
      const sharedPlaylists = playlists.filter(p => p.sharedFrom);
      const ratingsInfo = {};
      
      for (const playlist of sharedPlaylists) {
        try {
          const [allRatings, myRating] = await Promise.all([
            getPlaylistRatings(playlist.id),
            getMyRating(playlist.id)
          ]);
          const { average, count } = calculateAverageRating(allRatings);
          ratingsInfo[playlist.id] = { myRating, average, count };
        } catch (error) {
          console.error('평점 로드 오류:', error);
        }
      }
      
      setRatingsData(ratingsInfo);
    };
    
    loadRatingsForSharedPlaylists();
  }, [playlists, getPlaylistRatings, getMyRating, calculateAverageRating]);

  // 공유받은 플레이리스트 평점 핸들러
  const handleSharedPlaylistRate = async (playlistId, rating) => {
    try {
      const result = await rateSharedPlaylist(playlistId, rating);
      
      // 평점 정보 새로고침
      const [allRatings, myRatingValue] = await Promise.all([
        getPlaylistRatings(playlistId),
        getMyRating(playlistId)
      ]);
      const { average, count } = calculateAverageRating(allRatings);
      
      setRatingsData(prev => ({
        ...prev,
        [playlistId]: { myRating: myRatingValue, average, count }
      }));
      
      // 로컬 플레이리스트도 업데이트 (표시용)
      updatePlaylistRating(playlistId, rating);
    } catch (error) {
      console.error('평점 저장 오류:', error);
      alert(error.message || '평점 저장에 실패했습니다. 로그인이 필요할 수 있습니다.');
    }
  };

  // 공유 버튼 클릭 핸들러
  const handleShareClick = (playlist) => {
    setSelectedPlaylistForShare(playlist);
    setShareModalOpen(true);
  };

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
    const playlist = createPlaylist(playlistName.trim(), selectedTagObjects, newPlaylistRating);

    setPlaylistName('');
    setSelectedTags([]);
    setNewPlaylistRating(0);
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

  // Rating 컴포넌트 (일반 플레이리스트용)
  const RatingStars = ({ rating, onRatingChange, size = 'md' }) => {
    const sizeClasses = {
      sm: 'text-sm',
      md: 'text-lg',
      lg: 'text-xl'
    };

    return (
      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange && onRatingChange(star)}
            className={`no-theme ${sizeClasses[size]} transition-colors ${
              star <= rating
                ? 'text-yellow-400 hover:text-yellow-500'
                : 'text-gray-300 hover:text-gray-400'
            }`}
          >
            <i className="ri-star-fill"></i>
          </button>
        ))}
        {rating > 0 && (
          <span className="text-xs text-gray-500 ml-1">({rating})</span>
        )}
      </div>
    );
  };

  // 공유받은 플레이리스트용 평점 컴포넌트 (내 평점 / 평균 평점)
  const SharedRatingStars = ({ playlistId, myRating, averageRating, ratingCount, onRatingChange, size = 'sm' }) => {
    const sizeClasses = {
      sm: 'text-sm',
      md: 'text-lg',
      lg: 'text-xl'
    };

    const handleStarClick = (e, star) => {
      e.stopPropagation();
      e.preventDefault();
      console.log('별점 클릭:', star, 'playlistId:', playlistId);
      if (onRatingChange) {
        onRatingChange(star);
      }
    };

    return (
      <div className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
        {/* 내 평점 */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600 font-medium whitespace-nowrap">내 평점:</span>
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={(e) => handleStarClick(e, star)}
                className={`no-theme ${sizeClasses[size]} transition-colors cursor-pointer ${
                  star <= (myRating || 0)
                    ? 'text-yellow-400 hover:text-yellow-500'
                    : 'text-gray-300 hover:text-gray-400'
                }`}
              >
                <i className="ri-star-fill"></i>
              </button>
            ))}
            {myRating > 0 && (
              <span className="text-xs text-gray-500 ml-1">({myRating})</span>
            )}
          </div>
        </div>
        
        {/* 평균 평점 */}
        <div className="flex items-center gap-2 bg-blue-50 px-2 py-1 rounded-lg">
          <i className="ri-bar-chart-line text-blue-500 text-xs"></i>
          <span className="text-xs text-gray-600">평균:</span>
          <span className="text-xs font-bold text-blue-600">
            {averageRating > 0 ? averageRating.toFixed(1) : '-'}
          </span>
          <span className="text-xs text-gray-400">
            ({ratingCount || 0}명)
          </span>
        </div>
      </div>
    );
  };

  // 플레이리스트 정렬
  const getSortedPlaylists = () => {
    const sorted = [...playlists];
    switch (sortBy) {
      case 'rating':
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'date':
        return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return sorted;
    }
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

            {/* 별점 선택 */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-blue-800">별점 (선택사항):</p>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewPlaylistRating(star === newPlaylistRating ? 0 : star)}
                    className={`no-theme text-xl transition-colors ${
                      star <= newPlaylistRating
                        ? 'text-yellow-400 hover:text-yellow-500'
                        : 'text-gray-300 hover:text-gray-400'
                    }`}
                  >
                    <i className="ri-star-fill"></i>
                  </button>
                ))}
                {newPlaylistRating > 0 && (
                  <span className="text-sm text-gray-600 ml-2">({newPlaylistRating}점)</span>
                )}
              </div>
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
                  setNewPlaylistRating(0);
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
          <div className="bg-blue-50 rounded-t-xl p-6 border-b-2 border-blue-100">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold mb-2 text-gray-800">
                  {currentPlaylist.name}
                </h3>
                <p className="text-gray-600 text-sm mb-2">
                  {currentPlaylist.tags.length}개의 하이라이트
                </p>
                {currentPlaylist.sharedFrom && (
                  <p className="text-sm text-purple-600 mb-2 flex items-center gap-1">
                    <i className="ri-share-line"></i>
                    {currentPlaylist.sharedFrom}님에게 공유받음
                  </p>
                )}
                {/* 공유받은 플레이리스트: 내 평점 / 평균 평점 */}
                {currentPlaylist.sharedFrom ? (
                  <SharedRatingStars
                    playlistId={currentPlaylist.id}
                    myRating={ratingsData[currentPlaylist.id]?.myRating || 0}
                    averageRating={ratingsData[currentPlaylist.id]?.average || 0}
                    ratingCount={ratingsData[currentPlaylist.id]?.count || 0}
                    onRatingChange={(rating) => handleSharedPlaylistRate(currentPlaylist.id, rating)}
                    size="md"
                  />
                ) : (
                  <RatingStars
                    rating={currentPlaylist.rating || 0}
                    onRatingChange={(rating) => updatePlaylistRating(currentPlaylist.id, rating)}
                    size="md"
                  />
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleAddTagsToPlaylist}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all whitespace-nowrap cursor-pointer flex items-center gap-2"
                >
                  <i className="ri-add-line"></i>
                  추가
                </button>
                <button
                  onClick={() => setShowShareModal(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all whitespace-nowrap cursor-pointer flex items-center gap-2"
                >
                  <i className="ri-share-line"></i>
                  공유
                </button>
                {isPlaying ? (
                  <button
                    onClick={stopPlaylist}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all whitespace-nowrap cursor-pointer flex items-center gap-2"
                  >
                    <i className="ri-pause-line"></i>
                    정지
                  </button>
                ) : (
                  <button
                    onClick={startPlaylist}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all whitespace-nowrap cursor-pointer flex items-center gap-2"
                  >
                    <i className="ri-play-line"></i>
                    재생
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-b-xl shadow-lg p-4">
            <div className="space-y-3">
              {currentPlaylist.tags.map((tag, index) => (
                <div
                  key={`${tag.id}-${index}`}
                  onClick={() => handlePlaylistItemClick(index)}
                  className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                    isPlaying && currentIndex === index
                      ? 'bg-gradient-to-r from-green-50 to-blue-50 border-green-400 shadow-lg scale-105'
                      : 'bg-gray-50 border-gray-200 hover:border-blue-300 hover:shadow-md hover:scale-102'
                  }`}
                >
                  {isPlaying && currentIndex === index && (
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 to-blue-400/10 animate-pulse"></div>
                  )}

                  <div className="relative p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        isPlaying && currentIndex === index
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
                          {isPlaying && currentIndex === index && (
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
                          handleEditPlaylistTag(index);
                        }}
                        className="no-theme p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="편집"
                      >
                        <i className="ri-edit-line text-lg"></i>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFromPlaylist(index);
                        }}
                        className="no-theme p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="제거"
                      >
                        <i className="ri-delete-bin-line text-lg"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 링크 공유 모달 */}
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

      {/* 탭 네비게이션 - 항상 표시 */}
      <div>
        <div className="flex gap-2 mb-4 border-b border-gray-200">
          <button
            onClick={() => setCurrentTab('myPlaylists')}
            className={`no-theme px-4 py-2 font-medium transition-colors ${
              currentTab === 'myPlaylists'
                ? 'text-red-600 border-b-2 border-red-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <i className="ri-play-list-line mr-2"></i>
            내 플레이리스트
          </button>
          <button
            onClick={() => setCurrentTab('shared')}
            className={`no-theme px-4 py-2 font-medium transition-colors ${
              currentTab === 'shared'
                ? 'text-red-600 border-b-2 border-red-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <i className="ri-share-line mr-2"></i>
            받은 공유
          </button>
        </div>

          {/* 조건부 렌더링: 내 플레이리스트 또는 받은 공유 */}
          {currentTab === 'myPlaylists' ? (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <i className="ri-folder-music-line text-purple-600"></i>
                  저장된 플레이리스트
                  <span className="text-sm font-normal text-gray-500">({playlists.length}개)</span>
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">정렬:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value="rating">평점순</option>
                    <option value="date">날짜순</option>
                    <option value="name">이름순</option>
                  </select>
                </div>
              </div>

              {playlists.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                  <i className="ri-folder-music-line text-5xl mb-3 text-gray-300"></i>
                  <p className="font-medium">아직 플레이리스트가 없습니다</p>
                  <p className="text-sm mt-1">태그를 추가하고 플레이리스트를 만들어보세요!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getSortedPlaylists().map((playlist) => (
                  <div
                    key={playlist.id}
                    onClick={() => setCurrentPlaylist(playlist)}
                    className={`group relative overflow-hidden rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                      currentPlaylist?.id === playlist.id
                        ? 'bg-gradient-to-br from-blue-50 to-purple-50 border-blue-400 shadow-lg scale-105'
                        : 'bg-white border-gray-200 hover:border-purple-300 hover:shadow-md'
                    }`}
                  >
                    {/* 수정/삭제 버튼 */}
                    <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const newName = prompt('플레이리스트 이름을 입력하세요:', playlist.name);
                          if (newName && newName.trim() && newName.trim() !== playlist.name) {
                            renamePlaylist(playlist.id, newName.trim());
                          }
                        }}
                        className="no-theme w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-blue-600 hover:border-blue-300 transition-all shadow-sm"
                        title="이름 수정"
                      >
                        <i className="ri-edit-line text-sm"></i>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`"${playlist.name}" 플레이리스트를 삭제하시겠습니까?`)) {
                            deletePlaylist(playlist.id);
                          }
                        }}
                        className="no-theme w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-red-600 hover:border-red-300 transition-all shadow-sm"
                        title="삭제"
                      >
                        <i className="ri-delete-bin-line text-sm"></i>
                      </button>
                    </div>

                    <div className="p-5">
                      <div className="flex items-start gap-3">
                        {/* 선택 표시 */}
                        {currentPlaylist?.id === playlist.id && (
                          <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                            <i className="ri-check-line text-white text-sm font-bold"></i>
                          </div>
                        )}
                        <h4 className={`font-bold text-gray-800 text-lg mb-2 pr-16 ${currentPlaylist?.id === playlist.id ? '' : 'pl-0'}`}>
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
                        {/* 공유받은 플레이리스트: 내 평점 / 평균 평점 */}
                        {playlist.sharedFrom ? (
                          <div>
                            <div className="text-xs text-purple-600 mb-2 flex items-center gap-1">
                              <i className="ri-share-line"></i>
                              {playlist.sharedFrom}님에게 공유받음
                            </div>
                            <SharedRatingStars
                              playlistId={playlist.id}
                              myRating={ratingsData[playlist.id]?.myRating || 0}
                              averageRating={ratingsData[playlist.id]?.average || 0}
                              ratingCount={ratingsData[playlist.id]?.count || 0}
                              onRatingChange={(rating) => handleSharedPlaylistRate(playlist.id, rating)}
                              size="sm"
                            />
                          </div>
                        ) : (
                          <RatingStars
                            rating={playlist.rating || 0}
                            onRatingChange={(rating) => {
                              updatePlaylistRating(playlist.id, rating);
                            }}
                            size="sm"
                          />
                        )}
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

                      {/* 이메일 공유 버튼 */}
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShareClick(playlist);
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
                ))}
                </div>
              )}
            </div>
          ) : (
            <SharedPlaylistsTab />
          )}
        </div>

      {tags.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <i className="ri-play-list-line text-4xl mb-2"></i>
          <p>플레이리스트를 만들려면 먼저 태그를 추가해주세요.</p>
        </div>
      )}

      {/* 이메일 공유 모달 */}
      <SharePlaylistModal
        isOpen={shareModalOpen}
        onClose={() => {
          setShareModalOpen(false);
          setSelectedPlaylistForShare(null);
        }}
        playlist={selectedPlaylistForShare}
      />
    </div>
  );
};

export { PlaylistManager };
export default PlaylistManager;
