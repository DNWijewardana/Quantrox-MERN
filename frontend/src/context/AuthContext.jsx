import { createContext, useContext, useEffect, useState, useCallback } from "react";
import axiosInstance from "../lib/axios";

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Re-fetches the current user from the server using the cookie token.
  // Returns true if logged in, false otherwise.
  const fetchUser = useCallback(async () => {
      try {
          const { data } = await axiosInstance.get("/api/user/data");
          if (data.success) {
              setUser(data.userData);
              return true;
          } else {
              setUser(null);
              return false;
          }
      } catch (error) {
          setUser(null);
          return false;
      }
  }, []);

  // On first mount, ask the backend who we are.
  useEffect(() => {
      (async () => {
          await fetchUser();
          setLoading(false);
      })();
  }, [fetchUser]);

  // Logout: tell the server to clear the cookie, then clear local state.
  const logout = async () => {
      try {
          await axiosInstance.post("/api/auth/logout");
      } catch (error) {
          // Even if the request fails, we clear local state.
          console.warn("Logout request failed:", error.message);
      }
      setUser(null);
  };

  return (
      <AuthContext.Provider value={{ user, loading, logout, fetchUser, setUser }}>
          {children}
      </AuthContext.Provider>
  );
}
