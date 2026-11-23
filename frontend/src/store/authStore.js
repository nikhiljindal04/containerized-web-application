import { create } from "zustand";

const getInitialUser = () => {
  try {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    return null;
  }
};

const getInitialToken = () => {
  try {
    return localStorage.getItem("token") || null;
  } catch (e) {
    return null;
  }
};

export const useAuthStore = create((set) => ({
  user: getInitialUser(),
  token: getInitialToken(),
  isAuthenticated: !!getInitialToken(),

  setAuth: (user, token) => {
    if (token) {
      localStorage.setItem("token", token);
    }
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }
    set({ user, token, isAuthenticated: !!token });
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
