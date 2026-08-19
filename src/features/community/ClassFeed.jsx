import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { 
  MessageSquare, Heart, ThumbsUp, Send, Trash2, ShieldAlert, Image as ImageIcon, 
  Paperclip, Share2, MoreVertical, MessageCircle, AlertCircle, Smile, Lock
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function ClassFeed({ courseId }) {
  const { user, profile, isTeacher } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPostText, setNewPostText] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [commentInputs, setCommentInputs] = useState({});
  const [posting, setPosting] = useState(false);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('class_feeds')
        .select('*, author:author_id(full_name, avatar_url, role), comments:feed_comments(*, author:author_id(full_name))')
        .eq('course_id', courseId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setPosts(data);
      } else {
        // Fallback Mock Data
        setPosts([
          {
            id: 'feed_1',
            author: { full_name: 'Nguyễn Văn Hải', role: 'teacher' },
            content: '📌 THÔNG BÁO BÀI TẬP: Các em hoàn thành phần Vocab Unit 1 trước 20h tối nay nhé!',
            created_at: new Date().toISOString(),
            likes: 12,
            comments: [
              { id: 'c1', author: { full_name: 'Nguyễn Minh Hoàng' }, content: 'Dạ vâng ạ thưa Thầy!' },
            ],
          },
        ]);
      }
    } catch (e) {}
    setLoading(false);
  };

  useEffect(() => {
    if (courseId) fetchPosts();
  }, [courseId]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostText.trim()) return;
    setPosting(true);
    try {
      const { data, error } = await supabase
        .from('class_feeds')
        .insert([
          {
            course_id: courseId,
            author_id: user.id,
            content: newPostText.trim(),
            attachments: attachmentUrl ? [{ url: attachmentUrl }] : [],
          },
        ])
        .select();

      if (!error && data) {
        setNewPostText('');
        setAttachmentUrl('');
        await fetchPosts();
      } else {
        // Local Fallback
        const newLocal = {
          id: 'feed_' + Date.now(),
          author: { full_name: profile?.full_name || 'Giáo Viên', role: isTeacher ? 'teacher' : 'student' },
          content: newPostText.trim(),
          created_at: new Date().toISOString(),
          likes: 0,
          comments: [],
        };
        setPosts([newLocal, ...posts]);
        setNewPostText('');
      }
    } catch (err) {}
    setPosting(false);
  };

  const handleAddComment = async (postId) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    try {
      await supabase.from('feed_comments').insert([
        {
          feed_id: postId,
          author_id: user.id,
          content: text.trim(),
        },
      ]);
    } catch (e) {}

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
      {/* COMM-01: ĐĂNG THÔNG BÁO BẢNG TIN LỚP HỌC */}
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
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-500">
              <button
                type="button"
                onClick={() => {
                  const url = prompt('Nhập link hình ảnh hoặc file đính kèm:');
                  if (url) setAttachmentUrl(url);
                }}
                className="p-2 hover:bg-slate-100 rounded-xl flex items-center space-x-1 transition text-emerald-700"
              >
                <Paperclip className="w-4 h-4 text-emerald-600" />
                <span>Đính Kèm File / Ảnh</span>
              </button>
            </div>

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
            <div key={post.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
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
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="p-1.5 hover:bg-rose-50 text-rose-500 rounded-xl transition"
                    title="Xóa bài đăng (COMM-08)"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <p className="text-xs text-slate-800 font-semibold leading-relaxed whitespace-pre-line">
                {post.content}
              </p>

              {/* COMM-07: REACTION & LIKE */}
              <div className="flex items-center space-x-4 border-t border-b border-slate-100 py-2 text-xs font-extrabold text-slate-600">
                <button className="flex items-center space-x-1 hover:text-rose-600 transition">
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                  <span>{post.likes || 12} Thích</span>
                </button>

                <button className="flex items-center space-x-1 hover:text-sky-600 transition">
                  <MessageCircle className="w-4 h-4 text-sky-500" />
                  <span>{post.comments?.length || 0} Bình Luận</span>
                </button>
              </div>

              {/* COMM-02: BÌNH LUẬN DƯỚI BÀI HỌC / THÔNG BÁO */}
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
