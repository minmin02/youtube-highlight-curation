import { create } from 'zustand';
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const useVideoStore = create((set, get) => ({
  // 현재 영상 정보
  currentVideoId: '',
  currentVideoTitle: '',
  player: null,
  
  // 태그 관리
  tags: [],
  
  // 플레이리스트 관리
  playlists: [],
  currentPlaylist: null,
  isPlaylistPlaying: false,
  currentPlaylistIndex: 0,
  
  // 액션들
  setVideoId: (videoId) => set({ currentVideoId: videoId }),
  
  setCurrentVideo: (videoId, title) => set({ 
    currentVideoId: videoId, 
    currentVideoTitle: title 
  }),
  
  setPlayer: (player) => set({ player }),
  
  addTag: (tag) => set((state) => ({
    tags: [...state.tags, { 
      ...tag, 
      id: Date.now().toString(),
      videoId: state.currentVideoId,
      videoTitle: state.currentVideoTitle
    }]
  })),
  
  updateTag: (tagId, updates) => set((state) => ({
    tags: state.tags.map(tag => 
      tag.id === tagId ? { ...tag, ...updates } : tag
    )
  })),
  
  deleteTag: (tagId) => set((state) => ({
    tags: state.tags.filter(tag => tag.id !== tagId)
  })),
  
  createPlaylist: (name, selectedTags, rating = 0) => {
    const playlist = {
      id: Date.now().toString(),
      name,
      tags: selectedTags,
      rating,
      createdAt: new Date().toISOString()
    };
    
    set((state) => ({
      playlists: [...state.playlists, playlist]
    }));
    
    return playlist;
  },
  
  // 플레이리스트 평점 업데이트
  updatePlaylistRating: (playlistId, rating) => {
    set((state) => ({
      playlists: state.playlists.map(playlist =>
        playlist.id === playlistId ? { ...playlist, rating } : playlist
      ),
      currentPlaylist: state.currentPlaylist?.id === playlistId 
        ? { ...state.currentPlaylist, rating }
        : state.currentPlaylist
    }));
  },
  
  setCurrentPlaylist: (playlist) => set({ 
    currentPlaylist: playlist,
    currentPlaylistIndex: 0
  }),
  
  setPlaylistPlaying: (isPlaying) => set({ isPlaylistPlaying: isPlaying }),
  
  setCurrentPlaylistIndex: (index) => set({ currentPlaylistIndex: index }),
  
  nextPlaylistItem: () => set((state) => {
    const nextIndex = state.currentPlaylistIndex + 1;
    if (nextIndex < state.currentPlaylist?.tags.length) {
      return { currentPlaylistIndex: nextIndex };
    }
    return { isPlaylistPlaying: false, currentPlaylistIndex: 0 };
  }),
  
  // 다른 영상의 태그들을 현재 태그 목록에 추가
  addTagsFromVideo: (videoId, videoTitle, newTags) => set((state) => ({
    tags: [...state.tags, ...newTags.map(tag => ({
      ...tag,
      id: `${videoId}_${tag.timestamp}_${Date.now()}`,
      videoId,
      videoTitle
    }))]
  })),
  
  // 플레이리스트 업데이트
  updatePlaylist: (playlistId, updates) => set((state) => ({
    playlists: state.playlists.map(playlist =>
      playlist.id === playlistId ? { ...playlist, ...updates } : playlist
    ),
    currentPlaylist: state.currentPlaylist?.id === playlistId 
      ? { ...state.currentPlaylist, ...updates }
      : state.currentPlaylist
  })),
  
  // 플레이리스트 삭제
  deletePlaylist: (playlistId) => set((state) => ({
    playlists: state.playlists.filter(playlist => playlist.id !== playlistId),
    currentPlaylist: state.currentPlaylist?.id === playlistId 
      ? null 
      : state.currentPlaylist
  })),
  
  // 플레이리스트 이름 변경
  renamePlaylist: (playlistId, newName) => set((state) => ({
    playlists: state.playlists.map(playlist =>
      playlist.id === playlistId ? { ...playlist, name: newName } : playlist
    ),
    currentPlaylist: state.currentPlaylist?.id === playlistId 
      ? { ...state.currentPlaylist, name: newName }
      : state.currentPlaylist
  })),

  // ============================================
  // 공유 기능 함수들
  // ============================================

  // 1. 플레이리스트 공유하기
  sharePlaylist: async (playlistId, recipientEmail) => {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('로그인이 필요합니다.');
    }

    const state = get();
    const playlist = state.playlists.find(p => p.id === playlistId);

    if (!playlist) {
      throw new Error('플레이리스트를 찾을 수 없습니다.');
    }

    // 자기 자신에게 공유 방지
    if (user.email === recipientEmail) {
      throw new Error('자기 자신에게는 공유할 수 없습니다.');
    }

    try {
      // sharedPlaylists 컬렉션에 문서 추가
      await addDoc(collection(db, 'sharedPlaylists'), {
        playlistId: playlist.id,
        playlistName: playlist.name,
        ownerEmail: user.email,
        ownerId: user.uid,
        sharedWithEmail: recipientEmail.toLowerCase().trim(),
        sharedAt: serverTimestamp(),
        status: 'pending',
        playlistData: {
          name: playlist.name,
          videos: playlist.videos || [],
          createdAt: playlist.createdAt,
          tags: playlist.tags || []
        }
      });

      return { success: true, message: '플레이리스트가 공유되었습니다.' };
    } catch (error) {
      console.error('플레이리스트 공유 오류:', error);
      throw new Error('플레이리스트 공유에 실패했습니다.');
    }
  },

  // 2. 받은 공유 플레이리스트 목록 가져오기
  getSharedPlaylists: async () => {
    const user = auth.currentUser;
    if (!user) return [];

    try {
      const q = query(
        collection(db, 'sharedPlaylists'),
        where('sharedWithEmail', '==', user.email.toLowerCase())
      );
      
      const querySnapshot = await getDocs(q);
      const sharedPlaylists = [];
      
      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        sharedPlaylists.push({
          id: docSnapshot.id,
          ...data,
          sharedAt: data.sharedAt && data.sharedAt.toDate ? data.sharedAt.toDate() : null
        });
      });

      return sharedPlaylists;
    } catch (error) {
      console.error('공유 플레이리스트 가져오기 오류:', error);
      return [];
    }
  },

  // 3. 공유받은 플레이리스트 수락하기
  acceptSharedPlaylist: async (sharedId) => {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('로그인이 필요합니다.');
    }

    try {
      // 공유 문서 직접 가져오기
      const sharedDocRef = doc(db, 'sharedPlaylists', sharedId);
      const sharedDocSnap = await getDoc(sharedDocRef);

      if (!sharedDocSnap.exists()) {
        throw new Error('공유 플레이리스트를 찾을 수 없습니다.');
      }

      const sharedData = sharedDocSnap.data();
      
      // 내 플레이리스트에 추가 (로컬 state에 추가)
      // originalPlaylistId를 저장하여 평점 공유에 사용
      const newPlaylist = {
        id: Date.now().toString(),
        ...sharedData.playlistData,
        name: sharedData.playlistData.name + ' (공유받음)',
        createdAt: new Date().toISOString(),
        sharedFrom: sharedData.ownerEmail,
        originalPlaylistId: sharedData.playlistId // 원본 플레이리스트 ID 저장
      };

      set((state) => ({
        playlists: [...state.playlists, newPlaylist]
      }));

      // 공유 상태 업데이트
      await updateDoc(sharedDocRef, {
        status: 'accepted'
      });

      return { success: true, message: '플레이리스트를 추가했습니다.' };
    } catch (error) {
      console.error('플레이리스트 수락 오류:', error);
      throw new Error('플레이리스트 수락에 실패했습니다.');
    }
  },

  // 4. 공유받은 플레이리스트 거절하기
  declineSharedPlaylist: async (sharedId) => {
    try {
      await updateDoc(doc(db, 'sharedPlaylists', sharedId), {
        status: 'declined'
      });

      return { success: true, message: '공유를 거절했습니다.' };
    } catch (error) {
      console.error('플레이리스트 거절 오류:', error);
      throw new Error('플레이리스트 거절에 실패했습니다.');
    }
  },

  // 5. 내가 공유한 플레이리스트 목록 가져오기
  getMySharedPlaylists: async () => {
    const user = auth.currentUser;
    if (!user) return [];

    try {
      const q = query(
        collection(db, 'sharedPlaylists'),
        where('ownerId', '==', user.uid)
      );
      
      const querySnapshot = await getDocs(q);
      const mySharedPlaylists = [];
      
      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        mySharedPlaylists.push({
          id: docSnapshot.id,
          ...data,
          sharedAt: data.sharedAt && data.sharedAt.toDate ? data.sharedAt.toDate() : null
        });
      });

      return mySharedPlaylists;
    } catch (error) {
      console.error('내 공유 플레이리스트 가져오기 오류:', error);
      return [];
    }
  },

  // 6. 공유 취소하기
  cancelShare: async (sharedId) => {
    try {
      await deleteDoc(doc(db, 'sharedPlaylists', sharedId));
      return { success: true, message: '공유를 취소했습니다.' };
    } catch (error) {
      console.error('공유 취소 오류:', error);
      throw new Error('공유 취소에 실패했습니다.');
    }
  },

  // ============================================
  // 평점 관련 함수들 (공유 플레이리스트용)
  // ============================================

  // 7. 공유 플레이리스트에 평점 부여
  rateSharedPlaylist: async (playlistId, rating) => {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('로그인이 필요합니다.');
    }

    try {
      // 기존 평점이 있는지 확인
      const ratingsRef = collection(db, 'playlistRatings');
      const q = query(
        ratingsRef,
        where('playlistId', '==', playlistId),
        where('userId', '==', user.uid)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // 기존 평점 업데이트
        const existingDoc = querySnapshot.docs[0];
        await updateDoc(doc(db, 'playlistRatings', existingDoc.id), {
          rating,
          updatedAt: serverTimestamp()
        });
      } else {
        // 새 평점 추가
        await addDoc(ratingsRef, {
          playlistId,
          userId: user.uid,
          userEmail: user.email,
          rating,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }

      return { success: true, message: '평점이 저장되었습니다.' };
    } catch (error) {
      console.error('평점 저장 오류:', error);
      throw new Error('평점 저장에 실패했습니다.');
    }
  },

  // 8. 플레이리스트의 모든 평점 가져오기 (평균 계산용)
  getPlaylistRatings: async (playlistId) => {
    try {
      const ratingsRef = collection(db, 'playlistRatings');
      const q = query(ratingsRef, where('playlistId', '==', playlistId));
      const querySnapshot = await getDocs(q);

      const ratings = [];
      querySnapshot.forEach((docSnapshot) => {
        ratings.push({
          id: docSnapshot.id,
          ...docSnapshot.data()
        });
      });

      return ratings;
    } catch (error) {
      console.error('평점 가져오기 오류:', error);
      return [];
    }
  },

  // 9. 내 평점 가져오기
  getMyRating: async (playlistId) => {
    const user = auth.currentUser;
    if (!user) return null;

    try {
      const ratingsRef = collection(db, 'playlistRatings');
      const q = query(
        ratingsRef,
        where('playlistId', '==', playlistId),
        where('userId', '==', user.uid)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        return querySnapshot.docs[0].data().rating;
      }
      return null;
    } catch (error) {
      console.error('내 평점 가져오기 오류:', error);
      return null;
    }
  },

  // 10. 평균 평점 계산
  calculateAverageRating: (ratings) => {
    if (!ratings || ratings.length === 0) return { average: 0, count: 0 };
    
    const sum = ratings.reduce((acc, r) => acc + (r.rating || 0), 0);
    const average = sum / ratings.length;
    
    return {
      average: Math.round(average * 10) / 10, // 소수점 1자리
      count: ratings.length
    };
  }
}));

export { useVideoStore };
export default useVideoStore;
