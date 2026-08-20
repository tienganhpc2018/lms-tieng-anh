import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, ExternalLink, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function NotificationBell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const bellRef = useRef(null);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      const list = data || [];
      setNotifications(list);
      setUnreadCount(list.filter((n) => !n.read).length);
    } catch (err) {}
  };

  useEffect(() => {
    fetchNotifications();

    // Listener Realtime
    const subscription = supabase
      .channel('notifications_realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
        if (payload.new && payload.new.user_id === user?.id) {
          fetchNotifications();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user]);

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

  const handleMarkAllRead = async () => {
    try {
      await supabase.from('notifications').update({ read: true }).eq('user_id', user.id);
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {}
  };

  return (
    <div className="relative" ref={bellRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition border border-slate-700 focus:outline-hidden"
        title="Thông báo dặn dò mới"
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
              <span>🔔 THÔNG BÁO DẶN DÒ TỪ THẦY HẢI</span>
            </h4>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[10px] font-bold text-indigo-600 hover:underline flex items-center space-x-0.5"
              >
                <Check className="w-3 h-3" />
                <span>Đánh dấu đã đọc</span>
              </button>
            )}
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
                    <h5 className="text-xs font-black text-slate-900">{n.title}</h5>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-rose-500 mt-1"></span>}
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium leading-relaxed">{n.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
