
import { NextResponse } from 'next/server';
import { auth, db } from '@/lib/firebase-admin';
import { doc, setDoc } from 'firebase/firestore';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ success: false, error: 'No Authorization header found' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    if (!token) {
        return NextResponse.json({ success: false, error: 'No token found' }, { status: 401 });
    }
    
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const businessInfo = await request.json();

    const docRef = doc(db, 'users', userId);
    await setDoc(docRef, businessInfo, { merge: true });

    return NextResponse.json({ success: true, message: 'Settings saved successfully' });
  } catch (error) {
    console.error('Error in /api/save-settings:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
