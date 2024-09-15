import axios from "axios";
import Swal from "sweetalert2";

const GENERAL_ERR_MSG = "There appears to be a problem right now. Please try again later.";

const interceptors = {
  setupInterceptors: (_history, toggleLoader) => {
    axios.interceptors.request.use((config) => {
      if (!config.preventLoading) toggleLoader(true);
      const token = localStorage.getItem("token");
      if (!config.headers["Content-Type"]) config.headers["Content-Type"] = "application/json";
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });

    axios.interceptors.response.use(
      (res) => {
        toggleLoader(false);
        return res;
      },
      (err) => {
        toggleLoader(false);

        if (err?.response?.data?.msg) {
          switch (err.response.status) {
            case 401:
            case 403:
              localStorage.clear();
              document.location.href = "/login";
              break;
            default:
              if (err.config.noPopUpErrorMsg) break;
              Swal.fire("", err.response.data.msg, "warning");
          }
        } else if (!err.config.noPopUpErrorMsg) {
          Swal.fire("", GENERAL_ERR_MSG, "warning");
        }

        if (!err.response) {
          err.response = { data: { success: false } };
        }

        return Promise.reject(err);
      }
    );
  }
};

export default interceptors;
