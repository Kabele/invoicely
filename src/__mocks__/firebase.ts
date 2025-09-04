export const auth = {
  onAuthStateChanged: jest.fn((callback) => {
    // Simulate a logged-in user
    callback({ uid: 'test-user-id', email: 'test@example.com' });
    return jest.fn(); // return unsubscribe function
  }),
  // Add other mocked auth functions if needed
};

export const db = {
  // Mock Firestore functions here
};

export const getAuth = jest.fn(() => auth);
export const getFirestore = jest.fn(() => db);
export const initializeApp = jest.fn();
export const getApp = jest.fn();
export const getApps = jest.fn(() => [{}]); // Simulate app already initialized
