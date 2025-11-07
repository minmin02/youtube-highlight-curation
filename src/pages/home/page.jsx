// src/pages/home/HomePage.jsx
import { useState, useEffect } from 'react';
import { useVideoStore } from '../../stores/useVideoStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { VideoPlayer } from '../../components/feature/VideoPlayer';
import { TagList } from '../../components/feature/TagList';
import { PlaylistManager } from '../../components/feature/PlaylistManager';
import { AuthModal } from '../../components/feature/AuthModal';
import { Button } from '../../components/base/Button';
import { Input } from '../../components/base/Input';
import { extractVideoId } from '../../utils/urlUtils';

export default function HomePage() {
  const [videoUrl, setVideoUrl] = useState('');
  const [urlError, setUrlError] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { currentVideoId, setVideoId } = useVideoStore();
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <i className="ri-play-line text-white text-lg"></i>
              </div>
              <h1 className="text-xl font-bold text-gray-900">ReACT</h1>
              <span className="text-sm text-gray-500">YouTube 하이라이트 큐레이션</span>
            </div>
            
            {/* 로그인/회원가입 버튼 */}
            <div className="flex items-center space-x-3">
              {user ? (
                <>
                  <span className="text-sm text-gray-600">{user.email}</span>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!currentVideoId ? (
          /* 시작 화면 */
          <div className="max-w-2xl mx-auto">
            {/* 로그인 안내 */}
            {!user && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <i className="ri-information-line text-blue-600 text-xl flex-shrink-0 mt-0.5"></i>
                  <div>
                    <h3 className="font-medium text-blue-900 mb-1">로그인하고 시작하세요</h3>
                    <p className="text-sm text-blue-700 mb-2">
                      회원가입하면 태그와 플레이리스트를 저장할 수 있어요
                    </p>
                    <Button size="sm" onClick={() => setShowAuthModal(true)}>
                      로그인 / 회원가입
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-youtube-line text-3xl text-red-600"></i>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                YouTube 하이라이트 큐레이션
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                YouTube 영상에 타임스탬프 기반 태그를 추가하고<br />
                나만의 하이라이트 플레이리스트를 만들어보세요
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">시작하기</h3>
              
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
                  className="w-full"
                  size="lg"
                >
                  <i className="ri-play-line mr-2"></i>
                  영상 불러오기
                </Button>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">주요 기능</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <i className="ri-bookmark-line text-blue-600"></i>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900">태그 추가</h5>
                      <p className="text-sm text-gray-600">원하는 순간에 태그와 메모 추가</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <i className="ri-list-check-line text-green-600"></i>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900">플레이리스트</h5>
                      <p className="text-sm text-gray-600">하이라이트 구간 자동 재생</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <i className="ri-share-line text-purple-600"></i>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900">링크 공유</h5>
                      <p className="text-sm text-gray-600">다른 사람과 플레이리스트 공유</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <i className="ri-edit-line text-orange-600"></i>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900">태그 관리</h5>
                      <p className="text-sm text-gray-600">태그 수정, 삭제, 정렬</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* 메인 작업 화면 */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 왼쪽: 비디오 플레이어 */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">YouTube 플레이어</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setVideoId('')}
                  >
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

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      {/* 푸터 */}
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