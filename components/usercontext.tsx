import React, { createContext, useState, useContext, ReactNode } from 'react';

type UserContextType = {
  username: string | null;
  setUsername: (username: string) => void;
  profilePicture: string | null;
  setProfilePicture: (uri: string) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [username, setUsername] = useState<string | null>(null); 
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  return (
    <UserContext.Provider value={{ username, setUsername, profilePicture, setProfilePicture }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
