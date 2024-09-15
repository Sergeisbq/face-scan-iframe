import { createSlice } from "@reduxjs/toolkit";

export const loggedIn = createSlice({
  name: "loggedIn",
  initialState: {
    isLoggedIn: localStorage.getItem("isLoggedin") === "true",
    isAdmin: localStorage.getItem("role") === "admin"
  },
  reducers: {
    setLoggedIn: (state, action) => {
      state.isLoggedIn = true;
      if (action.payload.role === "admin") {
        state.isAdmin = true;
      } else {
        state.isAdmin = false;
      }
      localStorage.setItem("isLoggedin", "true");
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("role", action.payload.role);
    },
    setLoggedOut: (state) => {
      state.isLoggedIn = false;
      state.isAdmin = false;
      localStorage.removeItem("isLoggedin");
      localStorage.removeItem("token");
      localStorage.removeItem("role");
    }
  }
});

// Action creators are generated for each case reducer function
export const { setLoggedIn, setLoggedOut } = loggedIn.actions;

export default loggedIn.reducer;
