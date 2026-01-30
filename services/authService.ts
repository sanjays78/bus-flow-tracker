
import { auth } from './firebase';
import { GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, User } from 'firebase/auth';

const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async (): Promise<User | null> => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
    } catch (error) {
        console.error("Error signing in with Google", error);
        return null;
    }
};

export const logout = async () => {
    try {
        await firebaseSignOut(auth);
    } catch (error) {
        console.error("Error signing out", error);
    }
};
