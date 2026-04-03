// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  // HARDCODED ADMIN WHITELIST - Secure alternative to database query
  // This avoids RLS/database issues while maintaining security
  const ADMIN_WHITELIST = {
    'bahdrhymez123@gmail.com': { role: 'super_admin', display_name: 'Super Admin' },
    'franklinasarewiafe@gmail.com': { role: 'super_admin', display_name: 'Franklin Asare' },
    'phyllisdillys@gmail.com': { role: 'admin', display_name: 'Phyllis Dillys' },
  };

  // Check if user is in admin whitelist - SECURE
  const checkAdminStatus = async (email) => {
    console.log('Checking admin status for:', email);
    
    const emailLower = email.toLowerCase();
    const adminData = ADMIN_WHITELIST[emailLower];
    
    if (adminData) {
      console.log('Admin user found in whitelist:', adminData);
      setAdminUser({ email: emailLower, ...adminData });
      setIsAdmin(true);
      setIsSuperAdmin(adminData.role === 'super_admin');
      return true;
    }
    
    // Not in whitelist - deny access
    console.log('Admin access denied - email not in whitelist');
    setAdminUser(null);
    setIsAdmin(false);
    setIsSuperAdmin(false);
    return false;
  };

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        // Get current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        }

        // If there's a session, user is already logged in
        if (session?.user && mounted) {
          setUser(session.user);
          setIsAuthenticated(true);
          await checkAdminStatus(session.user.email);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        // Always set loading to false
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    // Safety timeout to prevent infinite loading
    const safetyTimeout = setTimeout(() => {
      if (mounted && loading) {
        console.warn("Auth initialization timed out, forcing loading to false");
        setLoading(false);
      }
    }, 3000);

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        console.log('Auth state changed:', event);
        
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          setIsAuthenticated(true);
          await checkAdminStatus(session.user.email);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setAdminUser(null);
          setIsAuthenticated(false);
          setIsAdmin(false);
          setIsSuperAdmin(false);
        }
      }
    );

    return () => {
      mounted = false;
      clearTimeout(safetyTimeout);
      subscription?.unsubscribe();
    };
  }, []);

  // Inactivity Timer - DISABLED for development
  // TODO: Re-enable once auth is stable
  /*
  useEffect(() => {
    if (!isAuthenticated) return;

    let inactivityTimer;

    const logoutUser = async () => {
      console.log("Auto-logging out due to inactivity...");
      await signOut();
    };

    const resetTimer = () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(logoutUser, 300000); // 5 minutes
    };

    // Events to track activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    // Set initial timer
    resetTimer();

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, resetTimer);
    });

    return () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      events.forEach(event => {
        document.removeEventListener(event, resetTimer);
      });
    };
  }, [isAuthenticated]);
  */

  // Sign in with email and password
  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // Check if user is in admin_users table
      const isAdminUser = await checkAdminStatus(email);
      
      if (!isAdminUser) {
        // Sign out if not an admin
        await supabase.auth.signOut();
        return { 
          success: false, 
          error: 'Access denied. You are not authorized to access the admin dashboard.' 
        };
      }

      setUser(data.user);
      setIsAuthenticated(true);
      return { success: true, data };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setAdminUser(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
      setIsSuperAdmin(false);
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return { success: false, error: error.message };
    }
  };

  // Add a new admin (super admin only)
  const addAdmin = async (email, displayName, role = 'admin') => {
    if (!isSuperAdmin) {
      return { success: false, error: 'Only super admins can add new admins' };
    }

    try {
      const { data, error } = await supabase
        .from('admin_users')
        .insert({
          email: email.toLowerCase(),
          display_name: displayName,
          role: role,
          created_by: adminUser?.id,
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Add admin error:', error);
      return { success: false, error: 'Failed to add admin' };
    }
  };

  // Remove an admin (super admin only)
  const removeAdmin = async (adminId) => {
    if (!isSuperAdmin) {
      return { success: false, error: 'Only super admins can remove admins' };
    }

    try {
      const { error } = await supabase
        .from('admin_users')
        .update({ is_active: false })
        .eq('id', adminId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Remove admin error:', error);
      return { success: false, error: 'Failed to remove admin' };
    }
  };

  // Get all admin users (for admin management page)
  const getAdminUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Get admin users error:', error);
      return { success: false, error: 'Failed to fetch admin users' };
    }
  };

  const value = {
    user,
    adminUser,
    loading,
    isAuthenticated,
    isAdmin,
    isSuperAdmin,
    signIn,
    signOut,
    addAdmin,
    removeAdmin,
    getAdminUsers,
    checkAdminStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};


