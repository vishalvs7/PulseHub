// src/services/auth.service.ts
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  signOut,
  updateProfile,
  sendEmailVerification
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import type { AppUser, UserRole } from '@/types/user';

const googleProvider = new GoogleAuthProvider();

export class AuthService {
  // Register with email/password
  static async registerWithEmail(
    email: string, 
    password: string, 
    displayName: string,
    role: UserRole,
    companyName?: string
  ) {
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update display name
      await updateProfile(user, { displayName });

      // Send email verification
      await sendEmailVerification(user);

      // Create user data object
      const userData: any = {
        uid: user.uid,
        email: user.email,
        displayName,
        role,
        photoURL: user.photoURL || '',
        emailVerified: user.emailVerified,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Add role-specific fields
      if (role === 'brand') {
        userData.companyName = companyName || displayName;
        userData.industry = 'General';
        userData.companySize = '1-10';
      } else if (role === 'influencer') {
        userData.profileId = user.uid;
        userData.isVerified = false;
        userData.trustScore = 50; // Starting score
        userData.niche = ['Lifestyle'];
        userData.location = 'Unknown';
      }

      // Save to Firestore
      await setDoc(doc(db, 'users', user.uid), userData);

      // Create role-specific profile
      if (role === 'influencer') {
        await setDoc(doc(db, 'influencer_profiles', user.uid), {
          userId: user.uid,
          displayName,
          email: user.email,
          bio: 'New influencer on PulseHub',
          niche: ['Lifestyle'],
          location: 'Unknown',
          followers: {},
          engagementRate: 0,
          trustScore: 50,
          isVerified: false,
          connectedAccounts: {},
          analytics: {
            totalReach: 0,
            totalEngagement: 0,
            averageLikes: 0,
            averageComments: 0,
            postsThisMonth: 0,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      } else if (role === 'brand') {
        await setDoc(doc(db, 'brand_profiles', user.uid), {
          userId: user.uid,
          companyName: companyName || displayName,
          email: user.email,
          industry: 'General',
          companySize: '1-10',
          socialAccounts: {},
          campaigns: {
            active: 0,
            completed: 0,
            totalBudget: 0,
          },
          analytics: {
            totalReach: 0,
            engagementRate: 0,
            postsThisMonth: 0,
            newFollowers: 0,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      return { success: true, user: userData };
    } catch (error: any) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error.message || 'Registration failed' 
      };
    }
  }

  // Login with email/password
  static async loginWithEmail(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error: any) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.message || 'Login failed' 
      };
    }
  }

  // Login with Google
  static async loginWithGoogle(role: UserRole) {
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const user = userCredential.user;

      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        // Create new user document
        const userData: any = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || 'User',
          photoURL: user.photoURL || '',
          role,
          emailVerified: user.emailVerified,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Add role-specific fields
        if (role === 'brand') {
          userData.companyName = user.displayName || 'My Company';
          userData.industry = 'General';
          userData.companySize = '1-10';
        } else if (role === 'influencer') {
          userData.profileId = user.uid;
          userData.isVerified = false;
          userData.trustScore = 50;
          userData.niche = ['Lifestyle'];
          userData.location = 'Unknown';
        }

        await setDoc(doc(db, 'users', user.uid), userData);

        // Create role-specific profile
        if (role === 'influencer') {
          await setDoc(doc(db, 'influencer_profiles', user.uid), {
            userId: user.uid,
            displayName: user.displayName || 'Influencer',
            email: user.email,
            photoURL: user.photoURL,
            bio: 'New influencer on PulseHub',
            niche: ['Lifestyle'],
            location: 'Unknown',
            followers: {},
            engagementRate: 0,
            trustScore: 50,
            isVerified: false,
            connectedAccounts: {},
            analytics: {
              totalReach: 0,
              totalEngagement: 0,
              averageLikes: 0,
              averageComments: 0,
              postsThisMonth: 0,
            },
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        } else if (role === 'brand') {
          await setDoc(doc(db, 'brand_profiles', user.uid), {
            userId: user.uid,
            companyName: user.displayName || 'My Company',
            email: user.email,
            industry: 'General',
            companySize: '1-10',
            socialAccounts: {},
            campaigns: {
              active: 0,
              completed: 0,
              totalBudget: 0,
            },
            analytics: {
              totalReach: 0,
              engagementRate: 0,
              postsThisMonth: 0,
              newFollowers: 0,
            },
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      }

      return { success: true, user };
    } catch (error: any) {
      console.error('Google login error:', error);
      return { 
        success: false, 
        error: error.message || 'Google login failed' 
      };
    }
  }

  // Logout
  static async logout() {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Get current user data from Firestore
  static async getCurrentUser(uid: string) {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return { success: true, data: userDoc.data() as AppUser };
      }
      return { success: false, error: 'User not found' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}