import { getSupabase } from '@/lib/supabase/client';
import { UserRole, AppUser } from '@/types/user';

export interface AuthResult {
  success: boolean;
  error?: string;
  user?: any;
  userId?: string;
  redirectPath?: string;
  url?: string;
}

export class AuthService {

  static async registerWithEmail(
    email: string,
    password: string,
    displayName: string,
    role: string,
    companyName?: string
  ): Promise<AuthResult> {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, displayName, role, companyName }),
      });

      const data = await res.json();

      if (!data.success) {
        return { success: false, error: data.error || 'Registration failed' };
      }

      return { success: true, userId: data.user.id };
    } catch (error: any) {
      return { success: false, error: error.message || 'Registration failed' };
    }
  }

  static async loginWithEmail(email: string, password: string): Promise<AuthResult> {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) throw new Error(error.message);

      let role = await this.getUserRole(data.user.id);

      const adminRes = await fetch('/api/auth/admin/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: data.user.id, email }),
      });
      const adminResult = await adminRes.json();
      if (adminResult.isAdmin) role = 'admin';

      let redirectPath = `/influencer/${data.user.id}`;
      if (role === 'brand') redirectPath = `/brand/${data.user.id}`;
      if (role === 'admin') redirectPath = `/admin/${data.user.id}`;

      return { success: true, user: data.user, redirectPath };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async loginWithGoogle(role?: UserRole): Promise<AuthResult> {
    try {
      const supabase = getSupabase();

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: role ? { role } : undefined,
        },
      });

      if (error) throw new Error(error.message);

      return { success: true, url: data.url };
    } catch (error: any) {
      return { success: false, error: error.message || 'Google login failed' };
    }
  }

  static async getUserRole(userId: string): Promise<UserRole | null> {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      if (error || !data) {
        const { data: { user } } = await supabase.auth.getUser();
        const metadataRole = user?.user_metadata?.role;
        if (metadataRole === 'brand' || metadataRole === 'influencer') {
          return metadataRole;
        }
        return 'influencer';
      }

      return data.role as UserRole;
    } catch {
      return 'influencer';
    }
  }

  static async getUserData(userId: string): Promise<AppUser | null> {
    try {
      const supabase = getSupabase();

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          return {
            uid: user.id,
            email: user.email!,
            displayName: user.user_metadata?.display_name || 'User',
            photoURL: user.user_metadata?.avatar_url,
            role: user.user_metadata?.role || 'influencer',
            createdAt: new Date(user.created_at ?? Date.now()),
            updatedAt: new Date(user.updated_at ?? Date.now()),
            emailVerified: user.email_confirmed_at ? true : false,
          } as AppUser;
        }
        return null;
      }

      return {
        uid: data.id,
        email: data.email,
        displayName: data.display_name,
        photoURL: data.photo_url,
        role: data.role,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        emailVerified: data.email_verified,
      } as AppUser;
    } catch {
      return null;
    }
  }

  static async logout(): Promise<AuthResult> {
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
