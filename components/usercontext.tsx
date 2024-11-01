import React, { createContext, useState, useContext, ReactNode } from 'react';

// Create a context for managing user information.
const UserContext = createContext<UserContext | undefined>(undefined);

/**
 * UserContext type defines the structure for user-related data in context.
 */
export type UserContext = {
  username: string | null;
  setUsername: (username: string) => void;
  profilePicture: string | null;
  setProfilePicture: (uri: string) => void;
};

/**
 * UserProvider component that provides user context to its children.
 * Manages and supplies username and profile picture information across the app.
 * 
 * @param {Object} props - Component props.
 * @param {ReactNode} props.children - Components that require access to user data.
 * @returns {JSX.Element} Context provider for user information.
 */
export const UserProvider = ({ children }: { children: ReactNode }) => {
  // State to manage the username and profile picture
  const [username, setUsername] = useState<string | null>(null); 
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  return (
    <UserContext.Provider value={{ username, setUsername, profilePicture, setProfilePicture }}>
      {children}
    </UserContext.Provider>
  );
};

/**
 * Custom hook to access user context.
 * Throws an error if used outside of a UserProvider.
 * 
 * @returns {UserContext} The context value with user data and setters.
 * @throws Will throw an error if `useUser` is not wrapped within a `UserProvider`.
 */
export const useUser = (): UserContext => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
