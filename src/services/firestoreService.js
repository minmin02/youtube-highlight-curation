import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';


//사용자의 모든 태그 가져오기
export const getUserTags = async (userId) => {
  try {
    const tagsRef = collection(db, 'users', userId, 'tags');
    const q = query(tagsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const tags = [];
    querySnapshot.forEach((doc) => {
      tags.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return tags;
  } catch (error) {
    console.error('태그 가져오기 실패:', error);
    throw error;
  }
};

//특정 카테고리의 태그 가져오기
export const getTagsByCategory = async (userId, category) => {
  try {
    const tagsRef = collection(db, 'users', userId, 'tags');
    const q = query(
      tagsRef, 
      where('category', '==', category),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const tags = [];
    querySnapshot.forEach((doc) => {
      tags.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return tags;
  } catch (error) {
    console.error('카테고리별 태그 가져오기 실패:', error);
    throw error;
  }
};

//특정 비디오의 태그 가져오기
export const getTagsByVideo = async (userId, videoId) => {
  try {
    const tagsRef = collection(db, 'users', userId, 'tags');
    const q = query(
      tagsRef, 
      where('videoId', '==', videoId),
      orderBy('timestamp', 'asc')
    );
    const querySnapshot = await getDocs(q);
    
    const tags = [];
    querySnapshot.forEach((doc) => {
      tags.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return tags;
  } catch (error) {
    console.error('비디오별 태그 가져오기 실패:', error);
    throw error;
  }
};

//새 태그 추가
export const addTag = async (userId, tagData) => {
  try {
    const tagId = `tag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const tagRef = doc(db, 'users', userId, 'tags', tagId);
    
    const newTag = {
      ...tagData,
      id: tagId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    await setDoc(tagRef, newTag);
    return { id: tagId, ...newTag };
  } catch (error) {
    console.error('태그 추가 실패:', error);
    throw error;
  }
};

//태그 수정
export const updateTag = async (userId, tagId, updates) => {
  try {
    const tagRef = doc(db, 'users', userId, 'tags', tagId);
    
    await updateDoc(tagRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('태그 수정 실패:', error);
    throw error;
  }
};

//태그 삭제
export const deleteTag = async (userId, tagId) => {
  try {
    const tagRef = doc(db, 'users', userId, 'tags', tagId);
    await deleteDoc(tagRef);
    return true;
  } catch (error) {
    console.error('태그 삭제 실패:', error);
    throw error;
  }
};

//여러 태그 한번에 추가
export const addMultipleTags = async (userId, tagsArray) => {
  try {
    const promises = tagsArray.map(tagData => addTag(userId, tagData));
    const results = await Promise.all(promises);
    return results;
  } catch (error) {
    console.error('다중 태그 추가 실패:', error);
    throw error;
  }
};

// ==================== 플레이리스트 관련 함수 ====================

//사용자의 모든 플레이리스트 가져오기
export const getUserPlaylists = async (userId) => {
  try {
    const playlistsRef = collection(db, 'users', userId, 'playlists');
    const q = query(playlistsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const playlists = [];
    querySnapshot.forEach((doc) => {
      playlists.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return playlists;
  } catch (error) {
    console.error('플레이리스트 가져오기 실패:', error);
    throw error;
  }
};

//특정 플레이리스트 가져오기
export const getPlaylist = async (userId, playlistId) => {
  try {
    const playlistRef = doc(db, 'users', userId, 'playlists', playlistId);
    const docSnap = await getDoc(playlistRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      throw new Error('플레이리스트를 찾을 수 없습니다.');
    }
  } catch (error) {
    console.error('플레이리스트 가져오기 실패:', error);
    throw error;
  }
};

//새 플레이리스트 생성
export const createPlaylist = async (userId, playlistData) => {
  try {
    const playlistId = `playlist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const playlistRef = doc(db, 'users', userId, 'playlists', playlistId);
    
    const newPlaylist = {
      ...playlistData,
      id: playlistId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    await setDoc(playlistRef, newPlaylist);
    return { id: playlistId, ...newPlaylist };
  } catch (error) {
    console.error('플레이리스트 생성 실패:', error);
    throw error;
  }
};

//플레이리스트 수정
export const updatePlaylist = async (userId, playlistId, updates) => {
  try {
    const playlistRef = doc(db, 'users', userId, 'playlists', playlistId);
    
    await updateDoc(playlistRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('플레이리스트 수정 실패:', error);
    throw error;
  }
};

//플레이리스트 삭제
export const deletePlaylist = async (userId, playlistId) => {
  try {
    const playlistRef = doc(db, 'users', userId, 'playlists', playlistId);
    await deleteDoc(playlistRef);
    return true;
  } catch (error) {
    console.error('플레이리스트 삭제 실패:', error);
    throw error;
  }
};

//플레이리스트에 태그 추가
export const addTagToPlaylist = async (userId, playlistId, tag) => {
  try {
    const playlistRef = doc(db, 'users', userId, 'playlists', playlistId);
    const playlistDoc = await getDoc(playlistRef);
    
    if (playlistDoc.exists()) {
      const currentTags = playlistDoc.data().tags || [];
      
      await updateDoc(playlistRef, {
        tags: [...currentTags, tag],
        updatedAt: serverTimestamp()
      });
      
      return true;
    } else {
      throw new Error('플레이리스트를 찾을 수 없습니다.');
    }
  } catch (error) {
    console.error('플레이리스트에 태그 추가 실패:', error);
    throw error;
  }
};

//플레이리스트에서 태그 제거
export const removeTagFromPlaylist = async (userId, playlistId, tagIndex) => {
  try {
    const playlistRef = doc(db, 'users', userId, 'playlists', playlistId);
    const playlistDoc = await getDoc(playlistRef);
    
    if (playlistDoc.exists()) {
      const currentTags = playlistDoc.data().tags || [];
      currentTags.splice(tagIndex, 1);
      
      await updateDoc(playlistRef, {
        tags: currentTags,
        updatedAt: serverTimestamp()
      });
      
      return true;
    } else {
      throw new Error('플레이리스트를 찾을 수 없습니다.');
    }
  } catch (error) {
    console.error('플레이리스트에서 태그 제거 실패:', error);
    throw error;
  }
};

//플레이리스트 평점 업데이트
export const updatePlaylistRating = async (userId, playlistId, rating) => {
  try {
    const playlistRef = doc(db, 'users', userId, 'playlists', playlistId);
    
    await updateDoc(playlistRef, {
      rating,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('플레이리스트 평점 업데이트 실패:', error);
    throw error;
  }
};

// ==================== 데이터 동기화 함수 ====================

//로컬 데이터를 Firestore에 동기화
export const syncLocalToFirestore = async (userId, localTags, localPlaylists) => {
  try {
    // 태그 동기화
    if (localTags && localTags.length > 0) {
      await addMultipleTags(userId, localTags);
    }
    
    // 플레이리스트 동기화
    if (localPlaylists && localPlaylists.length > 0) {
      const promises = localPlaylists.map(playlist => 
        createPlaylist(userId, playlist)
      );
      await Promise.all(promises);
    }
    
    return true;
  } catch (error) {
    console.error('로컬 데이터 동기화 실패:', error);
    throw error;
  }
};

//Firestore 데이터를 로컬로 가져오기
export const syncFirestoreToLocal = async (userId) => {
  try {
    const tags = await getUserTags(userId);
    const playlists = await getUserPlaylists(userId);
    
    return { tags, playlists };
  } catch (error) {
    console.error('Firestore 데이터 가져오기 실패:', error);
    throw error;
  }
};