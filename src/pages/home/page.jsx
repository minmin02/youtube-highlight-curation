// src/pages/home/HomePage.jsx
import { useState, useEffect } from 'react';
import { useVideoStore } from '../../stores/useVideoStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { VideoPlayer } from '../../components/feature/VideoPlayer';
import { TagList } from '../../components/feature/TagList';
import { PlaylistManager } from '../../components/feature/PlaylistManager';
import { AuthModal } from '../../components/feature/AuthModal';
import YouTubeBrowser from '../../components/feature/YouTubeBrowser';
import { Button } from '../../components/base/Button';
import { Input } from '../../components/base/Input';
import { extractVideoId } from '../../utils/urlUtils';
import ThemeDropdown from '../../components/ThemeDropdown';

export default function HomePage() {
  const [videoUrl, setVideoUrl] = useState('');
  const [urlError, setUrlError] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [playlistSortBy, setPlaylistSortBy] = useState('rating');
  const { currentVideoId, setVideoId, playlists, setCurrentPlaylist, updatePlaylistRating } = useVideoStore();
  const { user, loading, initAuth, logout } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const handleVideoSubmit = () => {
    if (!videoUrl.trim()) {
      setUrlError('YouTube URL을 입력해주세요');
      return;
    }

    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      setUrlError('올바른 YouTube URL을 입력해주세요');
      return;
    }

    setVideoId(videoId);
    setUrlError('');
  };

  const handleUrlChange = (e) => {
    setVideoUrl(e.target.value);
    if (urlError) setUrlError('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-color)] flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-color)] transition-colors duration-300">

      <header className="bg-[var(--bg-color)] shadow-sm border-b border-gray-200 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div 
              className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setVideoId('')}
            >
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <i className="ri-play-line text-white text-lg"></i>
              </div>
              <h1 className="text-xl font-bold text-[var(--text-color)]">ReACT</h1>
              <span className="text-sm text-[var(--text-color)]">YouTube 하이라이트 큐레이션</span>
            </div>

            <div className="flex items-center space-x-3">
              {user ? (
                <>
                  <span className="text-sm text-[var(--text-color)]">{user.email}</span>
                  <Button variant="ghost" size="sm" onClick={logout}>
                    로그아웃
                  </Button>
                </>
              ) : (
                <Button size="sm" onClick={() => setShowAuthModal(true)}>
                  <i className="ri-user-line mr-1"></i>
                  로그인
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-3 mb-4">
        <ThemeDropdown />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!currentVideoId ? (
          <div className="grid grid-cols-1 gap-8">

            {/* 왼쪽: 플레이리스트 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <i className="ri-folder-music-line text-purple-600"></i>
                  내 플레이리스트
                  <span className="text-sm font-normal text-gray-500">({playlists.length}개)</span>
                </h3>

                <select
                  value={playlistSortBy}
                  onChange={(e) => setPlaylistSortBy(e.target.value)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="rating">평점순</option>
                  <option value="date">날짜순</option>
                  <option value="name">이름순</option>
                </select>
              </div>

              {playlists.length > 0 ? (
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                  {playlists
                    .sort((a, b) => {
                      switch (playlistSortBy) {
                        case 'rating':
                          return (b.rating || 0) - (a.rating || 0);
                        case 'date':
                          return new Date(b.createdAt) - new Date(a.createdAt);
                        case 'name':
                          return a.name.localeCompare(b.name);
                        default:
                          return 0;
                      }
                    })
                    .map((playlist) => (
                      <div
                        key={playlist.id}
                        onClick={() => {
                          setCurrentPlaylist(playlist);
                          if (playlist.tags.length > 0) {
                            const firstTag = playlist.tags[0];
                            if (firstTag.videoId) {
                              setVideoId(firstTag.videoId);
                            }
                          }
                        }}
                        className="group p-4 rounded-xl border-2 border-gray-200 hover:border-purple-300 hover:shadow-md cursor-pointer transition-all duration-300"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-900 text-base mb-1 truncate group-hover:text-purple-700 transition-colors">
                              {playlist.name}
                            </h4>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <i className="ri-music-2-line"></i>
                                {playlist.tags.length}개 트랙
                              </span>
                              <span className="flex items-center gap-1">
                                <i className="ri-calendar-line"></i>
                                {new Date(playlist.createdAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* 별점 */}
                        <div className="flex items-center gap-1 mb-3" onClick={(e) => e.stopPropagation()}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => updatePlaylistRating(playlist.id, star)}
                              className={`text-base transition-colors ${
                                star <= (playlist.rating || 0)
                                  ? 'text-yellow-400 hover:text-yellow-500'
                                  : 'text-gray-300 hover:text-gray-400'
                              }`}
                            >
                              <i className="ri-star-fill"></i>
                            </button>
                          ))}
                          {(playlist.rating || 0) > 0 && (
                            <span className="text-xs text-gray-500 ml-1">({playlist.rating})</span>
                          )}
                        </div>

                        {/* 태그 미리보기 */}
                        <div className="flex gap-2">
                          {playlist.tags.slice(0, 3).map((tag, idx) => {
                            const mins = Math.floor(tag.timestamp / 60);
                            const secs = tag.timestamp % 60;
                            const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`;

                            return (
                              <div
                                key={idx}
                                className="flex-1 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-600 font-mono group-hover:from-purple-50 group-hover:to-blue-50 transition-colors"
                              >
                                {timeStr}
                              </div>
                            );
                          })}
                          {playlist.tags.length > 3 && (
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center text-xs font-bold text-purple-700">
                              +{playlist.tags.length - 3}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <i className="ri-play-list-line text-5xl mb-3 text-gray-300"></i>
                  <p className="text-sm font-medium">플레이리스트가 없습니다</p>
                  <p className="text-xs mt-1">영상을 불러와서 플레이리스트를 만들어보세요!</p>
                </div>
              )}
            </div>

            {/* 오른쪽: 유튜브 브라우저 + URL 입력 */}
            <div>
              <div style={{ height: '600px' }}>
                <YouTubeBrowser 
                  onVideoSelect={(videoId) => setVideoId(videoId)}
                />
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">영상 불러오기</h3>
                <div className="space-y-4">
                  <Input
                    label="YouTube URL"
                    value={videoUrl}
                    onChange={handleUrlChange}
                    placeholder="https://www.youtube.com/watch?v=..."
                    error={urlError}
                  />
                  
                  <Button 
                    onClick={handleVideoSubmit}
                    className="w-full bg-[var(--accent-color)] text-white hover:opacity-90 active:scale-95 transition"
                    size="lg"
                  >
                    <i className="ri-play-line mr-2"></i>
                    영상 불러오기
                  </Button>
                </div>
              </div>
            </div>

          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 왼쪽: 영상 플레이어 */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">YouTube 플레이어</h2>
                  <Button variant="ghost" size="sm" onClick={() => setVideoId('')}>
                    <i className="ri-arrow-left-line mr-1"></i>
                    다른 영상
                  </Button>
                </div>
                <VideoPlayer videoId={currentVideoId} />
              </div>

              <PlaylistManager />
            </div>

            {/* 오른쪽: 태그 리스트 */}
            <div className="lg:col-span-1">
              <TagList />
            </div>
          </div>
        )}
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-500 text-sm">
              © ReACT조. YouTube 하이라이트 큐레이션 서비스
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
