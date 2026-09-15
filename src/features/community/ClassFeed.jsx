import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  MessageSquare, Heart, Send, Trash2, Paperclip, MessageCircle, Pin, Sparkles, Lock, Unlock, Edit3, Check, X 
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function ClassFeed({ courseId }) {
  const { user, profile, isTeacher } = useAuth();

  // DANH SÁCH BÀI ĐĂNG DIỄN ĐÀN (FORUM FEED)
  const [posts, setPosts] = useState(() => {
    const saved = localStorage.getItem(`lms_class_feed_${courseId || 'general'}`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: 'feed_pinned',
        authorId: 'teacher_hai',
        author: { full_name: 'Nguyễn Văn Hải', role: 'teacher' },
        content: '📌 LỊCH THI HỌC KỲ I MON TIẾNG ANH 9: Các em lưu ý lịch thi thử vào tối thứ 6 tuần này lúc 19h30 trên hệ thống LMS! Đề thi bám sát ma trận CV7991 gồm 40 câu hỏi trắc nghiệm và tự luận.',
        created_at: new Date(Date.now() - 7200000).toISOString(),
        likes: 24,
        is_pinned: true,
        is_locked: false,
        comments: [
          { id: 'c1', author: { full_name: 'Nguyễn Minh Hoàng' }, content: 'Dạ vâng ạ thưa Thầy! Em đang ôn lại từ vựng Unit 1 rồi ạ.' },
          { id: 'c2', author: { full_name: 'Nguyễn Thị Vi Na' }, content: 'Thầy cho em hỏi phần Nghe có cho nghe 2 lần không ạ?' },
          { id: 'c3', author: { full_name: 'Nguyễn Văn Hải', role: 'teacher' }, content: 'Phần Nghe hệ thống sẽ phát 2 lần chuẩn ngữ điệu bản xứ nhé các em!' },
        ],
      },
      {
        id: 'feed_1',
        authorId: 'teacher_hai',
        author: { full_name: 'Nguyễn Văn Hải', role: 'teacher' },
        content: '📢 THÔNG BÁO BÀI TẬP: Các em hoàn thành phần Vocab & Interactive Video Unit 1 trước 20h tối nay để nhận điểm cộng vào Sổ Nề Nếp 4.0 nhé!',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        likes: 18,
        is_pinned: false,
        is_locked: false,
        comments: [
          { id: 'c4', author: { full_name: 'Nguyễn Phan Tấn Đạt' }, content: 'Em đã hoàn thành đạt 100% điểm rồi Thầy ơi 🎉' },
        ],
      },
      {
        id: 'feed_2',
        authorId: 'student_1',
        author: { full_name: 'Nguyễn Phan Quỳnh Như', role: 'student' },
        content: '❓ Thầy và các bạn cho mình hỏi: Trong câu "I wish I ______ (can) speak English fluently", mình nên chia động từ là "could" hay "can" vậy ạ?',
        created_at: new Date(Date.now() - 1800000).toISOString(),
        likes: 9,
        is_pinned: false,
        is_locked: false,
        comments: [
          { id: 'c5', author: { full_name: 'Nguyễn Văn Hải', role: 'teacher' }, content: 'Chào em! Đây là câu ước ở hiện tại (Wish clause) nên lùi thì thành "could" em nhé: "I wish I could speak English fluently".' },
          { id: 'c6', author: { full_name: 'Nguyễn Phan Quỳnh Như' }, content: 'Dạ em cảm ơn Thầy Hải nhiều ạ!' },
        ],
      },
    ];
  });

  const [loading, setLoading] = useState(false);
  const [newPostText, setNewPostText] = useState('');
  const [commentInputs, setCommentInputs] = useState({});
  const [posting, setPosting] = useState(false);

  // STATE THẢ TIM (LIKED POSTS) LƯU THEO TÀI KHOẢN NGƯỜI DÙNG
  const userKey = user?.id || profile?.id || user?.email || 'guest';
  const [likedPostIds, setLikedPostIds] = useState(() => {
    try {
      const saved = localStorage.getItem(`lms_liked_posts_${userKey}`);
      return saved ? JSON.parse(saved) : ['feed_pinned'];
    } catch (e) {
      return [];
    }
  });

  // STATE CHỈNH SỬA BÀI VIẾT (EDIT POST)
  const [editingPostId, setEditingPostId] = useState(null);
  const [editingContent, setEditingContent] = useState('');

  // TỰ ĐỘNG LƯU BÀI ĐĂNG VÀO LOCALSTORAGE
  useEffect(() => {
    localStorage.setItem(`lms_class_feed_${courseId || 'general'}`, JSON.stringify(posts));
  }, [posts, courseId]);

  useEffect(() => {
    localStorage.setItem(`lms_liked_posts_${userKey}`, JSON.stringify(likedPostIds));
  }, [likedPostIds, userKey]);

  // HÀM TẠO BÀI ĐĂNG MỚI (CẢ HỌC SINH VÀ GIÁO VIÊN ĐỀU ĐĂNG ĐƯỢC)
  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!newPostText.trim()) return;
    setPosting(true);

    const displayName = profile?.full_name || user?.user_metadata?.full_name || (isTeacher ? 'Nguyễn Văn Hải' : 'Học Sinh');
    const newPost = {
      id: 'feed_' + Date.now(),
      authorId: user?.id || 'usr_' + Date.now(),
      author: {
        full_name: displayName,
        role: isTeacher ? 'teacher' : 'student',
      },
      content: newPostText.trim(),
      created_at: new Date().toISOString(),
      likes: 1,
      is_pinned: false,
      is_locked: false,
      comments: [],
    };

    setPosts((prev) => [newPost, ...prev]);
    setLikedPostIds((prev) => [...prev, newPost.id]);
    setNewPostText('');
    setPosting(false);
  };

  // 1. TÍNH NĂNG THẢ TIM / THÍCH (LIKE / UNLIKE)
  const handleToggleLike = (postId) => {
    const isLiked = likedPostIds.includes(postId);
    const updatedLikes = isLiked
      ? likedPostIds.filter((id) => id !== postId)
      : [...likedPostIds, postId];

    setLikedPostIds(updatedLikes);

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            likes: Math.max(0, (p.likes || 0) + (isLiked ? -1 : 1)),
          };
        }
        return p;
      })
    );
  };

  // 2. TÍNH NĂNG KHÓA / MỞ BÀI VIẾT (LOCK / UNLOCK) - DÀNH CHO GIÁO VIÊN
  const handleToggleLock = (postId) => {
    if (!isTeacher) return;
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const nextLocked = !p.is_locked;
          return { ...p, is_locked: nextLocked };
        }
        return p;
      })
    );
  };

  // 3. TÍNH NĂNG BẮT ĐẦU SỬA BÀI ĐĂNG (EDIT POST)
  const handleStartEdit = (post) => {
    setEditingPostId(post.id);
    setEditingContent(post.content);
  };

  const handleSaveEdit = (postId) => {
    if (!editingContent.trim()) return;
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, content: editingContent.trim(), is_edited: true } : p))
    );
    setEditingPostId(null);
    setEditingContent('');
  };

  // 4. TÍNH NĂNG XÓA BÀI ĐĂNG (DELETE POST)
  const handleDeletePost = (postId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này khỏi diễn đàn?')) {
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    }
  };

  // 5. TÍNH NĂNG GHIM BÀI VIẾT (PIN POST) - DÀNH CHO GIÁO VIÊN
  const handleTogglePin = (postId) => {
    if (!isTeacher) return;
    setPosts((prev) =>
      prev
        .map((p) => (p.id === postId ? { ...p, is_pinned: !p.is_pinned } : p))
        .sort((a, b) => (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0))
    );
  };

  // 6. TÍNH NĂNG BÌNH LUẬN (COMMENT)
  const handleAddComment = (postId) => {
    const text = (commentInputs[postId] || '').trim();
    if (!text) return;

    const post = posts.find((p) => p.id === postId);
    if (post?.is_locked) {
      alert('Bài viết này đã được Giáo viên khóa bình luận.');
      return;
    }

    const displayName = profile?.full_name || user?.user_metadata?.full_name || (isTeacher ? 'Nguyễn Văn Hải' : 'Học Sinh');
    const newComment = {
      id: 'c_' + Date.now(),
      author: {
        full_name: displayName,
        role: isTeacher ? 'teacher' : 'student',
      },
      content: text,
      created_at: new Date().toISOString(),
    };

    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, comments: [...(p.comments || []), newComment] } : p))
    );

    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
  };

  return (
    <div className="space-y-6 font-sans select-text">
      {/* FORM ĐĂNG BÀI TRAO ĐỔI (CẢ HỌC SINH VÀ GIÁO VIÊN ĐỀU THAM GIA ĐƯỢC) */}
      <form onSubmit={handleCreatePost} className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="text-sm sm:text-base font-black text-slate-800 flex items-center space-x-2">
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <span>
              {isTeacher ? '📢 Đăng Thông Báo / Dặn Dò Lớp Học' : '💬 Đặt Câu Hỏi / Trao Đổi Bài Học Cùng Lớp'}
            </span>
          </h3>

          <span className="text-[11px] font-bold text-slate-400">
            {isTeacher ? 'Quyền: Giáo Viên' : 'Quyền: Học Sinh'}
          </span>
        </div>

        <textarea
          rows={3}
          value={newPostText}
          onChange={(e) => setNewPostText(e.target.value)}
          placeholder={
            isTeacher
              ? 'Nhập nội dung dặn dò bài tập, thông báo lịch thi cho học sinh...'
              : 'Em có câu hỏi hoặc thắc mắc gì về bài học tiếng Anh? Hãy viết vào đây để Thầy và các bạn cùng giải đáp nhé!'
          }
          className="w-full p-3.5 border border-slate-300 rounded-2xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500 bg-slate-50 outline-none transition"
        />

        <div className="flex justify-between items-center pt-1">
          <span className="text-[11px] text-slate-400 italic">
            💡 Tôn trọng nội quy lớp học, sử dụng ngôn từ lịch sự
          </span>

          <button
            type="submit"
            disabled={posting || !newPostText.trim()}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center space-x-1.5 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{posting ? 'Đang gửi...' : isTeacher ? '🚀 Đăng Thông Báo' : '🚀 Gửi Bài Thảo Luận'}</span>
          </button>
        </div>
      </form>

      {/* DANH SÁCH BÀI ĐĂNG DIỄN ĐÀN */}
      {loading ? (
        <LoadingSpinner text="Đang tải diễn đàn lớp học..." />
      ) : posts.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-3xl text-sm text-slate-400 font-semibold bg-white">
          Chưa có bài thảo luận nào. Hãy là người đầu tiên đăng bài nhé!
        </div>
      ) : (
        <div className="space-y-5">
          {posts.map((post) => {
            const isAuthor = post.authorId === user?.id || (isTeacher && post.author?.role === 'teacher');
            const canEdit = isTeacher || isAuthor;
            const canDelete = isTeacher || isAuthor;
            const isLiked = likedPostIds.includes(post.id);
            const isEditingThis = editingPostId === post.id;

            return (
              <div
                key={post.id}
                className={`p-5 sm:p-6 rounded-3xl border transition shadow-sm space-y-4 ${
                  post.is_pinned
                    ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/30'
                    : post.is_locked
                    ? 'bg-slate-50/90 border-slate-300'
                    : 'bg-white border-slate-200'
                }`}
              >
                {/* THANH TRẠNG THÁI: GHIM HOẶC KHÓA */}
                <div className="flex flex-wrap items-center gap-2">
                  {post.is_pinned && (
                    <div className="flex items-center space-x-1 text-amber-900 text-[11px] font-black uppercase tracking-wider bg-amber-200/80 px-3 py-1 rounded-xl w-fit border border-amber-300 shadow-2xs">
                      <Pin className="w-3 h-3 text-amber-700 fill-amber-700" />
                      <span>📌 ĐÃ GHIM LÊN ĐẦU</span>
                    </div>
                  )}

                  {post.is_locked && (
                    <div className="flex items-center space-x-1 text-rose-900 text-[11px] font-black uppercase tracking-wider bg-rose-100 px-3 py-1 rounded-xl w-fit border border-rose-300 shadow-2xs">
                      <Lock className="w-3 h-3 text-rose-700" />
                      <span>🔒 ĐÃ KHÓA BÌNH LUẬN</span>
                    </div>
                  )}
                </div>

                {/* HEADER BÀI VIẾT: TÁC GIẢ + BỘ NÚT QUẢN TRỊ (XÓA, SỬA, KHÓA, GHIM) */}
                <div className="flex justify-between items-start gap-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-2xl text-white flex items-center justify-center font-black text-sm shadow-xs ${
                      post.author?.role === 'teacher'
                        ? 'bg-gradient-to-tr from-emerald-600 to-teal-600'
                        : 'bg-gradient-to-tr from-blue-600 to-indigo-600'
                    }`}>
                      {post.author?.full_name?.charAt(0) || (post.author?.role === 'teacher' ? 'T' : 'H')}
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-slate-900 flex items-center space-x-2">
                        <span>{post.author?.full_name || 'Thành viên lớp học'}</span>
                        {post.author?.role === 'teacher' && (
                          <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-300">
                            Giáo Viên
                          </span>
                        )}
                      </h4>
                      <span className="text-[11px] text-slate-400 font-semibold">
                        {new Date(post.created_at).toLocaleString('vi-VN')} {post.is_edited && '(Đã chỉnh sửa)'}
                      </span>
                    </div>
                  </div>

                  {/* BỘ NÚT QUẢN TRỊ BÀI VIẾT CHUẨN YÊU CẦU: XÓA, SỬA, KHÓA, GHIM */}
                  <div className="flex items-center space-x-1">
                    {/* NÚT KHÓA / MỞ BÌNH LUẬN (CHỈ DÀNH CHO GIÁO VIÊN) */}
                    {isTeacher && (
                      <button
                        type="button"
                        onClick={() => handleToggleLock(post.id)}
                        className={`p-2 rounded-xl transition cursor-pointer border ${
                          post.is_locked
                            ? 'bg-rose-100 text-rose-700 border-rose-300 font-extrabold'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                        }`}
                        title={post.is_locked ? 'Mở lại bình luận' : 'Khóa bình luận bài viết'}
                      >
                        {post.is_locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                      </button>
                    )}

                    {/* NÚT GHIM (CHỈ DÀNH CHO GIÁO VIÊN) */}
                    {isTeacher && (
                      <button
                        type="button"
                        onClick={() => handleTogglePin(post.id)}
                        className={`p-2 rounded-xl transition cursor-pointer border ${
                          post.is_pinned
                            ? 'bg-amber-200 text-amber-900 border-amber-400'
                            : 'bg-slate-100 hover:bg-amber-50 text-slate-600 hover:text-amber-700 border-slate-200'
                        }`}
                        title={post.is_pinned ? 'Bỏ ghim bài viết' : 'Ghim bài viết lên đầu'}
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* NÚT SỬA BÀI VIẾT (EDIT) */}
                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => handleStartEdit(post)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 transition cursor-pointer border border-slate-200"
                        title="Chỉnh sửa nội dung bài viết"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* NÚT XÓA BÀI VIẾT (DELETE) */}
                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => handleDeletePost(post.id)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition cursor-pointer border border-slate-200"
                        title="Xóa bài viết này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* NỘI DUNG BÀI VIẾT (HOẶC FORM EDIT INLINE) */}
                {isEditingThis ? (
                  <div className="space-y-2 p-3 bg-slate-50 rounded-2xl border border-blue-200">
                    <textarea
                      rows={3}
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      className="w-full p-3 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <div className="flex justify-end items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => setEditingPostId(null)}
                        className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-lg transition"
                      >
                        Hủy
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(post.id)}
                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-lg shadow-sm transition flex items-center space-x-1"
                      >
                        <Check className="w-3 h-3" />
                        <span>Lưu thay đổi</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed whitespace-pre-line select-text">
                    {post.content}
                  </p>
                )}

                {/* THANH TƯƠNG TÁC: THẢ TIM (LIKE) + ĐẾM BÌNH LUẬN */}
                <div className="flex items-center space-x-4 border-t border-b border-slate-100 py-2.5 text-xs font-black">
                  <button
                    type="button"
                    onClick={() => handleToggleLike(post.id)}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl transition cursor-pointer border ${
                      isLiked
                        ? 'bg-rose-50 text-rose-600 border-rose-200 ring-2 ring-rose-200/40'
                        : 'bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border-slate-200'
                    }`}
                  >
                    <Heart className={`w-4 h-4 transition transform ${isLiked ? 'fill-rose-500 text-rose-500 scale-110' : ''}`} />
                    <span>{post.likes || 0} Thả Tim</span>
                  </button>

                  <div className="flex items-center space-x-1.5 text-slate-500 px-3 py-1.5">
                    <MessageCircle className="w-4 h-4 text-sky-600" />
                    <span>{post.comments?.length || 0} Bình Luận</span>
                  </div>
                </div>

                {/* KHU VỰC BÌNH LUẬN VÀ FORM BÌNH LUẬN */}
                <div className="space-y-3 pt-1">
                  {(post.comments || []).map((cmt) => (
                    <div key={cmt.id} className="p-3 bg-slate-50 rounded-2xl text-xs space-y-1 border border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-900 flex items-center space-x-1.5">
                          <span>{cmt.author?.full_name || 'Học Sinh'}</span>
                          {cmt.author?.role === 'teacher' && (
                            <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">
                              Giáo Viên
                            </span>
                          )}
                        </span>
                        {cmt.created_at && (
                          <span className="text-[10px] text-slate-400">
                            {new Date(cmt.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-700 font-medium pl-1 leading-relaxed">{cmt.content}</p>
                    </div>
                  ))}

                  {/* NẾU BÀI VIẾT BỊ KHÓA BÌNH LUẬN THÌ HIỂN THỊ THÔNG BÁO KHÓA */}
                  {post.is_locked ? (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-center text-xs font-black text-rose-800 flex items-center justify-center space-x-1.5">
                      <Lock className="w-4 h-4 text-rose-600" />
                      <span>Bài viết này đã được Giáo viên khóa tính năng bình luận.</span>
                    </div>
                  ) : (
                    /* FORM NHẬP BÌNH LUẬN CHO CẢ THẦY VÀ TRÒ */
                    <div className="flex items-center space-x-2 pt-1">
                      <input
                        type="text"
                        value={commentInputs[post.id] || ''}
                        onChange={(e) =>
                          setCommentInputs({ ...commentInputs, [post.id]: e.target.value })
                        }
                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                        placeholder="Viết bình luận hoặc trả lời câu hỏi..."
                        className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 bg-slate-50 outline-none transition"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddComment(post.id)}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center space-x-1 cursor-pointer flex-shrink-0"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Gửi</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
