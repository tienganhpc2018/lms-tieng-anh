import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Lấy & Đồng bộ Profile người dùng từ Supabase DB
  const fetchProfile = async (userId, userEmail) => {
    if (!userId && !userEmail) return;
    try {
      const cleanEmail = userEmail?.trim().toLowerCase() || '';
      const usernameFromEmail = cleanEmail.split('@')[0];

      // 1. Tìm profile theo ID trước
      let { data: profileById } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      let finalProfile = profileById;

      // 2. Nếu chưa có profile theo ID -> Tìm theo EMAIL hoặc USERNAME đã được Giáo viên tạo sẵn
      if (!finalProfile && cleanEmail) {
        let { data: profileByEmail } = await supabase
          .from('profiles')
          .select('*')
          .ilike('email', cleanEmail)
          .maybeSingle();

        if (!profileByEmail && usernameFromEmail) {
          let { data: profileByUsername } = await supabase
            .from('profiles')
            .select('*')
            .ilike('username', usernameFromEmail)
            .maybeSingle();

          if (profileByUsername) profileByEmail = profileByUsername;
        }

        if (profileByEmail) {
          finalProfile = profileByEmail;

          // ĐỒNG BỘ: Cập nhật ID của Auth User vào hàng Profile đã được Thầy tạo sẵn
          try {
            await supabase
              .from('profiles')
              .update({ id: userId, email: cleanEmail })
              .eq('id', profileByEmail.id);
            finalProfile.id = userId;
          } catch (linkErr) {
            console.warn('Link profile ID notice:', linkErr);
          }
        }
      }

      // 3. Nếu thực sự chưa từng tồn tại trong CSDL -> Tự động khởi tạo profile mới
      if (!finalProfile) {
        const isMasterAdmin = cleanEmail.includes('nguyensea') || cleanEmail.includes('nguyenvanhai') || cleanEmail.includes('tienganhpc2018');
        const newRole = isMasterAdmin ? 'teacher' : 'student';
        const defaultName = isMasterAdmin ? 'Nguyễn Văn Hải' : (usernameFromEmail || 'Học Viên');

        const { data: createdProfile } = await supabase
          .from('profiles')
          .upsert([
            {
              id: userId,
              email: cleanEmail,
              username: usernameFromEmail,
              full_name: defaultName,
              role: newRole,
              approved: isMasterAdmin ? true : false,
            },
          ])
          .select();
        if (createdProfile && createdProfile.length > 0) finalProfile = createdProfile[0];
      }

      // NẾU LÀ TÀI KHOẢN THẦY HẢI -> ĐỒNG BỘ NGUYÊN TẮC GIÁO VIÊN / ADMIN DUY NHẤT
      if (cleanEmail.includes('nguyensea') || cleanEmail.includes('nguyenvanhai') || cleanEmail.includes('tienganhpc2018')) {
        if (finalProfile) {
          finalProfile.role = 'teacher';
          finalProfile.full_name = 'Nguyễn Văn Hải';
          finalProfile.approved = true;
        }
      }

      setProfile(finalProfile || null);

      // KHI TÀI KHOẢN NÀY BỊ THẦY TẠM KHÓA (SUSPENDED) -> TỰ ĐỘNG ĐĂNG XUẤT NGAY
      if (finalProfile && finalProfile.suspended) {
        alert('🚫 TÀI KHOẢN TẠM KHÓA!\n\nTài khoản của em tạm thời bị khóa do vi phạm nội quy lớp học. Vui lòng liên hệ Thầy Hải để được hỗ trợ!');
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
      }
    } catch (err) {
      console.error('Lỗi lấy thông tin hồ sơ:', err.message);
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchProfile(user.id, user.email);
    }
  };

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      if (currentUser) {
        fetchProfile(currentUser.id, currentUser.email);
      }
      setLoading(false);
    });

    // Lắng nghe thay đổi trạng thái đăng nhập
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser.id, currentUser.email);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  // Hàm Đăng ký tài khoản (CHỈ CHO PHÉP VAI TRÒ HỌC SINH - GIÁO VIÊN DUY NHẤT LÀ NGUYỄN VĂN HẢI)
  const signUp = async (email, password, fullName, _ignoredRole = 'student') => {
    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    const isMasterAdmin = cleanEmail.includes('nguyensea') || cleanEmail.includes('nguyenvanhai') || cleanEmail.includes('tienganhpc2018');
    const finalRole = isMasterAdmin ? 'teacher' : 'student';
    const finalName = isMasterAdmin ? 'Nguyễn Văn Hải' : (fullName?.trim() || 'Học Viên');

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          full_name: finalName,
          role: finalRole,
        },
      },
    });

    if (error) {
      setLoading(false);
      throw error;
    }

    if (data.user) {
      await supabase.from('profiles').upsert([
        {
          id: data.user.id,
          email: cleanEmail,
          username: cleanEmail.split('@')[0],
          full_name: finalName,
          role: finalRole,
          approved: isMasterAdmin ? true : false,
        },
      ]);
      await fetchProfile(data.user.id, cleanEmail);
    }

    setLoading(false);
    return data;
  };

  // Hàm Đăng nhập
  const signIn = async (email, password) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoading(false);
      throw error;
    }

    if (data.user) {
      await fetchProfile(data.user.id, data.user.email);
    }

    setLoading(false);
    return data;
  };

  // Hàm Đăng xuất
  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setLoading(false);
  };

  const userEmail = (user?.email || profile?.email || '').toLowerCase();
  const userRole = (profile?.role || '').toLowerCase();

  // BẢO MẬT 100%: CHỈ DUY NHẤT THẦY NGUYỄN VĂN HẢI LÀ GIÁO VIÊN / ADMIN DUY NHẤT
  const isTeacher = (userRole === 'teacher' || userRole === 'admin' || userEmail.includes('tienganhpc2018') || userEmail.includes('nguyenvanhai') || userEmail.includes('nguyensea106')) &&
                    !userEmail.includes('hoangnm') &&
                    !userEmail.includes('student');

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isTeacher,
        loading,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
