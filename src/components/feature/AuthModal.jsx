// src/components/feature/AuthModal.jsx
import { useState } from 'react';
import { useAuthStore } from '../../stores/useAuthStore';
import { Button } from '../base/Button';
import { Input } from '../base/Input';

export function AuthModal({ isOpen, onClose }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const { signUp, signIn, signInWithGoogle } = useAuthStore();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoadingGoogle(true);
    
    try {
      console.log('Google 로그인 시도 중...');
      const user = await signInWithGoogle();
      console.log('Google 로그인 성공:', user);
      onClose();
    } catch (err) {
      console.error('Google 로그인 오류 상세:', err);
      console.error('오류 코드:', err.code);
      console.error('오류 메시지:', err.message);
      
      let errorMessage = 'Google 로그인에 실패했습니다: ';
      if (err.code === 'auth/operation-not-allowed') {
        errorMessage += 'Firebase Console에서 Google Sign-In이 활성화되어 있는지 확인하세요.';
      } else if (err.code === 'auth/popup-closed-by-user') {
        errorMessage = '로그인 창이 닫혔습니다. 다시 시도해주세요.';
      } else {
        errorMessage += err.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoadingGoogle(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {isSignUp ? '회원가입' : '로그인'}
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <i className="ri-close-line text-2xl"></i>
            </button>
          </div>

          {/* Google 로그인 버튼 */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoadingGoogle}
            className="w-full mb-4 px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 disabled:opacity-50 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
          >
            {isLoadingGoogle ? (
              <>
                <i className="ri-loader-4-line animate-spin"></i>
                로딩 중...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google로 계속하기
              </>
            )}
          </button>

          {/* 구분선 */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">또는</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="이메일"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              required
            />
            
            <Input
              label="비밀번호"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="6자 이상 입력해주세요"
              required
            />

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button type="submit" className="w-full">
              {isSignUp ? '가입하기' : '로그인'}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {isSignUp ? '이미 계정이 있으신가요? 로그인' : '계정이 없으신가요? 회원가입'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}