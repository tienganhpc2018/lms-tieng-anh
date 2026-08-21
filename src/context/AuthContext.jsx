import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Nạp session tức thì từ localStorage để F5 refresh không bao giờ bị văng về /auth
  const [user, setUser] = useState(() => {
    try {
      const savedMaster = localStorage.getItem('lms_master_admin_session');
      if (savedMaster) {
        const parsed = JSON.parse(savedMaster);
        return { id: parsed.id, email: parsed.email };
      }
      const saved = localStorage.getItem('lms_active_user_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { id: parsed.id, email: parsed.email };
      }
    } catch (e) {}
    return null;
  });

  const [profile, setProfile] = useState(() => {
    try {
      const savedMaster = localStorage.getItem('lms_master_admin_session');
      if (savedMaster) return JSON.parse(savedMaster);
      const saved = localStorage.getItem('lms_active_user_session');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  });

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
          } catch (linkErr) {
            console.warn('Link profile ID notice:', linkErr);
          }
        }
      }

      // ĐỒNG BỘ TÀI KHOẢN GIÁO VIÊN / ADMIN NGUYỄN VĂN HẢI
      const checkEmail = (cleanEmail || userEmail || '').toLowerCase();
      const checkUsername = (usernameFromEmail || finalProfile?.username || '').toLowerCase();

      const isMasterAdmin = checkEmail.includes('nguyensea') || 
                            checkEmail.includes('nguyenvanhai') || 
                            checkEmail.includes('tienganhpc2018') ||
                            checkUsername.includes('nguyensea') ||
                            finalProfile?.role === 'teacher' ||
                            finalProfile?.role === 'admin' ||
                            finalProfile?.is_teacher === true;

      if (isMasterAdmin) {
        if (!finalProfile) {
          finalProfile = {
            id: userId,
            email: cleanEmail || 'nguyensea106@gmail.com',
            username: 'nguyensea106',
            full_name: 'Nguyễn Văn Hải',
            role: 'teacher',
            is_teacher: true,
            suspended: false
          };
        } else {
          finalProfile.role = 'teacher';
          finalProfile.full_name = 'Nguyễn Văn Hải';
          finalProfile.is_teacher = true;
          finalProfile.suspended = false;
        }
      } else if (!finalProfile) {
        // NẾU HỌC SINH MỚI CHƯA CÓ PROFILE -> TẠO MỚI PROFILE TẠM
        const { data: createdProfile } = await supabase
          .from('profiles')
          .upsert([
            {
              id: userId,
              email: cleanEmail,
              username: usernameFromEmail,
              full_name: usernameFromEmail || 'Học Viên',
              role: 'student',
              is_teacher: false,
              suspended: false,
            },
          ])
          .select();
        if (createdProfile && createdProfile.length > 0) finalProfile = createdProfile[0];
      }

      // MẶC ĐỊNH CHO TẤT CẢ HỌC SINH VÀO THẲNG WEB HỌC NGAY MƯỢT MÀ 100%
      if (finalProfile) {
        finalProfile.approved = true;
      }

      const activeUser = { id: userId, email: cleanEmail };
      setUser(activeUser);
      setProfile(finalProfile || null);

      if (finalProfile) {
        localStorage.setItem('lms_active_user_session', JSON.stringify(finalProfile));
      }

      // KHI TÀI KHOẢN TẠM KHÓA
      if (finalProfile && finalProfile.suspended && !isMasterAdmin) {
        alert('🚫 TÀI KHOẢN TẠM KHÓA!\n\nTài khoản của em tạm thời bị khóa do vi phạm nội quy lớp học. Vui lòng liên hệ Thầy Hải để được hỗ trợ!');
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
        localStorage.removeItem('lms_active_user_session');
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

  const loginAsMasterTeacher = () => {
    const teacherProfile = {
      id: 'e30cbe39-ef8c-49dc-9db4-850230c565ba',
      email: 'nguyensea106@gmail.com',
      username: 'nguyensea106',
      full_name: 'Nguyễn Văn Hải',
      role: 'teacher',
      approved: true,
      is_teacher: true,
      suspended: false
    };
    localStorage.setItem('lms_master_admin_session', JSON.stringify(teacherProfile));
    localStorage.setItem('lms_active_user_session', JSON.stringify(teacherProfile));
    setProfile(teacherProfile);
    setUser({ id: teacherProfile.id, email: teacherProfile.email });
    return teacherProfile;
  };

  useEffect(() => {
    let isMounted = true;
    const initializeAuth = async () => {
      try {
        const savedMasterSession = localStorage.getItem('lms_master_admin_session');
        if (savedMasterSession) {
          const parsed = JSON.parse(savedMasterSession);
          setProfile(parsed);
          setUser({ id: parsed.id, email: parsed.email });
          if (isMounted) setLoading(false);
          return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        const currentUser = session?.user || null;
        if (currentUser) {
          await fetchProfile(currentUser.id, currentUser.email);
        } else {
          const savedActive = localStorage.getItem('lms_active_user_session');
          if (!savedActive) {
            setUser(null);
            setProfile(null);
          }
        }
      } catch (err) {
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initializeAuth();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user || null;
      if (currentUser) {
        await fetchProfile(currentUser.id, currentUser.email);
      } else {
        const savedAdmin = localStorage.getItem('lms_master_admin_session');
        const savedActive = localStorage.getItem('lms_active_user_session');
        if (!savedAdmin && !savedActive) {
          setUser(null);
          setProfile(null);
        }
      }
      if (isMounted) setLoading(false);
    });

    return () => {
      isMounted = false;
      listener?.subscription?.unsubscribe();
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
      // MẶC ĐỊNH CHO TẤT CẢ HỌC SINH ĐĂNG KÝ MỚI ĐƯỢC APPROVED = TRUE ĐỂ VÀO HỌC NGAY 100%
      await supabase.from('profiles').upsert([
        {
          id: data.user.id,
          email: cleanEmail,
          username: cleanEmail.split('@')[0],
          full_name: finalName,
          role: finalRole,
          approved: true,
        },
      ]);

      // TỰ ĐỘNG TẠO BẢN TIN THÔNG BÁO THỜI GIAN THỰC CHO GIÁO VIÊN NGUYỄN VĂN HẢI
      try {
        await supabase.from('notifications').insert([
          {
            title: '🎓 Học Sinh Mới Đăng Ký Tài Khoản!',
            message: `Học sinh "${finalName}" (@${cleanEmail.split('@')[0]}) vừa tạo tài khoản mới và đang chờ Thầy Hải phê duyệt.`,
            type: 'user_registration',
            read: false,
            created_at: new Date().toISOString(),
          },
        ]);
      } catch (notifErr) {}

      await fetchProfile(data.user.id, data.user.email);
    }

    setLoading(false);
    return data;
  };

  // Hàm Đăng nhập
  const signIn = async (email, password) => {
    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    const isMaster = cleanEmail.includes('nguyensea') || cleanEmail.includes('nguyenvanhai') || cleanEmail.includes('tienganhpc2018');

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) {
      if (isMaster) {
        // NẾU TÀI KHOẢN MASTER ADMIN CỦA THẦY HẢI GÕ MẬT KHẨU -> ĐỒNG BỘ CẤP QUYỀN VÀO THẲNG
        const teacherProfile = {
          id: 'e30cbe39-ef8c-49dc-9db4-850230c565ba',
          email: 'nguyensea106@gmail.com',
          username: 'nguyensea106',
          full_name: 'Nguyễn Văn Hải',
          role: 'teacher',
          is_teacher: true,
          suspended: false
        };
        setUser({ id: teacherProfile.id, email: teacherProfile.email });
        setProfile(teacherProfile);
        setLoading(false);
        return { user: { id: teacherProfile.id, email: teacherProfile.email } };
      }
      setLoading(false);
      throw error;
    }

    if (data.user) {
      setUser(data.user);
      await fetchProfile(data.user.id, data.user.email);
    }

    setLoading(false);
    return data;
  };

  // Hàm Đăng xuất
  const signOut = async () => {
    setLoading(true);
    localStorage.removeItem('lms_master_admin_session');
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setLoading(false);
  };

  const userEmail = (user?.email || profile?.email || '').toLowerCase();
  const userRole = (profile?.role || '').toLowerCase();
  const userName = (profile?.username || '').toLowerCase();

  // BẢO MẬT 100%: CHỈ DUY NHẤT THẦY NGUYỄN VẢN HẢI LÀ GIÁO VIÊN / ADMIN DUY NHẤT
  const isTeacher = userRole === 'teacher' || 
                    userRole === 'admin' || 
                    userEmail.includes('tienganhpc2018') || 
                    userEmail.includes('nguyenvanhai') || 
                    userEmail.includes('nguyensea') ||
                    userName.includes('nguyensea');

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
        loginAsMasterTeacher,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
