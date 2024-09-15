import { configureStore } from "@reduxjs/toolkit";
import appSettingsReducer from "./reducers/appSettings";
import loggedInReducer from "./reducers/loggedIn";

export default configureStore({
  reducer: {
    appSettings: appSettingsReducer,
    loggedIn: loggedInReducer
  }
});
