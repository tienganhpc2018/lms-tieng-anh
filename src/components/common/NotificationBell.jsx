import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, MessageSquare, FileCheck, Award, Sparkles } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function NotificationBell() {
  const { user, isTeacher } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const bellRef = useRef(null);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      // 1. Fetch thông báo từ DB Supabase
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .or(`user_id.eq.${user.id},user_id.is.null`)
        .order('created_at', { ascending: false })
        .limit(15);

      let list = data || [];

      // 2. DÀNH RIÊNG CHO GIÁO VIÊN NGUYỄN VẢN HẢI: TRA CỨU SỐ LƯỢNG HỌC SINH MỚI CHƯA ĐƯỢC DUYỆT
      if (isTeacher) {
        try {
          const { data: allProfiles } = await supabase
            .from('profiles')
            .select('*');

          if (allProfiles) {
            const unapprovedUsers = allProfiles.filter((p) => {
              const pEmail = (p.email || '').toLowerCase();
              const isMaster = pEmail.includes('nguyensea') || pEmail.includes('nguyenvanhai') || pEmail.includes('tienganhpc2018');
              return !isMaster && p.role !== 'teacher' && p.approved !== true && p.approved !== 1;
            });

            if (unapprovedUsers.length > 0) {
              const namesList = unapprovedUsers.slice(0, 3).map((u) => u.full_name || u.username).join(', ');
              const unapprovedNotif = {
                id: 'unapproved_summary_' + unapprovedUsers.length,
                title: `🎓 Có ${unapprovedUsers.length} Học Sinh Mới Đang Chờ Duyệt!`,
                message: `Học sinh: ${namesList}${unapprovedUsers.length > 3 ? '...' : ''} vừa tạo tài khoản và đang chờ Thầy Hải phê duyệt để vào học.`,
                type: 'user_registration',
                read: false,
                created_at: new Date().toISOString(),
              };
              list = [unapprovedNotif, ...list];
            }
          }
        } catch (unapprovedErr) {}
      }

      // Lọc trùng ID
      const uniqueMap = {};
      list.forEach((item) => {
        uniqueMap[item.id] = item;
      });
      const finalList = Object.values(uniqueMap);

      setNotifications(finalList);
      setUnreadCount(finalList.filter((n) => !n.read).length);
    } catch (err) {
      console.error('Fetch notif error:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // LẮNG NGHE THỜI GIAN THỰC CẢ BẢNG NOTIFICATIONS VÀ BẢNG PROFILES (KHI CÓ HỌC SINH ĐĂNG KÝ MỚI)
    const notifSub = supabase
      .channel('notifications_realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, () => {
        fetchNotifications();
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles' }, () => {
        fetchNotifications();
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, () => {
        fetchNotifications();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(notifSub);
    };
  }, [user, isTeacher]);

  // Đóng khi click ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // KHI NHẤP VÀO QUẢ CHUÔNG -> XÓA CHẤM ĐỎ NGAY LẬP TỨC (ẢNH 2)
  const handleToggleBell = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState) {
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      // Cập nhật DB
      if (user) {
        supabase.from('notifications').update({ read: true }).eq('user_id', user.id).then(() => {});
      }
    }
  };

  return (
    <div className="relative" ref={bellRef}>
      <button
        type="button"
        onClick={handleToggleBell}
        className="relative p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition border border-slate-700 focus:outline-hidden cursor-pointer"
        title="Thông báo hệ thống"
      >
        <Bell className="w-5 h-5 text-amber-400" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-600 text-white font-black text-[10px] rounded-full flex items-center justify-center border-2 border-slate-900 animate-bounce shadow-sm">
            {unreadCount}
          </span>
        )}
      </button>

      {/* POPUP DROPDOWN THÔNG BÁO */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 py-3 z-50 text-slate-800 animate-scale-up">
          <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100">
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 flex items-center space-x-1.5">
              <Bell className="w-4 h-4 text-amber-500" />
              <span>{isTeacher ? '🔔 THÔNG BÁO QUẢN TRỊ VIÊN / GIÁO VIÊN' : '📢 THÔNG BÁO DẶN DÒ TỪ THẦY HẢI'}</span>
            </h4>
            <button
              onClick={() => {
                setUnreadCount(0);
                setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
              }}
              className="text-[10px] font-bold text-indigo-600 hover:underline"
            >
              Đã đọc tất cả
            </button>
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 font-sans">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 font-semibold">
                Chưa có thông báo mới nào.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => {
                    setIsOpen(false);
                    if (n.link) navigate(n.link);
                  }}
                  className={`p-3.5 hover:bg-slate-50 transition cursor-pointer space-y-1 ${
                    !n.read ? 'bg-amber-50/60 font-bold' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <h5 className="text-xs font-black text-slate-900 flex items-center space-x-1">
                      {isTeacher ? (
                        n.type === 'comment' ? <MessageSquare className="w-3.5 h-3.5 text-indigo-600" /> : <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      )}
                      <span>{n.title}</span>
                    </h5>
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium leading-relaxed">{n.message}</p>
                  {isTeacher && (n.type === 'user_registration' || n.id?.startsWith('unapproved_summary')) && (
                    <button
                      type="button"
                      onClick={async (e) => {
                        e.stopPropagation();
                        try {
                          await supabase.from('profiles').update({ approved: true }).eq('approved', false);
                          alert('✅ ĐÃ DUYỆT THÀNH CÔNG TÀI KHOẢN HỌC SINH MỚI!\n\nBây giờ học sinh có thể đăng nhập vào hệ thống làm bài bình thường!');
                          fetchNotifications();
                        } catch (err) {
                          alert('Lỗi duyệt: ' + err.message);
                        }
                      }}
                      className="mt-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-extrabold shadow-2xs transition flex items-center space-x-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5 text-white" />
                      <span>⚡ DUYỆT TẤT CẢ HỌC SINH MỚI NGAY</span>
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
