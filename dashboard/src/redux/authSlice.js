import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  token: null,
  user: null,
  roleAndPermission: null,
  isAuthChecked: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // ✅ Login and persist to localStorage
    login: (state, action) => {
      const { token, user, roleAndPermission } = action.payload;

      state.token = token;
      state.user = user;
      state.roleAndPermission = roleAndPermission;
      state.isAuthChecked = true;

      localStorage.setItem(
        "authData",
        JSON.stringify({ token, user, roleAndPermission })
      );
    },

    // ✅ Logout and clear data
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.roleAndPermission = null;
      state.isAuthChecked = true;

      localStorage.removeItem("authData");
    },

    // ✅ Load persisted session on app refresh
    loadUserFromStorage: (state) => {
      const savedData = localStorage.getItem("authData");

      if (savedData) {
        const parsedData = JSON.parse(savedData);
        state.token = parsedData.token;
        state.user = parsedData.user;
        state.roleAndPermission = parsedData.roleAndPermission;
      }

      state.isAuthChecked = true;
    },
  },
});

export const { login, logout, loadUserFromStorage } = authSlice.actions;
export default authSlice.reducer;
