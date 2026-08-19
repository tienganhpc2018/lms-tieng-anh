import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { 
  MessageSquare, Heart, Send, Trash2, Paperclip, MessageCircle, Pin, Sparkles 
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function ClassFeed({ courseId }) {
  const { user, profile, isTeacher } = useAuth();
  const [posts, setPosts] = useState([
    {
      id: 'feed_pinned',
      author: { full_name: 'Nguyễn Văn Hải', role: 'teacher' },
      content: '📌 LỊCH THI HỌC KỲ I MON TIẾNG ANH 9: Các em lưu ý lịch thi thử vào tối thứ 6 tuần này lúc 19h30 trên hệ thống LMS!',
      created_at: new Date().toISOString(),
      likes: 24,
      is_pinned: true,
      comments: [
        { id: 'c1', author: { full_name: 'Nguyễn Minh Hoàng' }, content: 'Dạ vâng ạ thưa Thầy!' },
      ],
    },
    {
      id: 'feed_1',
      author: { full_name: 'Nguyễn Văn Hải', role: 'teacher' },
      content: '📢 THÔNG BÁO BÀI TẬP: Các em hoàn thành phần Vocab Unit 1 trước 20h tối nay nhé!',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      likes: 12,
      is_pinned: false,
      comments: [],
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [newPostText, setNewPostText] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [commentInputs, setCommentInputs] = useState({});
  const [posting, setPosting] = useState(false);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostText.trim()) return;
    setPosting(true);

    const newLocal = {
      id: 'feed_' + Date.now(),
      author: { full_name: profile?.full_name || 'Giáo Viên', role: isTeacher ? 'teacher' : 'student' },
      content: newPostText.trim(),
      created_at: new Date().toISOString(),
      likes: 0,
      is_pinned: false,
      comments: [],
    };

    setPosts([newLocal, ...posts]);
    setNewPostText('');
    setPosting(false);
  };

  // NÂNG CẤP YÊU CẦU 2: ĐÁNH DẤU GHIM BÀI VIẾT QUAN TRỌNG LÊN ĐẦU BẢNG TIN (PIN POST)
  const handleTogglePinPost = (postId) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const nextPinned = !p.is_pinned;
          alert(nextPinned ? '📌 Đã ghim bài viết dặn dò quan trọng lên đầu Bảng tin thành công!' : 'Đã bỏ ghim bài viết!');
          return { ...p, is_pinned: nextPinned };
        }
        return p;
      }).sort((a, b) => (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0))
    );
  };

  const handleAddComment = (postId) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const newCmt = {
            id: 'c_' + Date.now(),
            author: { full_name: profile?.full_name || 'Học Sinh' },
            content: text.trim(),
          };
          return { ...p, comments: [...(p.comments || []), newCmt] };
        }
        return p;
      })
    );

    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
  };

  const handleDeletePost = (postId) => {
    if (window.confirm('Bạn có chắc muốn xóa bài đăng thông báo này?')) {
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    }
  };

  return (
    <div className="space-y-6 font-sans select-none">
      {/* FORM ĐĂNG THÔNG BÁO BẢNG TIN LỚP HỌC */}
      {isTeacher && (
        <form onSubmit={handleCreatePost} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-sm font-extrabold text-slate-800 flex items-center space-x-2">
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <span>📢 Đăng Thông Báo / Dặn Dò Bài Học Lớp Học</span>
          </h3>

          <textarea
            rows={3}
            value={newPostText}
            onChange={(e) => setNewPostText(e.target.value)}
            placeholder="Nhập nội dung dặn dò bài tập, thông báo lịch thi cho học sinh..."
            className="w-full p-3 border border-slate-300 rounded-2xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 bg-slate-50"
          />

          <div className="flex justify-between items-center pt-1">
            <button
              type="button"
              onClick={() => {
                const url = prompt('Nhập link hình ảnh hoặc file đính kèm:');
                if (url) setAttachmentUrl(url);
              }}
              className="p-2 hover:bg-slate-100 rounded-xl flex items-center space-x-1 transition text-emerald-700 text-xs font-bold"
            >
              <Paperclip className="w-4 h-4 text-emerald-600" />
              <span>Đính Kèm File / Ảnh</span>
            </button>

            <button
              type="submit"
              disabled={posting}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center space-x-1"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{posting ? 'Đang Đăng...' : '🚀 ĐĂNG THÔNG BÁO'}</span>
            </button>
          </div>
        </form>
      )}

      {/* DANH SÁCH BÀI ĐĂNG BẢNG TIN */}
      {loading ? (
        <LoadingSpinner text="Đang tải bảng tin lớp học..." />
      ) : posts.length === 0 ? (
        <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-3xl text-xs text-slate-400 font-semibold">
          Chưa có thông báo nào trên bảng tin lớp học.
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className={`p-5 rounded-3xl border transition shadow-sm space-y-3 ${
                post.is_pinned ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/30' : 'bg-white border-slate-200'
              }`}
            >
              {/* PHÂN LOẠI TAG PIN BÀI GHIM QUAN TRỌNG (YÊU CẦU 2) */}
              {post.is_pinned && (
                <div className="flex items-center space-x-1 text-amber-900 text-[11px] font-black uppercase tracking-wider bg-amber-200/60 px-3 py-1 rounded-xl w-fit border border-amber-300">
                  <Pin className="w-3.5 h-3.5 text-amber-700 fill-amber-700" />
                  <span>📌 THÔNG BÁO QUAN TRỌNG ĐÃ GHIM LÊN ĐẦU</span>
                </div>
              )}

              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-extrabold text-sm shadow-xs">
                    {post.author?.full_name?.charAt(0) || 'G'}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900 flex items-center space-x-1.5">
                      <span>{post.author?.full_name || 'Giáo Viên'}</span>
                      {post.author?.role === 'teacher' && (
                        <span className="text-[9px] font-extrabold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md">
                          Giáo Viên
                        </span>
                      )}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {new Date(post.created_at).toLocaleString('vi-VN')}
                    </span>
                  </div>
                </div>

                {isTeacher && (
                  <div className="flex items-center space-x-1">
                    {/* NÚT GHIM BÀI DẶN DÒ QUAN TRỌNG (PIN POST) */}
                    <button
                      onClick={() => handleTogglePinPost(post.id)}
                      className={`p-1.5 rounded-xl transition ${
                        post.is_pinned ? 'bg-amber-200 text-amber-900 font-extrabold' : 'hover:bg-amber-50 text-slate-400 hover:text-amber-600'
                      }`}
                      title="Ghim bài viết dặn dò lên trên cùng"
                    >
                      <Pin className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="p-1.5 hover:bg-rose-50 text-rose-500 rounded-xl transition"
                      title="Xóa bài đăng"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <p className="text-xs text-slate-800 font-semibold leading-relaxed whitespace-pre-line">
                {post.content}
              </p>

              {/* REACTION & LIKE */}
              <div className="flex items-center space-x-4 border-t border-b border-slate-100/80 py-2 text-xs font-extrabold text-slate-600">
                <button className="flex items-center space-x-1 hover:text-rose-600 transition">
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                  <span>{post.likes || 12} Thích</span>
                </button>

                <button className="flex items-center space-x-1 hover:text-sky-600 transition">
                  <MessageCircle className="w-4 h-4 text-sky-500" />
                  <span>{post.comments?.length || 0} Bình Luận</span>
                </button>
              </div>

              {/* BÌNH LUẬN DƯỚI BÀI HỌC / THÔNG BÁO */}
              <div className="space-y-2 pt-1">
                {(post.comments || []).map((cmt) => (
                  <div key={cmt.id} className="p-2.5 bg-slate-50 rounded-2xl text-xs space-y-1">
                    <span className="font-extrabold text-slate-900">{cmt.author?.full_name || 'Học Sinh'}:</span>
                    <p className="text-slate-700 font-medium pl-1">{cmt.content}</p>
                  </div>
                ))}

                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="text"
                    value={commentInputs[post.id] || ''}
                    onChange={(e) =>
                      setCommentInputs({ ...commentInputs, [post.id]: e.target.value })
                    }
                    onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                    placeholder="Viết bình luận hoặc đặt câu hỏi..."
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 bg-slate-50"
                  />
                  <button
                    onClick={() => handleAddComment(post.id)}
                    className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
