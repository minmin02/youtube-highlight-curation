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
import { SHARE_STATUS, MESSAGES, DEFAULT_VALUES } from '../constants';

const useVideoStore = create((set, get) => ({
  currentVideoId: '',
  currentVideoTitle: '',
  player: null,
  tags: [],
  playlists: [],
  currentPlaylist: null,
  isPlaylistPlaying: false,
  currentPlaylistIndex: 0,
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
  
  addTagsFromVideo: (videoId, videoTitle, newTags) => set((state) => ({
    tags: [...state.tags, ...newTags.map(tag => ({
      ...tag,
      id: `${videoId}_${tag.timestamp}_${Date.now()}`,
      videoId,
      videoTitle
    }))]
  })),
  
  updatePlaylist: (playlistId, updates) => set((state) => ({
    playlists: state.playlists.map(playlist =>
      playlist.id === playlistId ? { ...playlist, ...updates } : playlist
    ),
    currentPlaylist: state.currentPlaylist?.id === playlistId 
      ? { ...state.currentPlaylist, ...updates }
      : state.currentPlaylist
  })),
  
  deletePlaylist: (playlistId) => set((state) => ({
    playlists: state.playlists.filter(playlist => playlist.id !== playlistId),
    currentPlaylist: state.currentPlaylist?.id === playlistId 
      ? null 
      : state.currentPlaylist
  })),
  
  renamePlaylist: (playlistId, newName) => set((state) => ({
    playlists: state.playlists.map(playlist =>
      playlist.id === playlistId ? { ...playlist, name: newName } : playlist
    ),
    currentPlaylist: state.currentPlaylist?.id === playlistId 
      ? { ...state.currentPlaylist, name: newName }
      : state.currentPlaylist
  })),

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

    if (user.email === recipientEmail) {
      throw new Error(MESSAGES.PLAYLIST.SHARE_SELF_ERROR);
    }

    try {
      await addDoc(collection(db, 'sharedPlaylists'), {
        playlistId: playlist.id,
        playlistName: playlist.name,
        ownerEmail: user.email,
        ownerId: user.uid,
        sharedWithEmail: recipientEmail.toLowerCase().trim(),
        sharedAt: serverTimestamp(),
        status: SHARE_STATUS.PENDING,
        playlistData: {
          name: playlist.name,
          videos: playlist.videos || [],
          createdAt: playlist.createdAt,
          tags: playlist.tags || []
        }
      });

      return { success: true, message: MESSAGES.PLAYLIST.SHARE_SUCCESS };
    } catch (error) {
      console.error('플레이리스트 공유 오류:', error);
      throw new Error(MESSAGES.PLAYLIST.SHARE_ERROR);
    }
  },

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

  acceptSharedPlaylist: async (sharedId) => {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('로그인이 필요합니다.');
    }

    try {
      const sharedDocRef = doc(db, 'sharedPlaylists', sharedId);
      const sharedDocSnap = await getDoc(sharedDocRef);

      if (!sharedDocSnap.exists()) {
        throw new Error('공유 플레이리스트를 찾을 수 없습니다.');
      }

      const sharedData = sharedDocSnap.data();
      
      const newPlaylist = {
        id: Date.now().toString(),
        ...sharedData.playlistData,
        name: sharedData.playlistData.name + ' (공유받음)',
        createdAt: new Date().toISOString(),
        sharedFrom: sharedData.ownerEmail,
        originalPlaylistId: sharedData.playlistId
      };

      set((state) => ({
        playlists: [...state.playlists, newPlaylist]
      }));

      await updateDoc(sharedDocRef, {
        status: 'accepted'
      });

      return { success: true, message: '플레이리스트를 추가했습니다.' };
    } catch (error) {
      console.error('플레이리스트 수락 오류:', error);
      throw new Error('플레이리스트 수락에 실패했습니다.');
    }
  },

  declineSharedPlaylist: async (sharedId) => {
    try {
      await updateDoc(doc(db, 'sharedPlaylists', sharedId), {
        status: SHARE_STATUS.DECLINED
      });

      return { success: true, message: MESSAGES.PLAYLIST.DECLINE_SUCCESS };
    } catch (error) {
      console.error('플레이리스트 거절 오류:', error);
      throw new Error(MESSAGES.PLAYLIST.DECLINE_ERROR);
    }
  },

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

  cancelShare: async (sharedId) => {
    try {
      await deleteDoc(doc(db, 'sharedPlaylists', sharedId));
      return { success: true, message: MESSAGES.PLAYLIST.CANCEL_SHARE_SUCCESS };
    } catch (error) {
      console.error('공유 취소 오류:', error);
      throw new Error(MESSAGES.PLAYLIST.CANCEL_SHARE_ERROR);
    }
  },

}));

export { useVideoStore };
export default useVideoStore;
