// src/services/auth.service.ts
import { getSupabase } from '@/lib/supabase/client';
import { UserRole, AppUser, InfluencerUser, BrandUser } from '@/types/user';

export class AuthService {
  // Hardcoded admin credentials
  static readonly ADMIN_EMAIL = 'admin@pulsehub.com';
  static readonly ADMIN_PASSWORD = 'Admin@123';

  // Register with email/password
 

static async registerWithEmail(
  email: string,
  password: string,
  displayName: string,
  role: string,
  companyName?: string
) {
  try {
    const supabase = getSupabase();

    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
          role: role,
        },
      },
    });

    if (signUpError) throw new Error(signUpError.message);

    if (!authData.user) {
      return { success: false, error: 'Failed to create user' };
    }

    const userId = authData.user.id;

    // Insert into users table
    const userData = {
      id: userId,
      email: email,
      display_name: displayName,
      role: role,
      photo_url: null,
      email_verified: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await supabase.from('users').insert([userData]);

    // Create role-specific profile
    if (role === 'influencer') {
      await supabase.from('influencer_profiles').insert([{
        user_id: userId,
        display_name: displayName,
        email: email,
        bio: 'New influencer on PulseHub',
        niche: ['Lifestyle'],
        location: 'Unknown',
        followers_count: 0,
        engagement_rate: 0,
        trust_score: 50,
        is_verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }]);
    } else if (role === 'brand') {
      await supabase.from('brand_profiles').insert([{
        user_id: userId,
        company_name: companyName || displayName,
        email: email,
        industry: 'General',
        company_size: '1-10',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }]);
    }

    return { success: true, user: authData.user, userId };
  } catch (error: any) {
    console.error('Registration error:', error);
    return { success: false, error: error.message || 'Registration failed' };
  }
}

  //  Update loginWithEmail method

// In loginWithEmail method, add console logs:
static async loginWithEmail(email: string, password: string) {
  console.log('🔐 Login attempt:', email);
  
  try {
    // Check for hardcoded admin
    if (email === this.ADMIN_EMAIL && password === this.ADMIN_PASSWORD) {
      console.log('✅ Admin login success');
      return {
        success: true,
        user: { id: 'admin-001', email: this.ADMIN_EMAIL },
        redirectPath: '/admin/admin-001',
      };
    }

    const supabase = getSupabase();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      console.log('❌ Supabase login error:', error.message);
      throw new Error(error.message);
    }

    console.log('✅ Supabase login success, user ID:', data.user.id);

    // Get user role
    const role = await this.getUserRole(data.user.id);
    console.log('📋 User role:', role);
    
    let redirectPath = `/influencer/${data.user.id}`;
    if (role === 'brand') redirectPath = `/brand/${data.user.id}`;
    if (role === 'admin') redirectPath = '/admin/admin-001';
    
    console.log('🔄 Redirecting to:', redirectPath);
    
    return { success: true, user: data.user, redirectPath };
  } catch (error: any) {
    console.error('Login error:', error);
    return { success: false, error: error.message };
  }
}

  // Login with Google
  static async loginWithGoogle(role?: UserRole) {
    try {
      const supabase = getSupabase();

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: role ? { role } : undefined,
        },
      });

      if (error) throw new Error(error.message);

      return { success: true, user: data.user };
    } catch (error: any) {
      console.error('Google login error:', error);
      return { success: false, error: error.message || 'Google login failed' };
    }
  }

  // Get current user role (simplified for now)
  static async getUserRole(userId: string): Promise<UserRole | null> {
    try {
      // Check if admin
      if (userId === 'admin-001') {
        return 'admin';
      }

      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) {
        // If table doesn't exist, return default role based on user metadata
        const { data: { user } } = await supabase.auth.getUser();
        const metadataRole = user?.user_metadata?.role;
        if (metadataRole === 'brand' || metadataRole === 'influencer') {
          return metadataRole;
        }
        return 'influencer'; // default
      }

      return data?.role as UserRole;
    } catch (error) {
      console.error('Error getting user role:', error);
      return 'influencer'; // default fallback
    }
  }

  // Get user data from Supabase (simplified)
  static async getUserData(userId: string): Promise<AppUser | null> {
    try {
      // Check for admin
      if (userId === 'admin-001') {
        return {
          uid: 'admin-001',
          email: this.ADMIN_EMAIL,
          displayName: 'Admin User',
          role: 'admin',
          createdAt: new Date(),
          updatedAt: new Date(),
          emailVerified: true,
        } as unknown as AppUser;
      }

      const supabase = getSupabase();
      
      // Try to get from users table
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) {
        // Fallback: get from auth metadata
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          return {
            uid: user.id,
            email: user.email!,
            displayName: user.user_metadata?.display_name || 'User',
            photoURL: user.user_metadata?.avatar_url,
            role: user.user_metadata?.role || 'influencer',
            createdAt: new Date(user.created_at),
            updatedAt: new Date(user.updated_at),
            emailVerified: user.email_confirmed_at ? true : false,
          } as AppUser;
        }
        return null;
      }

      // Convert to AppUser format
      const userData: AppUser = {
        uid: data.id,
        email: data.email,
        displayName: data.display_name,
        photoURL: data.photo_url,
        role: data.role,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        emailVerified: data.email_verified,
      } as AppUser;

      return userData;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  // Logout
  static async logout() {
    try {
      const supabase = getSupabase();
      const { error } = await supabase.auth.signOut();
      if (error) throw new Error(error.message);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}