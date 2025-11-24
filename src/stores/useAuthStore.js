// src/stores/useAuthStore.js
import { create } from 'zustand';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { auth } from '../config/firebase';

const googleProvider = new GoogleAuthProvider();
// 추가 스코프 요청 (필요한 경우)
googleProvider.addScope('profile');
googleProvider.addScope('email');
// 계정 선택 화면 표시
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export const useAuthStore = create((set) => ({
  user: null,
  loading: true,
  
  initAuth: () => {
    // 리디렉션 결과 확인
    getRedirectResult(auth).then((result) => {
      if (result) {
        set({ user: result.user });
      }
    }).catch((error) => {
      console.error('리디렉션 결과 오류:', error);
    });

    onAuthStateChanged(auth, (user) => {
      set({ user, loading: false });
    });
  },
  
  signUp: async (email, password) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    set({ user: userCredential.user });
  },
  
  signIn: async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    set({ user: userCredential.user });
  },
  
  signInWithGoogle: async () => {
    try {
      // 먼저 팝업 방식 시도
      const userCredential = await signInWithPopup(auth, googleProvider);
      set({ user: userCredential.user });
      return userCredential.user;
    } catch (error) {
      // 팝업이 차단되거나 실패하면 리디렉션 방식 사용
      if (error.code === 'auth/popup-blocked' || error.code === 'auth/operation-not-allowed') {
        console.log('팝업 실패, 리디렉션 방식으로 전환');
        await signInWithRedirect(auth, googleProvider);
        // 리디렉션되므로 여기서는 아무것도 반환하지 않음
        return null;
      }
      throw error;
    }
  },
  
  logout: async () => {
    await signOut(auth);
    set({ user: null });
  }
}));