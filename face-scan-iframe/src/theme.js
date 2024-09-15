import { createTheme } from "@mui/material";
// import * as customColors from "./customColors";
const theme = createTheme({
  palette: {
    primary: {
      main: "#9FD39D"
      //   main: customColors.lightBlue
    },
    secondary: {
      main: "#fff",
      contrastText: "#fff"
    },
    text: {
      // primary: customColors.black
      // secondary: "#FFFFFF"
    },
    action: {
      //   active: customColors.gray,
      //   disabled: customColors.gray
    },
    cssInputLabel: {
      //   color: "#D3D3D3"
    }
  },
  components: {
    MuiSvgIcon: {
      styleOverrides: {
        root: {
          color: "#9FD39D"
        }
      }
    },

    MuiButton: {
      styleOverrides: {
        // Name of the slot
        root: {
          "&:hover": {
            backgroundColor: "#9FD39D",
            color: "#FFFFFF"
          },
          // Some CSS
          textTransform: "none"
        }
      }
    }
  }
});
export default theme;
