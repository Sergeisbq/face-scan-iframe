import { ThemeProvider } from "@mui/material";
import theme from "./theme";
import { Provider } from "react-redux";
import store from "./store/store";
import InterceptorsComponent from "../src/sessions/interceptorsComponent";
import { SnackbarProvider } from "notistack";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import "./assets/css/App.css";
import "./assets/css/demoAssessments.css";
import "./assets/css/widgets.css";
import FaceScanMainContainer from "./components/faceScan/FaceScanMainContainer";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Provider store={store}>
        <InterceptorsComponent />
        <SnackbarProvider />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<FaceScanMainContainer />} />
          </Routes>
        </BrowserRouter>
      </Provider>
    </ThemeProvider>
  );
}
export default App;
