import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Lấy Profile người dùng từ Supabase DB
  const fetchProfile = async (userId, userEmail) => {
    try {
      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // Chưa có profile -> tự động tạo profile mặc định
        const newRole = userEmail?.includes('teacher') ? 'teacher' : 'student';
        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert([
            {
              id: userId,
              email: userEmail,
              full_name: userEmail?.split('@')[0] || 'User',
              role: newRole,
            },
          ])
          .select()
          .single();

        if (!createError) {
          data = createdProfile;
        }
      }

      setProfile(data || null);
    } catch (err) {
      console.error('Lỗi lấy thông tin hồ sơ:', err.message);
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

  // Hàm Đăng ký tài khoản
  const signUp = async (email, password, fullName, role = 'student') => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
        },
      },
    });

    if (error) {
      setLoading(false);
      throw error;
    }

    if (data.user) {
      // Upsert profile
      await supabase.from('profiles').upsert([
        {
          id: data.user.id,
          email: email,
          full_name: fullName,
          role: role,
        },
      ]);
      await fetchProfile(data.user.id, email);
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

  const value = {
    user,
    profile,
    loading,
    isTeacher: profile?.role === 'teacher',
    isStudent: profile?.role === 'student',
    signUp,
    signIn,
    signOut,
    refreshProfile: () => user && fetchProfile(user.id, user.email),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
