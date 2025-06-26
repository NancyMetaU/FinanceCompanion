import { createContext } from 'react';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useEffect, useState, useContext } from 'react';

const auth = getAuth();
const AuthContext = createContext();

// TODO: Add a loading state handling

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
