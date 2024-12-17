import axios from "axios";
import { endpoints } from "../config";

const assessmentServices = {
  getFaceScan: async (videoToken) => {
    const response = await axios.post(endpoints.faceScanEndpoint, { videoToken }).then((res) => res.data);
    return response;
  },
  validateVideoTokenOnIframeLoadEndpoint: async (videoToken) => {
    const response = await axios.post(endpoints.validateVideoTokenIframeLoadEndpoint, { videoToken }).then((res) => res.data);
    return response;
  },

  getIframeVoiceResults: async (videoToken, scanScoreId) => {
    const response = await axios
      .post(endpoints.getIframeVoiceResultsEndpoint, { videoToken, scanScoreId }, { preventLoading: true })
      .then((res) => res.data);
    return response;
  }
};

export default assessmentServices;
