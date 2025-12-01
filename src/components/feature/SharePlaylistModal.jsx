// 플레이리스트를 이메일로 공유하는 모달 컴포넌트
import { useState } from 'react';
import { Modal } from '../base/Modal';
import useVideoStore from '../../stores/useVideoStore';

export const SharePlaylistModal = ({ isOpen, onClose, playlist }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { sharePlaylist } = useVideoStore();

  // 이메일로 플레이리스트 공유 핸들러
  const handleShare = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('이메일을 입력해주세요.');
      return;
    }

    // 간단한 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('올바른 이메일 형식을 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await sharePlaylist(playlist.id, email.trim());
      setSuccess(`${email}에게 플레이리스트를 공유했습니다!`);
      setEmail('');
      
      // 3초 후 모달 닫기
      setTimeout(() => {
        onClose();
        setSuccess('');
      }, 2000);
    } catch (err) {
      setError(err.message || '공유에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setError('');
    setSuccess('');
    onClose();
  };

  if (!playlist) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="플레이리스트 공유" size="md">
      <div className="space-y-4">
        {/* 플레이리스트 정보 */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-1">{playlist.name}</h4>
          <p className="text-sm text-gray-600">
            {playlist.tags?.length || 0}개의 하이라이트
          </p>
        </div>

        {/* 공유 폼 */}
        <form onSubmit={handleShare} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              받는 사람 이메일
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              placeholder="example@email.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 flex items-center gap-2">
                <i className="ri-error-warning-line"></i>
                {error}
              </p>
            </div>
          )}

          {/* 성공 메시지 */}
          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700 flex items-center gap-2">
                <i className="ri-check-line"></i>
                {success}
              </p>
            </div>
          )}

          {/* 버튼 */}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <i className="ri-loader-4-line animate-spin"></i>
                  공유 중...
                </>
              ) : (
                <>
                  <i className="ri-mail-send-line"></i>
                  공유하기
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              취소
            </button>
          </div>
        </form>

        {/* 안내 메시지 */}
        <p className="text-xs text-gray-500 text-center">
          상대방이 로그인하면 공유받은 플레이리스트를 확인할 수 있습니다.
        </p>
      </div>
    </Modal>
  );
};

export default SharePlaylistModal;

