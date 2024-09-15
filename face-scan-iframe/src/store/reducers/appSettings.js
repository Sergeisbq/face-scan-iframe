import { createSlice } from "@reduxjs/toolkit";

export const appSettings = createSlice({
  name: "appSettings",
  initialState: {
    loaderOn: false,
    // Demo video stuff
    demoVideoConditions: {
      lighting: false,
      distance: false,
      centered: false,
      movement: false
    },
    facialLandmarks: null,
    apiDocsSelectedOptions: {}
  },
  reducers: {
    setLoaderOn: (state) => {
      state.loaderOn = true;
    },
    setLoaderOff: (state) => {
      state.loaderOn = false;
    },
    // Demo video stuff
    updateDemoVideoConditions: (state, action) => {
      state.demoVideoConditions = action.payload;
    },
    updateFacialLandmarks: (state, action) => {
      state.facialLandmarks = action.payload;
    },
    updateApiDocsSelectedOptions: (state, action) => {
      state.apiDocsSelectedOptions = { ...state.apiDocsSelectedOptions, ...action.payload };
    }
  }
});

// Action creators are generated for each case reducer function
export const { setLoaderOn, setLoaderOff, updateDemoVideoConditions, updateFacialLandmarks, updateApiDocsSelectedOptions } =
  appSettings.actions;

export default appSettings.reducer;
