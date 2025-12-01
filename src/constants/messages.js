export const MESSAGES = {
  PLAYLIST: {
    CREATE_SUCCESS: '플레이리스트가 생성되었습니다.',
    CREATE_ERROR: '플레이리스트 이름과 태그를 선택해주세요.',
    DELETE_CONFIRM: (name) => `"${name}" 플레이리스트를 삭제하시겠습니까?`,
    DELETE_SUCCESS: '플레이리스트가 삭제되었습니다.',
    RENAME_PROMPT: '플레이리스트 이름을 입력하세요:',
    NO_PLAYLISTS: '아직 플레이리스트가 없습니다',
    NO_PLAYLISTS_DESC: '태그를 추가하고 플레이리스트를 만들어보세요!',
    NO_TAGS: '플레이리스트를 만들려면 먼저 태그를 추가해주세요.',
    ADD_TAGS_SUCCESS: (count) => `${count}개의 태그가 추가되었습니다.`,
    ADD_TAGS_ERROR: '추가할 태그를 선택해주세요.',
    REMOVE_TAG_CONFIRM: '플레이리스트에서 이 태그를 제거하시겠습니까?',
    SHARE_SUCCESS: '플레이리스트가 공유되었습니다.',
    SHARE_ERROR: '플레이리스트 공유에 실패했습니다.',
    SHARE_SELF_ERROR: '자기 자신에게는 공유할 수 없습니다.',
    ACCEPT_SUCCESS: '플레이리스트를 내 목록에 추가했습니다!',
    ACCEPT_ERROR: '플레이리스트 수락에 실패했습니다.',
    DECLINE_CONFIRM: '이 공유를 거절하시겠습니까?',
    DECLINE_SUCCESS: '공유를 거절했습니다.',
    DECLINE_ERROR: '플레이리스트 거절에 실패했습니다.',
    CANCEL_SHARE_SUCCESS: '공유를 취소했습니다.',
    CANCEL_SHARE_ERROR: '공유 취소에 실패했습니다.',
    LINK_COPY_SUCCESS: '공유 링크가 복사되었습니다!',
    LINK_COPY_ERROR: '링크 복사에 실패했습니다.'
  },

  TAG: {
    ADD_SUCCESS: (count) => `${count}개의 태그가 추가되었습니다.`,
    ADD_ERROR: '태그 추가 중 오류가 발생했습니다.',
    DELETE_CONFIRM: '이 태그를 삭제하시겠습니까?',
    DELETE_SUCCESS: '태그가 삭제되었습니다.',
    EDIT_PROMPT: '태그 제목을 수정하세요:',
    TITLE_REQUIRED: '태그 제목을 입력해주세요.',
    NO_TAGS: '아직 추가된 태그가 없습니다.',
    NO_TAGS_DESC: '영상을 시청하며 원하는 순간에 태그를 추가해보세요!',
    ADD_FORMAT: '추가할 태그들을 입력하세요.\n형식: 제목1:시간1:메모1, 제목2:시간2:메모2\n예시: 인트로:0:시작 부분, 하이라이트:120:중요한 내용'
  },

  VIDEO: {
    LOAD_ERROR: '올바른 YouTube URL을 입력하세요.',
    LOAD_REQUIRED: '먼저 영상을 로드해주세요.',
    INVALID_URL: '올바른 YouTube URL을 입력해주세요.'
  },

  SHARED: {
    NO_SHARES: '받은 공유가 없습니다',
    NO_SHARES_DESC: '다른 사람이 플레이리스트를 공유하면 여기에 표시됩니다.',
    NOT_FOUND: '공유 플레이리스트를 찾을 수 없습니다.'
  },

  AUTH: {
    LOGIN_REQUIRED: '로그인이 필요합니다.',
    LOGIN_ERROR: '로그인에 실패했습니다.',
    SIGNUP_ERROR: '회원가입에 실패했습니다.',
    LOGOUT_SUCCESS: '로그아웃되었습니다.'
  },

  COMMON: {
    LOADING: '로딩 중...',
    ERROR: '오류가 발생했습니다.',
    SUCCESS: '성공했습니다.',
    CANCEL: '취소',
    CONFIRM: '확인',
    CLOSE: '닫기'
  }
};

