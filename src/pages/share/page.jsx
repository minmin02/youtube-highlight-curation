
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useVideoStore } from '../../stores/useVideoStore';
import { VideoPlayer } from '../../components/feature/VideoPlayer';
import { PlaylistManager } from '../../components/feature/PlaylistManager';
import { Button } from '../../components/base/Button';
import { parseSharedUrl } from '../../utils/urlUtils';

export default function SharePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setVideoId, tags } = useVideoStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadSharedData = () => {
      try {
        const videoId = searchParams.get('v');
        const tagsParam = searchParams.get('tags');

        if (!videoId || !tagsParam) {
          setError('올바르지 않은 공유 링크입니다.');
          setIsLoading(false);
          return;
        }

        const parsedTags = JSON.parse(tagsParam);
        
        setVideoId(videoId);
        setIsLoading(false);
      } catch (err) {
        setError('공유 데이터를 불러오는 중 오류가 발생했습니다.');
        setIsLoading(false);
      }
    };

    loadSharedData();
  }, [searchParams, setVideoId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">공유된 플레이리스트를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-error-warning-line text-2xl text-red-600"></i>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">오류가 발생했습니다</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => navigate('/')}>
            <i className="ri-home-line mr-2"></i>
            홈으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  const videoId = searchParams.get('v');

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div 
              className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate('/')}
            >
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <i className="ri-play-line text-white text-lg"></i>
              </div>
              <h1 className="text-xl font-bold text-gray-900">ReACT</h1>
              <span className="text-sm text-gray-500">공유된 플레이리스트</span>
            </div>
            <Button variant="ghost" onClick={() => navigate('/')}>
              <i className="ri-home-line mr-2"></i>
              홈으로
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <i className="ri-share-line text-blue-600 mr-2"></i>
            <p className="text-blue-800">
              다른 사용자가 공유한 하이라이트 플레이리스트를 보고 있습니다.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">YouTube 플레이어</h2>
            {videoId && <VideoPlayer videoId={videoId} />}
          </div>

          <div>
            <PlaylistManager />
          </div>
        </div>
      </div>

      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-500 text-sm">
              © 2024 ReACT. YouTube 하이라이트 큐레이션 서비스
            </p>

          </div>
        </div>
      </footer>
    </div>
  );
}
